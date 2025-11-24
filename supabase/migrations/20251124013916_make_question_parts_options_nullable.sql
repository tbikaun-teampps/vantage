-- Make the questionnaire_question_parts options column nullable
ALTER TABLE questionnaire_question_parts
ALTER COLUMN options DROP NOT NULL;