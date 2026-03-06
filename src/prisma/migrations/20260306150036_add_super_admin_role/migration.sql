-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "persons" ALTER COLUMN "id" SET DEFAULT 1000000 + floor(random() * 9000000)::int;
