CREATE TABLE "SiteSection" (
	"id" text PRIMARY KEY NOT NULL,
	"area" text DEFAULT 'homepage' NOT NULL,
	"sectionKey" text NOT NULL,
	"eyebrow" text,
	"title" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Lecture" ADD COLUMN "isSeedData" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Lecture" ADD COLUMN "detailScene" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "SiteSection_area_sectionKey_key" ON "SiteSection" USING btree ("area","sectionKey");--> statement-breakpoint
CREATE INDEX "SiteSection_area_position_idx" ON "SiteSection" USING btree ("area","position");--> statement-breakpoint
CREATE INDEX "Lecture_isSeedData_idx" ON "Lecture" USING btree ("isSeedData");