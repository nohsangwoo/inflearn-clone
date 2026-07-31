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
  siteSections,
  sql as dbSql,
  users,
  videos,
} from "../src/db";
import { getCourseDetailScene } from "../src/lib/course-detail-scenes";
import { defaultHomepageSections } from "../src/lib/homepage-sections";
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
  let threeStarCount = total >= 20 ? Math.max(1, Math.round(total * 0.025)) : 0;
  const targetTotal = Math.round(targetAverage * total);
  let fiveStarCount = targetTotal - 4 * total + threeStarCount;

  while (threeStarCount > 0 && fiveStarCount > total - threeStarCount) {
    threeStarCount -= 1;
    fiveStarCount = targetTotal - 4 * total + threeStarCount;
  }

  fiveStarCount = Math.max(0, Math.min(total - threeStarCount, fiveStarCount));
  if (index >= total - threeStarCount) return 3;
  return index < fiveStarCount ? 5 : 4;
}

const reviewOpenings = [
  "기능을 따라 만드는 데서 끝나지 않고 결과물을 완성하는 순서가 명확했습니다.",
  "혼자 공부할 때 자주 막히던 지점을 강의가 정확히 짚어줬습니다.",
  "첫 주에는 낯설었지만 작은 단위로 반복하면서 작업 속도가 눈에 띄게 붙었습니다.",
  "예제가 과장되지 않고 실제 프로젝트에서 마주치는 문제와 가까워서 좋았습니다.",
  "기초 설명과 실전 과제의 비율이 좋아 중간에 흐름을 놓치지 않았습니다.",
  "완성본만 보여주는 강의가 아니라 왜 그렇게 판단했는지까지 설명해 줍니다.",
  "매 수업의 목표와 제출물이 분명해서 퇴근 후에도 계획대로 따라갈 수 있었습니다.",
  "이미 알고 있다고 생각했던 기본기를 다시 정리하면서 작업 습관이 많이 달라졌습니다.",
  "자료와 체크리스트가 잘 정리돼 있어 강의가 끝난 뒤에도 계속 참고하고 있습니다.",
  "비슷한 강의를 여러 번 들었지만 이번에는 실제로 끝까지 완성했습니다.",
  "막연한 이론보다 직접 수정하고 비교하는 과정이 많아 기억에 오래 남았습니다.",
  "처음에는 포트폴리오용으로 시작했는데 현재 업무에도 바로 적용할 수 있었습니다.",
];

const reviewClosings = [
  "최종 결과물과 작업 과정을 함께 정리할 수 있어 포트폴리오 설명도 훨씬 쉬워졌습니다.",
  "중간 점검 기준이 분명해 혼자 다시 만들어 볼 때도 어디부터 확인해야 할지 알겠습니다.",
  "분량은 충분하지만 수업 하나가 길지 않아 주중에도 꾸준히 진행하기 좋았습니다.",
  "제공된 템플릿을 그대로 쓰기보다 제 프로젝트에 맞게 바꾸는 방법까지 배운 점이 특히 좋았습니다.",
  "다음 프로젝트에서는 처음부터 같은 순서로 작업해 보려고 합니다.",
  "초보자에게는 조금 어려운 구간도 있지만 복습 지점이 명확해 따라갈 수 있었습니다.",
  "완성 후 피드백을 반영하는 과정까지 경험해 결과물의 설득력이 좋아졌습니다.",
  "수강 전보다 문제를 설명하고 해결 방향을 정하는 속도가 빨라졌습니다.",
];

const studentNames = [
  "김도윤", "이서윤", "박지후", "최하린", "정민재", "한예린", "윤시우", "임서진",
  "오준혁", "강채원", "송현우", "문지안", "배유진", "백승민", "신가은", "노태윤",
  "권소민", "홍지호", "장다인", "유건우", "남세아", "조은호", "서가윤", "황준서",
];

function buildReviewText(course: (typeof mockCourses)[number], index: number) {
  const outcome = course.learningOutcomes[index % course.learningOutcomes.length];
  const opening = reviewOpenings[(index + course.id) % reviewOpenings.length];
  const closing = reviewClosings[(index * 3 + course.id) % reviewClosings.length];
  return `${opening} 특히 ‘${outcome}’ 파트에서 작업 기준을 세울 수 있었고, ${closing}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  if (process.env.ALLOW_DESTRUCTIVE_SEED !== "I_UNDERSTAND") {
    throw new Error(
      "This seed replaces showcase lectures and related records. Set ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND to continue.",
    );
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
          description: `${course.category} 분야의 실무 프로젝트를 강의하고, ${course.learningOutcomes[0]} 과정을 중심으로 피드백합니다.`,
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
          nickname: studentNames[(n - 1) % studentNames.length],
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

    await tx
      .insert(siteSections)
      .values(
        defaultHomepageSections.map((section) => ({
          area: "homepage",
          sectionKey: section.sectionKey,
          eyebrow: section.eyebrow,
          title: section.title,
          description: section.description,
          position: section.position,
          isEnabled: section.isEnabled,
          metadata: section.metadata ?? null,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .onConflictDoUpdate({
        target: [siteSections.area, siteSections.sectionKey],
        set: {
          eyebrow: drizzleSql`excluded."eyebrow"`,
          title: drizzleSql`excluded."title"`,
          description: drizzleSql`excluded."description"`,
          position: drizzleSql`excluded."position"`,
          isEnabled: drizzleSql`excluded."isEnabled"`,
          metadata: drizzleSql`excluded."metadata"`,
          updatedAt: now,
        },
      });

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
        isSeedData: true,
        imageUrl: course.imageUrl,
        detailScene: getCourseDetailScene(course.id),
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
        content: buildReviewText(course, index),
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
      homepageSections: defaultHomepageSections.length,
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await dbSql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
