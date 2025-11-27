-- Add questionnaire_id column to questionnaire_question_parts table
-- This allows direct filtering of question parts by questionnaire without joining through questions

-- Add the column as nullable first
ALTER TABLE "public"."questionnaire_question_parts"
ADD COLUMN "questionnaire_id" bigint;

-- Backfill existing records by joining with questionnaire_questions
UPDATE "public"."questionnaire_question_parts" qp
SET "questionnaire_id" = qq."questionnaire_id"
FROM "public"."questionnaire_questions" qq
WHERE qp."questionnaire_question_id" = qq."id";

-- Make the column NOT NULL now that it's populated
ALTER TABLE "public"."questionnaire_question_parts"
ALTER COLUMN "questionnaire_id" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "public"."questionnaire_question_parts"
ADD CONSTRAINT "questionnaire_question_parts_questionnaire_id_fkey"
FOREIGN KEY ("questionnaire_id")
REFERENCES "public"."questionnaires"("id")
ON DELETE CASCADE;

-- Add index for performance on questionnaire_id queries
CREATE INDEX "idx_questionnaire_question_parts_questionnaire_id"
ON "public"."questionnaire_question_parts"("questionnaire_id");

-- Add composite index for common query pattern (filter by questionnaire + is_deleted + order)
CREATE INDEX "idx_questionnaire_question_parts_questionnaire_id_deleted_order"
ON "public"."questionnaire_question_parts"("questionnaire_id", "is_deleted", "order_index");