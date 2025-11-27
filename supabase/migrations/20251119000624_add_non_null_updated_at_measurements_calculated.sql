-- Make the updated_at column non-nullable in the measurements_calculated table
ALTER TABLE public.measurements_calculated
ALTER COLUMN updated_at SET NOT NULL;