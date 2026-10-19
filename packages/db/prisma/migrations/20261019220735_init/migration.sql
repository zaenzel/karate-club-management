-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('COACH', 'STUDENT');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('KYU', 'DAN');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'ONGOING', 'FINISHED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "ExamResult" AS ENUM ('PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "GradeSource" AS ENUM ('INITIAL', 'EXAM');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AchievementLevel" AS ENUM ('CITY', 'PROVINCE', 'NATIONAL', 'INTERNATIONAL', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SUPERADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "head_coach_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "belts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color_hex" TEXT NOT NULL,

    CONSTRAINT "belts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "member_number" TEXT NOT NULL,
    "type" "MemberType" NOT NULL,
    "name" TEXT NOT NULL,
    "birth_place" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "branch_id" TEXT NOT NULL,
    "belt_id" TEXT NOT NULL,
    "kyu" DECIMAL(3,1) NOT NULL DEFAULT 10,
    "dan" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "championship" TEXT NOT NULL,
    "level" "AchievementLevel" NOT NULL DEFAULT 'OTHER',
    "category" TEXT,
    "result" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "location" TEXT,
    "attachment_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_histories" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "source" "GradeSource" NOT NULL,
    "exam_participant_id" TEXT,
    "from_belt_id" TEXT,
    "to_belt_id" TEXT NOT NULL,
    "from_kyu" DECIMAL(3,1),
    "to_kyu" DECIMAL(3,1) NOT NULL,
    "from_dan" INTEGER,
    "to_dan" INTEGER,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ExamType" NOT NULL,
    "date" DATE NOT NULL,
    "location" TEXT NOT NULL,
    "base_fee" INTEGER NOT NULL DEFAULT 0,
    "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
    "branch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_examiners" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_chief" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exam_examiners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_participants" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "from_belt_id" TEXT NOT NULL,
    "from_kyu" DECIMAL(3,1) NOT NULL,
    "from_dan" INTEGER,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "result" "ExamResult",
    "kyu_decrease" DECIMAL(3,1),
    "dan_increase" INTEGER,
    "to_belt_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "signature_key" TEXT,
    "signer_name" TEXT NOT NULL,
    "signer_title" TEXT NOT NULL DEFAULT 'Ketua',
    "paper_size" TEXT NOT NULL DEFAULT 'A4',
    "field_layout" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "exam_participant_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'PENDING',
    "pdf_key" TEXT,
    "png_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "belts_name_key" ON "belts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "belts_order_key" ON "belts"("order");

-- CreateIndex
CREATE UNIQUE INDEX "members_member_number_key" ON "members"("member_number");

-- CreateIndex
CREATE INDEX "members_branch_id_idx" ON "members"("branch_id");

-- CreateIndex
CREATE INDEX "achievements_member_id_idx" ON "achievements"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "grade_histories_exam_participant_id_key" ON "grade_histories"("exam_participant_id");

-- CreateIndex
CREATE INDEX "grade_histories_member_id_occurred_at_idx" ON "grade_histories"("member_id", "occurred_at");

-- CreateIndex
CREATE INDEX "exams_date_idx" ON "exams"("date");

-- CreateIndex
CREATE INDEX "exam_examiners_exam_id_idx" ON "exam_examiners"("exam_id");

-- CreateIndex
CREATE INDEX "exam_participants_member_id_idx" ON "exam_participants"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_participants_exam_id_member_id_key" ON "exam_participants"("exam_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_number_key" ON "certificates"("number");

-- CreateIndex
CREATE INDEX "certificates_member_id_is_active_issued_at_idx" ON "certificates"("member_id", "is_active", "issued_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_head_coach_id_fkey" FOREIGN KEY ("head_coach_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_belt_id_fkey" FOREIGN KEY ("belt_id") REFERENCES "belts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_histories" ADD CONSTRAINT "grade_histories_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_histories" ADD CONSTRAINT "grade_histories_exam_participant_id_fkey" FOREIGN KEY ("exam_participant_id") REFERENCES "exam_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_histories" ADD CONSTRAINT "grade_histories_from_belt_id_fkey" FOREIGN KEY ("from_belt_id") REFERENCES "belts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_histories" ADD CONSTRAINT "grade_histories_to_belt_id_fkey" FOREIGN KEY ("to_belt_id") REFERENCES "belts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_examiners" ADD CONSTRAINT "exam_examiners_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_participants" ADD CONSTRAINT "exam_participants_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_participants" ADD CONSTRAINT "exam_participants_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_participants" ADD CONSTRAINT "exam_participants_from_belt_id_fkey" FOREIGN KEY ("from_belt_id") REFERENCES "belts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_participants" ADD CONSTRAINT "exam_participants_to_belt_id_fkey" FOREIGN KEY ("to_belt_id") REFERENCES "belts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_exam_participant_id_fkey" FOREIGN KEY ("exam_participant_id") REFERENCES "exam_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "certificate_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
