-- Update questionnaire status enum to remove 'active' and instead add 'published'

-- Step 1: Create the new enum type with the desired values
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'questionnaire_statuses_new') THEN
        CREATE TYPE questionnaire_statuses_new AS ENUM ('draft', 'published', 'archived', 'under_review');
    END IF;
END $$;

-- Step 2: Drop the existing default value
ALTER TABLE questionnaires
    ALTER COLUMN status DROP DEFAULT;

-- Step 3: Alter the questionnaires table to use the new enum type (converting 'active' to 'published')
ALTER TABLE questionnaires
    ALTER COLUMN status TYPE questionnaire_statuses_new
    USING (
        CASE 
            WHEN status::text = 'active' THEN 'published'
            ELSE status::text
        END
    )::questionnaire_statuses_new;

-- Step 4: Drop the old enum type
DROP TYPE IF EXISTS questionnaire_statuses;

-- Step 5: Rename the new enum type to the original name
ALTER TYPE questionnaire_statuses_new RENAME TO questionnaire_statuses;

-- Step 6: Restore the default value
ALTER TABLE questionnaires
    ALTER COLUMN status SET DEFAULT 'draft';