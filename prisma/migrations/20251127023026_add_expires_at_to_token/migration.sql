-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';
