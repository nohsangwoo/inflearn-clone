ALTER TABLE "Lecture" ADD COLUMN "enrollmentOpen" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "Lecture" ADD COLUMN "enrollmentStartAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "Lecture" ADD COLUMN "enrollmentEndAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "Lecture" ADD COLUMN "enrollmentCapacity" integer;