-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "refreshTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeviceSession_userId_idx" ON "DeviceSession"("userId");

-- CreateIndex
CREATE INDEX "DeviceSession_deviceId_idx" ON "DeviceSession"("deviceId");

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
