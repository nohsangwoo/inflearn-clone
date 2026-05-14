ALTER TABLE "CurriculumSection" ADD COLUMN "moduleTitle" text;--> statement-breakpoint
ALTER TABLE "CurriculumSection" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "CurriculumSection" ADD COLUMN "durationSeconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "CurriculumSection" ADD COLUMN "resources" text[] DEFAULT ARRAY[]::TEXT[] NOT NULL;