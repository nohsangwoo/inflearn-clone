/*
  Warnings:

  - Added the required column `masterKey` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Video" ADD COLUMN     "masterKey" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."DubTrack" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lufs" DOUBLE PRECISION,
    "offsetMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoId" INTEGER,

    CONSTRAINT "DubTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DubTrack_videoId_lang_key" ON "public"."DubTrack"("videoId", "lang");

-- AddForeignKey
ALTER TABLE "public"."DubTrack" ADD CONSTRAINT "DubTrack_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
