-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
