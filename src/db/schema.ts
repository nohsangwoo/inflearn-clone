import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const now = () => new Date();
const textId = () => crypto.randomUUID();

export const roleEnum = pgEnum("Role", ["ADMIN", "STUDENT", "TEACHER"]);
export const languageEnum = pgEnum("Language", [
  "KO",
  "EN",
  "JA",
  "VI",
  "RU",
  "ZH",
  "ZH_CN",
  "ZH_TW",
  "FR",
  "DE",
  "ES",
  "PT",
  "IT",
  "ID",
  "TH",
  "HI",
  "AR",
  "TR",
  "PL",
  "UK",
]);
export const paymentStatusEnum = pgEnum("PaymentStatus", ["PENDING", "SUCCESS", "FAILED", "CANCELED"]);
export const payoutStatusEnum = pgEnum("PayoutStatus", ["PENDING", "APPROVED", "PAID", "HOLD", "CANCELED"]);
export const hlsStatusEnum = pgEnum("HlsStatus", ["PENDING", "PROCESSING", "READY", "FAILED"]);

export const users = pgTable(
  "User",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    description: text("description"),
    isVerified: boolean("isVerified").notNull().default(false),
    nickname: text("nickname"),
    phoneNumber: text("phoneNumber"),
    profileAddress: text("profileAddress"),
    profileImageUrl: text("profileImageUrl"),
    role: roleEnum("role").notNull().default("STUDENT"),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
    supabaseId: text("supabaseId").notNull(),
  },
  (table) => [
    uniqueIndex("User_email_key").on(table.email),
    uniqueIndex("User_supabaseId_key").on(table.supabaseId),
  ],
);

export const lectures = pgTable(
  "Lecture",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug"),
    shortDescription: text("shortDescription"),
    description: text("description"),
    category: text("category"),
    level: text("level"),
    languageCode: text("languageCode").notNull().default("ko"),
    tags: text("tags").array().notNull().default(sql`ARRAY[]::TEXT[]`),
    seoKeywords: text("seoKeywords").array().notNull().default(sql`ARRAY[]::TEXT[]`),
    targetAudience: text("targetAudience"),
    requirements: text("requirements"),
    learningOutcomes: text("learningOutcomes").array().notNull().default(sql`ARRAY[]::TEXT[]`),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    ogImageUrl: text("ogImageUrl"),
    canonicalUrl: text("canonicalUrl"),
    price: integer("price").notNull(),
    discountPrice: integer("discountPrice"),
    isActive: boolean("isActive").notNull().default(true),
    imageUrl: text("imageUrl"),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
    instructorId: integer("instructorId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  },
  (table) => [
    uniqueIndex("Lecture_slug_key").on(table.slug),
    index("Lecture_category_idx").on(table.category),
    index("Lecture_createdAt_idx").on(table.createdAt),
  ],
);

export const reviews = pgTable(
  "Review",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
    userId: integer("userId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    lectureId: integer("lectureId").references(() => lectures.id, { onDelete: "set null", onUpdate: "cascade" }),
    parentId: integer("parentId"),
    isDeleted: boolean("isDeleted").notNull().default(false),
  },
  (table) => [
    foreignKey({
      name: "Review_parentId_fkey",
      columns: [table.parentId],
      foreignColumns: [table.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export const carts = pgTable("Cart", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  userId: integer("userId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const likes = pgTable("Like", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  lectureId: integer("lectureId").references(() => lectures.id, { onDelete: "set null", onUpdate: "cascade" }),
  userId: integer("userId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const curriculums = pgTable("Curriculum", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  lectureId: integer("lectureId").references(() => lectures.id, { onDelete: "set null", onUpdate: "cascade" }),
});

export const curriculumSections = pgTable("CurriculumSection", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  curriculumId: integer("curriculumId").references(() => curriculums.id, { onDelete: "set null", onUpdate: "cascade" }),
  isActive: boolean("isActive").notNull().default(true),
});

export const videos = pgTable("Video", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  videoUrl: text("videoUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  duration: integer("duration"),
  language: languageEnum("language").notNull().default("KO"),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  curriculumSectionId: integer("curriculumSectionId").references(() => curriculumSections.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  masterKey: text("masterKey").notNull(),
  hlsStatus: hlsStatusEnum("hlsStatus").notNull().default("PENDING"),
  hlsError: text("hlsError"),
});

export const captionTracks = pgTable(
  "CaptionTrack",
  {
    id: text("id").primaryKey().$defaultFn(textId),
    videoId: integer("videoId")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade", onUpdate: "cascade" }),
    lang: text("lang").notNull(),
    label: text("label").notNull(),
    format: text("format").notNull().default("vtt"),
    url: text("url").notNull(),
    isDefault: boolean("isDefault").notNull().default(false),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  },
  (table) => [
    index("CaptionTrack_videoId_idx").on(table.videoId),
    uniqueIndex("CaptionTrack_videoId_lang_url_key").on(table.videoId, table.lang, table.url),
  ],
);

export const dubTracks = pgTable(
  "DubTrack",
  {
    id: text("id").primaryKey().$defaultFn(textId),
    lang: text("lang").notNull(),
    status: text("status").notNull(),
    lufs: doublePrecision("lufs"),
    offsetMs: integer("offsetMs"),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
    videoId: integer("videoId").references(() => videos.id, { onDelete: "set null", onUpdate: "cascade" }),
    url: text("url"),
  },
  (table) => [uniqueIndex("DubTrack_videoId_lang_key").on(table.videoId, table.lang)],
);

export const files = pgTable("File", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  curriculumSectionId: integer("curriculumSectionId").references(() => curriculumSections.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const purchases = pgTable(
  "Purchase",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
    lectureId: integer("lectureId")
      .notNull()
      .references(() => lectures.id, { onDelete: "restrict", onUpdate: "cascade" }),
    progress: doublePrecision("progress").notNull().default(0),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("Purchase_userId_lectureId_key").on(table.userId, table.lectureId)],
);

export const paymentOrders = pgTable(
  "PaymentOrder",
  {
    id: text("id").primaryKey().$defaultFn(textId),
    orderId: text("orderId").notNull(),
    orderName: text("orderName").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("KRW"),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    failReason: text("failReason"),
    paymentKey: text("paymentKey"),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
    lectureId: integer("lectureId")
      .notNull()
      .references(() => lectures.id, { onDelete: "restrict", onUpdate: "cascade" }),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  },
  (table) => [uniqueIndex("PaymentOrder_orderId_key").on(table.orderId)],
);

export const payments = pgTable(
  "Payment",
  {
    id: text("id").primaryKey().$defaultFn(textId),
    paymentKey: text("paymentKey").notNull(),
    orderId: text("orderId")
      .notNull()
      .references(() => paymentOrders.orderId, { onDelete: "restrict", onUpdate: "cascade" }),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    method: text("method"),
    approvedAt: timestamp("approvedAt", { precision: 3, mode: "date" }),
    totalAmount: integer("totalAmount").notNull(),
    vat: integer("vat"),
    receiptUrl: text("receiptUrl"),
    raw: jsonb("raw").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  },
  (table) => [
    uniqueIndex("Payment_paymentKey_key").on(table.paymentKey),
    uniqueIndex("Payment_orderId_key").on(table.orderId),
  ],
);

export const webhookEventLogs = pgTable("WebhookEventLog", {
  id: text("id").primaryKey().$defaultFn(textId),
  eventType: text("eventType").notNull(),
  signature: text("signature"),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  receivedAt: timestamp("receivedAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
  processed: boolean("processed").notNull().default(false),
  error: text("error"),
});

export const payouts = pgTable(
  "Payout",
  {
    id: text("id").primaryKey().$defaultFn(textId),
    sellerId: integer("sellerId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
    status: payoutStatusEnum("status").notNull().default("PENDING"),
    grossAmount: integer("grossAmount").notNull(),
    platformFee: integer("platformFee").notNull().default(0),
    payoutAmount: integer("payoutAmount").notNull(),
    periodStart: timestamp("periodStart", { precision: 3, mode: "date" }),
    periodEnd: timestamp("periodEnd", { precision: 3, mode: "date" }),
    memo: text("memo"),
    paidAt: timestamp("paidAt", { precision: 3, mode: "date" }),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  },
  (table) => [
    index("Payout_sellerId_idx").on(table.sellerId),
    index("Payout_status_idx").on(table.status),
    index("Payout_createdAt_idx").on(table.createdAt),
  ],
);

export const fcmTokens = pgTable(
  "FcmToken",
  {
    id: text("id").primaryKey().$defaultFn(textId),
    userId: integer("userId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    token: text("token").notNull(),
    platform: text("platform").notNull(),
    deviceId: text("deviceId"),
    isActive: boolean("isActive").notNull().default(true),
    lastUsedAt: timestamp("lastUsedAt", { precision: 3, mode: "date" }),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull().$onUpdate(now),
  },
  (table) => [
    uniqueIndex("FcmToken_token_key").on(table.token),
    index("FcmToken_userId_idx").on(table.userId),
    index("FcmToken_token_idx").on(table.token),
    index("FcmToken_deviceId_idx").on(table.deviceId),
  ],
);

export const pushNotifications = pgTable(
  "PushNotification",
  {
    id: text("id").primaryKey().$defaultFn(textId),
    userId: integer("userId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    fcmTokenId: text("fcmTokenId"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    data: jsonb("data").$type<Record<string, unknown> | null>(),
    type: text("type").notNull().default("pending"),
    status: text("status").notNull().default("pending"),
    messageId: text("messageId"),
    error: text("error"),
    attemptCount: integer("attemptCount").notNull().default(0),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).notNull().defaultNow(),
    sentAt: timestamp("sentAt", { precision: 3, mode: "date" }),
    isRead: boolean("isRead").notNull().default(false),
    readAt: timestamp("readAt", { precision: 3, mode: "date" }),
  },
  (table) => [
    index("PushNotification_userId_idx").on(table.userId),
    index("PushNotification_type_idx").on(table.type),
    index("PushNotification_status_idx").on(table.status),
    index("PushNotification_createdAt_idx").on(table.createdAt),
  ],
);

export const cartToLecture = pgTable(
  "_CartToLecture",
  {
    cartId: integer("A")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    lectureId: integer("B")
      .notNull()
      .references(() => lectures.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [
    primaryKey({ name: "_CartToLecture_AB_pkey", columns: [table.cartId, table.lectureId] }),
    index("_CartToLecture_B_index").on(table.lectureId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  lectures: many(lectures),
  purchases: many(purchases),
  likes: many(likes),
  reviews: many(reviews),
  carts: many(carts),
  paymentOrders: many(paymentOrders),
  payouts: many(payouts),
  fcmTokens: many(fcmTokens),
  pushNotifications: many(pushNotifications),
}));

export const lecturesRelations = relations(lectures, ({ one, many }) => ({
  instructor: one(users, { fields: [lectures.instructorId], references: [users.id] }),
  curriculums: many(curriculums),
  reviews: many(reviews),
  likes: many(likes),
  purchases: many(purchases),
  paymentOrders: many(paymentOrders),
}));

export const curriculumsRelations = relations(curriculums, ({ one, many }) => ({
  lecture: one(lectures, { fields: [curriculums.lectureId], references: [lectures.id] }),
  sections: many(curriculumSections),
}));

export const curriculumSectionsRelations = relations(curriculumSections, ({ one, many }) => ({
  curriculum: one(curriculums, { fields: [curriculumSections.curriculumId], references: [curriculums.id] }),
  videos: many(videos),
  files: many(files),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  section: one(curriculumSections, {
    fields: [videos.curriculumSectionId],
    references: [curriculumSections.id],
  }),
  dubTracks: many(dubTracks),
  captionTracks: many(captionTracks),
}));

export const captionTracksRelations = relations(captionTracks, ({ one }) => ({
  video: one(videos, { fields: [captionTracks.videoId], references: [videos.id] }),
}));

export const dubTracksRelations = relations(dubTracks, ({ one }) => ({
  video: one(videos, { fields: [dubTracks.videoId], references: [videos.id] }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
  lecture: one(lectures, { fields: [purchases.lectureId], references: [lectures.id] }),
}));

export const paymentOrdersRelations = relations(paymentOrders, ({ one }) => ({
  user: one(users, { fields: [paymentOrders.userId], references: [users.id] }),
  lecture: one(lectures, { fields: [paymentOrders.lectureId], references: [lectures.id] }),
  payment: one(payments, { fields: [paymentOrders.orderId], references: [payments.orderId] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(paymentOrders, { fields: [payments.orderId], references: [paymentOrders.orderId] }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  seller: one(users, { fields: [payouts.sellerId], references: [users.id] }),
}));

export type Role = (typeof roleEnum.enumValues)[number];
export type Language = (typeof languageEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PayoutStatus = (typeof payoutStatusEnum.enumValues)[number];
export type HlsStatus = (typeof hlsStatusEnum.enumValues)[number];
