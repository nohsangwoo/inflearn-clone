ALTER TABLE "User" RENAME COLUMN "supabaseId" TO "firebaseUid";--> statement-breakpoint
DROP INDEX "User_supabaseId_key";--> statement-breakpoint
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User" USING btree ("firebaseUid");