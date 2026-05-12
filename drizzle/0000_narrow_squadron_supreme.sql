CREATE TYPE "public"."HlsStatus" AS ENUM('PENDING', 'PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."Language" AS ENUM('KO', 'EN', 'JA', 'VI', 'RU', 'ZH', 'ZH_CN', 'ZH_TW', 'FR', 'DE', 'ES', 'PT', 'IT', 'ID', 'TH', 'HI', 'AR', 'TR', 'PL', 'UK');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."PayoutStatus" AS ENUM('PENDING', 'APPROVED', 'PAID', 'HOLD', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('ADMIN', 'STUDENT', 'TEACHER');--> statement-breakpoint
CREATE TABLE "CaptionTrack" (
	"id" text PRIMARY KEY NOT NULL,
	"videoId" integer NOT NULL,
	"lang" text NOT NULL,
	"label" text NOT NULL,
	"format" text DEFAULT 'vtt' NOT NULL,
	"url" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_CartToLecture" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_CartToLecture_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "Cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE "CurriculumSection" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"curriculumId" integer,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Curriculum" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"lectureId" integer
);
--> statement-breakpoint
CREATE TABLE "DubTrack" (
	"id" text PRIMARY KEY NOT NULL,
	"lang" text NOT NULL,
	"status" text NOT NULL,
	"lufs" double precision,
	"offsetMs" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"videoId" integer,
	"url" text
);
--> statement-breakpoint
CREATE TABLE "FcmToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer,
	"token" text NOT NULL,
	"platform" text NOT NULL,
	"deviceId" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"lastUsedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "File" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"curriculumSectionId" integer
);
--> statement-breakpoint
CREATE TABLE "Lecture" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"shortDescription" text,
	"description" text,
	"category" text,
	"level" text,
	"languageCode" text DEFAULT 'ko' NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
	"seoKeywords" text[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
	"targetAudience" text,
	"requirements" text,
	"learningOutcomes" text[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
	"metaTitle" text,
	"metaDescription" text,
	"ogImageUrl" text,
	"canonicalUrl" text,
	"price" integer NOT NULL,
	"discountPrice" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"imageUrl" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"instructorId" integer
);
--> statement-breakpoint
CREATE TABLE "Like" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"lectureId" integer,
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE "PaymentOrder" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"orderName" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'KRW' NOT NULL,
	"status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"failReason" text,
	"paymentKey" text,
	"userId" integer NOT NULL,
	"lectureId" integer NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" text PRIMARY KEY NOT NULL,
	"paymentKey" text NOT NULL,
	"orderId" text NOT NULL,
	"status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"method" text,
	"approvedAt" timestamp (3),
	"totalAmount" integer NOT NULL,
	"vat" integer,
	"receiptUrl" text,
	"raw" jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payout" (
	"id" text PRIMARY KEY NOT NULL,
	"sellerId" integer NOT NULL,
	"status" "PayoutStatus" DEFAULT 'PENDING' NOT NULL,
	"grossAmount" integer NOT NULL,
	"platformFee" integer DEFAULT 0 NOT NULL,
	"payoutAmount" integer NOT NULL,
	"periodStart" timestamp (3),
	"periodEnd" timestamp (3),
	"memo" text,
	"paidAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Purchase" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lectureId" integer NOT NULL,
	"progress" double precision DEFAULT 0 NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PushNotification" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer,
	"fcmTokenId" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" jsonb,
	"type" text DEFAULT 'pending' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"messageId" text,
	"error" text,
	"attemptCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"sentAt" timestamp (3),
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"rating" integer NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"userId" integer,
	"lectureId" integer,
	"parentId" integer,
	"isDeleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"description" text,
	"isVerified" boolean DEFAULT false NOT NULL,
	"nickname" text,
	"phoneNumber" text,
	"profileAddress" text,
	"profileImageUrl" text,
	"role" "Role" DEFAULT 'STUDENT' NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"supabaseId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Video" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"videoUrl" text NOT NULL,
	"thumbnailUrl" text,
	"duration" integer,
	"language" "Language" DEFAULT 'KO' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"curriculumSectionId" integer,
	"masterKey" text NOT NULL,
	"hlsStatus" "HlsStatus" DEFAULT 'PENDING' NOT NULL,
	"hlsError" text
);
--> statement-breakpoint
CREATE TABLE "WebhookEventLog" (
	"id" text PRIMARY KEY NOT NULL,
	"eventType" text NOT NULL,
	"signature" text,
	"payload" jsonb NOT NULL,
	"receivedAt" timestamp (3) DEFAULT now() NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "CaptionTrack" ADD CONSTRAINT "CaptionTrack_videoId_Video_id_fk" FOREIGN KEY ("videoId") REFERENCES "public"."Video"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_CartToLecture" ADD CONSTRAINT "_CartToLecture_A_Cart_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Cart"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_CartToLecture" ADD CONSTRAINT "_CartToLecture_B_Lecture_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Lecture"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "CurriculumSection" ADD CONSTRAINT "CurriculumSection_curriculumId_Curriculum_id_fk" FOREIGN KEY ("curriculumId") REFERENCES "public"."Curriculum"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_lectureId_Lecture_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "DubTrack" ADD CONSTRAINT "DubTrack_videoId_Video_id_fk" FOREIGN KEY ("videoId") REFERENCES "public"."Video"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "FcmToken" ADD CONSTRAINT "FcmToken_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "File" ADD CONSTRAINT "File_curriculumSectionId_CurriculumSection_id_fk" FOREIGN KEY ("curriculumSectionId") REFERENCES "public"."CurriculumSection"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_instructorId_User_id_fk" FOREIGN KEY ("instructorId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Like" ADD CONSTRAINT "Like_lectureId_Lecture_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_lectureId_Lecture_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_PaymentOrder_orderId_fk" FOREIGN KEY ("orderId") REFERENCES "public"."PaymentOrder"("orderId") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_sellerId_User_id_fk" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_lectureId_Lecture_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "PushNotification" ADD CONSTRAINT "PushNotification_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_lectureId_Lecture_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Video" ADD CONSTRAINT "Video_curriculumSectionId_CurriculumSection_id_fk" FOREIGN KEY ("curriculumSectionId") REFERENCES "public"."CurriculumSection"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "CaptionTrack_videoId_idx" ON "CaptionTrack" USING btree ("videoId");--> statement-breakpoint
CREATE UNIQUE INDEX "CaptionTrack_videoId_lang_url_key" ON "CaptionTrack" USING btree ("videoId","lang","url");--> statement-breakpoint
CREATE INDEX "_CartToLecture_B_index" ON "_CartToLecture" USING btree ("B");--> statement-breakpoint
CREATE UNIQUE INDEX "DubTrack_videoId_lang_key" ON "DubTrack" USING btree ("videoId","lang");--> statement-breakpoint
CREATE UNIQUE INDEX "FcmToken_token_key" ON "FcmToken" USING btree ("token");--> statement-breakpoint
CREATE INDEX "FcmToken_userId_idx" ON "FcmToken" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "FcmToken_token_idx" ON "FcmToken" USING btree ("token");--> statement-breakpoint
CREATE INDEX "FcmToken_deviceId_idx" ON "FcmToken" USING btree ("deviceId");--> statement-breakpoint
CREATE UNIQUE INDEX "Lecture_slug_key" ON "Lecture" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Lecture_category_idx" ON "Lecture" USING btree ("category");--> statement-breakpoint
CREATE INDEX "Lecture_createdAt_idx" ON "Lecture" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "PaymentOrder_orderId_key" ON "PaymentOrder" USING btree ("orderId");--> statement-breakpoint
CREATE UNIQUE INDEX "Payment_paymentKey_key" ON "Payment" USING btree ("paymentKey");--> statement-breakpoint
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "Payout_sellerId_idx" ON "Payout" USING btree ("sellerId");--> statement-breakpoint
CREATE INDEX "Payout_status_idx" ON "Payout" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Payout_createdAt_idx" ON "Payout" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "Purchase_userId_lectureId_key" ON "Purchase" USING btree ("userId","lectureId");--> statement-breakpoint
CREATE INDEX "PushNotification_userId_idx" ON "PushNotification" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "PushNotification_type_idx" ON "PushNotification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "PushNotification_status_idx" ON "PushNotification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "PushNotification_createdAt_idx" ON "PushNotification" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User" USING btree ("supabaseId");