import "dotenv/config";

import { inArray, sql as drizzleSql } from "drizzle-orm";
import {
  cartToLecture,
  captionTracks,
  curriculumSections,
  curriculums,
  db,
  dubTracks,
  enrollmentRequests,
  files,
  lectures,
  likes,
  paymentOrders,
  payments,
  purchases,
  reviews,
  sql as dbSql,
  users,
  videos,
} from "../src/db";
import { getMockCoursesWithEnrollmentStatus } from "../src/lib/mock-courses";

const mockCourses = getMockCoursesWithEnrollmentStatus();
const lectureIds = mockCourses.map((course) => course.id);
const studentCount = Math.max(
  80,
  ...mockCourses.map((course) =>
    Math.max(course.purchaseCount, course.reviewCount, course.likeCount, course.enrollmentAppliedCount),
  ),
) + 24;

function asDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function addDays(value: string | Date, days: number) {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function chunks<T>(items: T[], size = 500) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function ratingForTargetAverage(targetAverage: number, total: number, index: number) {
  const fiveStarCount = Math.max(0, Math.min(total, Math.round((targetAverage - 4) * total)));
  return index < fiveStarCount ? 5 : 4;
}

const reviewTexts = [
  "실제 운영 흐름까지 같이 보여줘서 바로 적용할 수 있었습니다.",
  "커리큘럼이 촘촘하고 예제가 현실적이라 끝까지 따라가기 좋았습니다.",
  "가격 대비 분량과 자료 구성이 탄탄합니다. 다음 시즌도 기대됩니다.",
  "막연했던 부분이 신청, 승인, 운영 단위로 정리됐습니다.",
  "초기 서비스 운영자에게 필요한 판단 기준을 많이 얻었습니다.",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const result = await db.transaction(async (tx) => {
    const now = new Date();

    const existingCurriculums = await tx
      .select({ id: curriculums.id })
      .from(curriculums)
      .where(inArray(curriculums.lectureId, lectureIds));
    const curriculumIds = existingCurriculums.map((row) => row.id);

    const existingSections = curriculumIds.length
      ? await tx
          .select({ id: curriculumSections.id })
          .from(curriculumSections)
          .where(inArray(curriculumSections.curriculumId, curriculumIds))
      : [];
    const sectionIds = existingSections.map((row) => row.id);

    const existingVideos = sectionIds.length
      ? await tx.select({ id: videos.id }).from(videos).where(inArray(videos.curriculumSectionId, sectionIds))
      : [];
    const videoIds = existingVideos.map((row) => row.id);

    const existingOrders = await tx
      .select({ orderId: paymentOrders.orderId })
      .from(paymentOrders)
      .where(inArray(paymentOrders.lectureId, lectureIds));
    const orderIds = existingOrders.map((row) => row.orderId);

    if (videoIds.length) {
      await tx.delete(captionTracks).where(inArray(captionTracks.videoId, videoIds));
      await tx.delete(dubTracks).where(inArray(dubTracks.videoId, videoIds));
    }
    if (orderIds.length) {
      await tx.delete(payments).where(inArray(payments.orderId, orderIds));
    }
    if (sectionIds.length) {
      await tx.delete(videos).where(inArray(videos.curriculumSectionId, sectionIds));
      await tx.delete(files).where(inArray(files.curriculumSectionId, sectionIds));
      await tx.delete(curriculumSections).where(inArray(curriculumSections.id, sectionIds));
    }
    if (curriculumIds.length) {
      await tx.delete(curriculums).where(inArray(curriculums.id, curriculumIds));
    }

    await tx.delete(enrollmentRequests).where(inArray(enrollmentRequests.lectureId, lectureIds));
    await tx.delete(purchases).where(inArray(purchases.lectureId, lectureIds));
    await tx.delete(reviews).where(inArray(reviews.lectureId, lectureIds));
    await tx.delete(likes).where(inArray(likes.lectureId, lectureIds));
    await tx.delete(cartToLecture).where(inArray(cartToLecture.lectureId, lectureIds));
    await tx.delete(paymentOrders).where(inArray(paymentOrders.lectureId, lectureIds));
    await tx.delete(lectures).where(inArray(lectures.id, lectureIds));

    const teacherRows = await tx
      .insert(users)
      .values(
        mockCourses.map((course) => ({
          email: course.instructor.email,
          nickname: course.instructor.nickname,
          profileImageUrl: course.instructor.profileImageUrl ?? "/avatar.png",
          description: `${course.title} 강사`,
          role: "TEACHER" as const,
          firebaseUid: `seed-teacher-${course.instructor.id}`,
          isVerified: true,
          settlementBankName: "신한은행",
          settlementAccountNumber: `110-${String(course.instructor.id).slice(-4)}-000000`,
          settlementAccountHolder: course.instructor.nickname,
          createdAt: asDate(course.createdAt) ?? now,
          updatedAt: now,
        })),
      )
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          email: drizzleSql`excluded."email"`,
          nickname: drizzleSql`excluded."nickname"`,
          profileImageUrl: drizzleSql`excluded."profileImageUrl"`,
          description: drizzleSql`excluded."description"`,
          role: drizzleSql`excluded."role"`,
          isVerified: drizzleSql`excluded."isVerified"`,
          settlementBankName: drizzleSql`excluded."settlementBankName"`,
          settlementAccountNumber: drizzleSql`excluded."settlementAccountNumber"`,
          settlementAccountHolder: drizzleSql`excluded."settlementAccountHolder"`,
          updatedAt: now,
        },
      })
      .returning({ id: users.id, firebaseUid: users.firebaseUid });

    const teacherIdByLegacyId = new Map<number, number>();
    for (const row of teacherRows) {
      const legacyId = Number(row.firebaseUid.replace("seed-teacher-", ""));
      teacherIdByLegacyId.set(legacyId, row.id);
    }

    const studentRows: { id: number; firebaseUid: string }[] = [];
    for (const batch of chunks(
      Array.from({ length: studentCount }, (_, index) => {
        const n = index + 1;
        return {
          email: `student${String(n).padStart(4, "0")}@seed.lingoost.local`,
          nickname: `수강생 ${String(n).padStart(3, "0")}`,
          role: "STUDENT" as const,
          firebaseUid: `seed-student-${n}`,
          isVerified: true,
          createdAt: addDays("2026-04-01T00:00:00.000Z", index % 35),
          updatedAt: now,
        };
      }),
      300,
    )) {
      const inserted = await tx
        .insert(users)
        .values(batch)
        .onConflictDoUpdate({
          target: users.firebaseUid,
          set: {
            email: drizzleSql`excluded."email"`,
            nickname: drizzleSql`excluded."nickname"`,
            role: drizzleSql`excluded."role"`,
            isVerified: drizzleSql`excluded."isVerified"`,
            updatedAt: now,
          },
        })
        .returning({ id: users.id, firebaseUid: users.firebaseUid });
      studentRows.push(...inserted);
    }

    const studentIdByUid = new Map(studentRows.map((row) => [row.firebaseUid, row.id]));
    const studentIds = Array.from({ length: studentCount }, (_, index) => studentIdByUid.get(`seed-student-${index + 1}`));
    if (studentIds.some((id) => typeof id !== "number")) {
      throw new Error("Failed to resolve seeded student ids");
    }
    const resolvedStudentIds = studentIds as number[];

    await tx.insert(lectures).values(
      mockCourses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        level: course.level,
        languageCode: course.languageCode,
        tags: course.tags,
        seoKeywords: course.seoKeywords,
        targetAudience: course.targetAudience,
        requirements: course.requirements,
        learningOutcomes: course.learningOutcomes,
        metaTitle: course.metaTitle,
        metaDescription: course.metaDescription,
        ogImageUrl: course.ogImageUrl,
        canonicalUrl: course.canonicalUrl,
        platformFeeRateBps: 0,
        enrollmentOpen: course.enrollmentOpen,
        enrollmentStartAt: asDate(course.enrollmentStartAt),
        enrollmentEndAt: asDate(course.enrollmentEndAt),
        enrollmentCapacity: course.enrollmentCapacity,
        price: course.price,
        discountPrice: course.discountPrice,
        isActive: true,
        imageUrl: course.imageUrl,
        createdAt: asDate(course.createdAt) ?? now,
        updatedAt: asDate(course.lastUpdatedAt) ?? now,
        instructorId: teacherIdByLegacyId.get(course.instructor.id) ?? null,
      })),
    );

    for (const course of mockCourses) {
      const moduleTitles = [...new Set(course.sections.map((section) => section.moduleTitle))];
      const curriculumIdByModule = new Map<string, number>();
      for (const moduleTitle of moduleTitles) {
        const [curriculum] = await tx
          .insert(curriculums)
          .values({
            lectureId: course.id,
            createdAt: asDate(course.createdAt) ?? now,
            updatedAt: asDate(course.lastUpdatedAt) ?? now,
          })
          .returning({ id: curriculums.id });
        curriculumIdByModule.set(moduleTitle, curriculum.id);
      }

      await tx.insert(curriculumSections).values(
        course.sections.map((section, index) => ({
          title: section.title,
          description: section.description,
          moduleTitle: section.moduleTitle,
          position: index + 1,
          durationSeconds: section.durationSeconds,
          resources: section.resources ?? [],
          isActive: section.active,
          curriculumId: curriculumIdByModule.get(section.moduleTitle) ?? null,
          createdAt: asDate(course.createdAt) ?? now,
          updatedAt: asDate(course.lastUpdatedAt) ?? now,
        })),
      );
    }

    const purchaseRows = mockCourses.flatMap((course, courseIndex) =>
      Array.from({ length: course.purchaseCount }, (_, index) => ({
        userId: resolvedStudentIds[(index + courseIndex * 97) % resolvedStudentIds.length],
        lectureId: course.id,
        progress: Math.round(((index % 11) / 10) * 100) / 100,
        createdAt: addDays(course.createdAt, index % 50),
        updatedAt: now,
      })),
    );
    for (const batch of chunks(purchaseRows, 500)) {
      await tx.insert(purchases).values(batch).onConflictDoNothing({
        target: [purchases.userId, purchases.lectureId],
      });
    }

    const likeRows = mockCourses.flatMap((course, courseIndex) =>
      Array.from({ length: course.likeCount }, (_, index) => ({
        userId: resolvedStudentIds[(index + courseIndex * 53) % resolvedStudentIds.length],
        lectureId: course.id,
        createdAt: addDays(course.createdAt, index % 30),
        updatedAt: now,
      })),
    );
    for (const batch of chunks(likeRows, 500)) {
      await tx.insert(likes).values(batch);
    }

    const reviewRows = mockCourses.flatMap((course, courseIndex) =>
      Array.from({ length: course.reviewCount }, (_, index) => ({
        userId: resolvedStudentIds[(index + courseIndex * 41) % resolvedStudentIds.length],
        lectureId: course.id,
        rating: ratingForTargetAverage(course.avgRating, course.reviewCount, index),
        content: `${reviewTexts[index % reviewTexts.length]} (${course.title})`,
        isDeleted: false,
        parentId: null,
        createdAt: addDays(course.createdAt, index % 60),
        updatedAt: now,
      })),
    );
    for (const batch of chunks(reviewRows, 300)) {
      await tx.insert(reviews).values(batch);
    }

    const enrollmentRows = mockCourses.flatMap((course, courseIndex) => {
      const amount = course.discountPrice ?? course.price;
      return Array.from({ length: course.enrollmentAppliedCount }, (_, index) => {
        const status = index % 4 === 0 ? "AWAITING_PLATFORM_FEE" : "APPROVED";
        return {
          id: `seed-enrollment-${course.id}-${index + 1}`,
          userId: resolvedStudentIds[(index + courseIndex * 29) % resolvedStudentIds.length],
          lectureId: course.id,
          sellerId: teacherIdByLegacyId.get(course.instructor.id) ?? null,
          status: status as "AWAITING_PLATFORM_FEE" | "APPROVED",
          amount,
          platformFeeRateBps: 0,
          platformFeeAmount: 0,
          sellerReceivableAmount: amount,
          sellerBankName: "신한은행",
          sellerAccountNumber: `110-${String(course.instructor.id).slice(-4)}-000000`,
          sellerAccountHolder: course.instructor.nickname,
          studentMemo: index % 3 === 0 ? "입금자명 확인 부탁드립니다." : null,
          sellerMemo: status === "APPROVED" ? "시드 데이터 승인 처리" : null,
          adminMemo: "seeded bank-transfer enrollment",
          approvedById: status === "APPROVED" ? teacherIdByLegacyId.get(course.instructor.id) ?? null : null,
          approvedAt: status === "APPROVED" ? addDays(course.createdAt, index % 15) : null,
          createdAt: addDays(course.createdAt, index % 20),
          updatedAt: now,
        };
      });
    });
    for (const batch of chunks(enrollmentRows, 300)) {
      await tx.insert(enrollmentRequests).values(batch).onConflictDoNothing({
        target: [enrollmentRequests.userId, enrollmentRequests.lectureId],
      });
    }

    await tx.execute(drizzleSql`select setval(pg_get_serial_sequence('"Lecture"', 'id'), (select max(id) from "Lecture"), true)`);

    return {
      teachers: teacherRows.length,
      students: resolvedStudentIds.length,
      lectures: mockCourses.length,
      curriculums: mockCourses.reduce((sum, course) => sum + new Set(course.sections.map((section) => section.moduleTitle)).size, 0),
      sections: mockCourses.reduce((sum, course) => sum + course.sections.length, 0),
      purchases: purchaseRows.length,
      likes: likeRows.length,
      reviews: reviewRows.length,
      enrollmentRequests: enrollmentRows.length,
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await dbSql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
