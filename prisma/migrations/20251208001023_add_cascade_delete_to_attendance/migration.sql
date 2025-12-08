-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_person_id_fkey";

-- DropForeignKey
ALTER TABLE "student_payments" DROP CONSTRAINT "student_payments_payment_id_fkey";

-- AlterTable
ALTER TABLE "persons" ALTER COLUMN "id" SET DEFAULT 1000000 + floor(random() * 9000000)::int;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
