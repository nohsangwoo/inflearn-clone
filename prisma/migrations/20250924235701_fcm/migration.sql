-- CreateTable
CREATE TABLE "public"."FcmToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FcmToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushNotification" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "fcmTokenId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "type" TEXT NOT NULL DEFAULT 'pending',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "messageId" TEXT,
    "error" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "PushNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FcmToken_token_key" ON "public"."FcmToken"("token");

-- CreateIndex
CREATE INDEX "FcmToken_userId_idx" ON "public"."FcmToken"("userId");

-- CreateIndex
CREATE INDEX "FcmToken_token_idx" ON "public"."FcmToken"("token");

-- CreateIndex
CREATE INDEX "FcmToken_deviceId_idx" ON "public"."FcmToken"("deviceId");

-- CreateIndex
CREATE INDEX "PushNotification_userId_idx" ON "public"."PushNotification"("userId");

-- CreateIndex
CREATE INDEX "PushNotification_type_idx" ON "public"."PushNotification"("type");

-- CreateIndex
CREATE INDEX "PushNotification_status_idx" ON "public"."PushNotification"("status");

-- CreateIndex
CREATE INDEX "PushNotification_createdAt_idx" ON "public"."PushNotification"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."FcmToken" ADD CONSTRAINT "FcmToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PushNotification" ADD CONSTRAINT "PushNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
