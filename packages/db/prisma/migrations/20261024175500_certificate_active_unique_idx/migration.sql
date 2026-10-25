-- CreateIndex
CREATE UNIQUE INDEX "certificates_active_participant_uidx" ON "certificates"("exam_participant_id") WHERE "is_active" = true;
