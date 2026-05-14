CREATE TYPE "public"."EnrollmentStatus" AS ENUM('AWAITING_PLATFORM_FEE', 'APPROVED', 'REJECTED', 'CANCELED');--> statement-breakpoint
CREATE TABLE "EnrollmentRequest" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lectureId" integer NOT NULL,
	"sellerId" integer,
	"status" "EnrollmentStatus" DEFAULT 'AWAITING_PLATFORM_FEE' NOT NULL,
	"amount" integer NOT NULL,
	"platformFeeRateBps" integer DEFAULT 0 NOT NULL,
	"platformFeeAmount" integer DEFAULT 0 NOT NULL,
	"sellerReceivableAmount" integer NOT NULL,
	"sellerBankName" text,
	"sellerAccountNumber" text,
	"sellerAccountHolder" text,
	"paymentOrderId" text,
	"studentMemo" text,
	"sellerMemo" text,
	"adminMemo" text,
	"approvedById" integer,
	"approvedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Lecture" ADD COLUMN "platformFeeRateBps" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "settlementBankName" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "settlementAccountNumber" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "settlementAccountHolder" text;--> statement-breakpoint
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_lectureId_Lecture_id_fk" FOREIGN KEY ("lectureId") REFERENCES "public"."Lecture"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_sellerId_User_id_fk" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_paymentOrderId_PaymentOrder_orderId_fk" FOREIGN KEY ("paymentOrderId") REFERENCES "public"."PaymentOrder"("orderId") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_approvedById_User_id_fk" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "EnrollmentRequest_userId_lectureId_key" ON "EnrollmentRequest" USING btree ("userId","lectureId");--> statement-breakpoint
CREATE UNIQUE INDEX "EnrollmentRequest_paymentOrderId_key" ON "EnrollmentRequest" USING btree ("paymentOrderId");--> statement-breakpoint
CREATE INDEX "EnrollmentRequest_status_idx" ON "EnrollmentRequest" USING btree ("status");--> statement-breakpoint
CREATE INDEX "EnrollmentRequest_seller_status_idx" ON "EnrollmentRequest" USING btree ("sellerId","status");--> statement-breakpoint
CREATE INDEX "EnrollmentRequest_createdAt_idx" ON "EnrollmentRequest" USING btree ("createdAt");