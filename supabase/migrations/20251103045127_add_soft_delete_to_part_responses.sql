-- 20251103045127_add_soft_delete_to_part_responses.sql

-- Add soft delete columns to part_responses table
ALTER TABLE public.interview_question_part_responses
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN deleted_at TIMESTAMPTZ;