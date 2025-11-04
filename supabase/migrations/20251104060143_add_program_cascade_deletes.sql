-- Add cascade soft delete support for programs and program_phases

-- Update tables that don't have soft delete
ALTER TABLE interview_roles
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE interview_response_roles
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE interview_question_applicable_roles
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE interview_evidence
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE measurement_alignments
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update cascade_soft_delete trigger function
CREATE OR REPLACE FUNCTION "public"."cascade_soft_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- Only proceed if this is a soft delete (is_deleted changed from false to true)
  IF OLD.is_deleted = false AND NEW.is_deleted = true THEN

    -- Handle different parent tables
    CASE TG_TABLE_NAME
      WHEN 'companies' THEN
        -- Cascade to programs
        UPDATE programs
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;
        
        -- Cascade to assessments
        UPDATE assessments
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to business_units
        UPDATE business_units
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to regions
        UPDATE regions
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to sites
        UPDATE sites
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to asset_groups
        UPDATE asset_groups
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to work_groups
        UPDATE work_groups
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to roles
        UPDATE roles
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to recommendations
        UPDATE recommendations
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to dashboards
        UPDATE dashboards
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

        -- Cascade to contacts
        UPDATE contacts
        SET is_deleted = true, deleted_at = NOW()
        WHERE company_id = NEW.id AND is_deleted = false;

      WHEN 'business_units' THEN
        -- Cascade to regions
        UPDATE regions
        SET is_deleted = true, deleted_at = NOW()
        WHERE business_unit_id = NEW.id AND is_deleted = false;

      WHEN 'regions' THEN
        -- Cascade to sites
        UPDATE sites
        SET is_deleted = true, deleted_at = NOW()
        WHERE region_id = NEW.id AND is_deleted = false;

      WHEN 'sites' THEN
        -- Cascade to asset_groups
        UPDATE asset_groups
        SET is_deleted = true, deleted_at = NOW()
        WHERE site_id = NEW.id AND is_deleted = false;

      WHEN 'asset_groups' THEN
        -- Cascade to work_groups
        UPDATE work_groups
        SET is_deleted = true, deleted_at = NOW()
        WHERE asset_group_id = NEW.id AND is_deleted = false;

      WHEN 'work_groups' THEN
        -- Cascade to roles
        UPDATE roles
        SET is_deleted = true, deleted_at = NOW()
        WHERE work_group_id = NEW.id AND is_deleted = false;

      WHEN 'assessments' THEN
        -- Cascade to assessment_objectives
        UPDATE assessment_objectives
        SET is_deleted = true, deleted_at = NOW()
        WHERE assessment_id = NEW.id AND is_deleted = false;

        -- Cascade to interviews
        UPDATE interviews
        SET is_deleted = true, deleted_at = NOW()
        WHERE assessment_id = NEW.id AND is_deleted = false;

        -- Cascade to calculated_measurements
        UPDATE measurements_calculated
        SET is_deleted = true, deleted_at = NOW()
        WHERE assessment_id = NEW.id AND is_deleted = false;

        -- Cascade to recommendations
        UPDATE recommendations
        SET is_deleted = true, deleted_at = NOW()
        WHERE assessment_id = NEW.id AND is_deleted = false;

      WHEN 'interviews' THEN
        -- Cascade to interview_responses
        UPDATE interview_responses
        SET is_deleted = true, deleted_at = NOW()
        WHERE interview_id = NEW.id AND is_deleted = false;

        -- Cascade to interview_roles
        UPDATE interview_roles
        SET is_deleted = true, deleted_at = NOW()
        WHERE interview_id = NEW.id AND is_deleted = false;

        -- Cascade to interview_question_applicable_roles
        UPDATE interview_question_applicable_roles
        SET is_deleted = true, deleted_at = NOW()
        WHERE interview_id = NEW.id AND is_deleted = false;

      WHEN 'interview_responses' THEN
        -- Cascade to interview_response_actions
        UPDATE interview_response_actions
        SET is_deleted = true, deleted_at = NOW()
        WHERE interview_response_id = NEW.id AND is_deleted = false;

        -- Cascade to interview_response_roles
        UPDATE interview_response_roles
        SET is_deleted = true, deleted_at = NOW()
        WHERE interview_response_id = NEW.id AND is_deleted = false;

        -- Cascade to interview_question_part_responses
        UPDATE interview_question_part_responses
        SET is_deleted = true, deleted_at = NOW()
        WHERE interview_response_id = NEW.id AND is_deleted = false;

        -- Cascade to interview_evidence
        UPDATE interview_evidence
        SET is_deleted = true, deleted_at = NOW()
        WHERE interview_response_id = NEW.id AND is_deleted = false;

      WHEN 'programs' THEN
        -- Cascade to program_phases
        UPDATE program_phases
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_id = NEW.id AND is_deleted = false;

        -- Cascade to program_objectives
        UPDATE program_objectives
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_id = NEW.id AND is_deleted = false;

        -- Cascade to program_measurements
        UPDATE program_measurements
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_id = NEW.id AND is_deleted = false;

        -- Cascade to recommendations
        UPDATE recommendations
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_id = NEW.id AND is_deleted = false;

        -- Cascade to measurement_alignments
        UPDATE measurement_alignments
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_id = NEW.id AND is_deleted = false;

        -- Cascade to interviews (direct program relationship)
        UPDATE interviews
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_id = NEW.id AND is_deleted = false;

      WHEN 'program_phases' THEN
        -- Cascade to assessments
        UPDATE assessments
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_phase_id = NEW.id AND is_deleted = false;

        -- Cascade to interviews
        UPDATE interviews
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_phase_id = NEW.id AND is_deleted = false;

        -- Cascade to measurements_calculated
        UPDATE measurements_calculated
        SET is_deleted = true, deleted_at = NOW()
        WHERE program_phase_id = NEW.id AND is_deleted = false;

      WHEN 'questionnaires' THEN
        -- Cascade to questionnaire_rating_scales
        UPDATE questionnaire_rating_scales
        SET is_deleted = true, deleted_at = NOW()
        WHERE questionnaire_id = NEW.id AND is_deleted = false;

        -- Cascade to questionnaire_sections
        UPDATE questionnaire_sections
        SET is_deleted = true, deleted_at = NOW()
        WHERE questionnaire_id = NEW.id AND is_deleted = false;

      WHEN 'questionnaire_sections' THEN
        -- Cascade to questionnaire_steps
        UPDATE questionnaire_steps
        SET is_deleted = true, deleted_at = NOW()
        WHERE questionnaire_section_id = NEW.id AND is_deleted = false;

      WHEN 'questionnaire_steps' THEN
        -- Cascade to questionnaire_questions
        UPDATE questionnaire_questions
        SET is_deleted = true, deleted_at = NOW()
        WHERE questionnaire_step_id = NEW.id AND is_deleted = false;

      WHEN 'questionnaire_questions' THEN
        -- Cascade to questionnaire_question_rating_scales
        UPDATE questionnaire_question_rating_scales
        SET is_deleted = true, deleted_at = NOW()
        WHERE questionnaire_question_id = NEW.id AND is_deleted = false;

        -- Cascade to questionnaire_question_roles
        UPDATE questionnaire_question_roles
        SET is_deleted = true, deleted_at = NOW()
        WHERE questionnaire_question_id = NEW.id AND is_deleted = false;

        -- Cascade to questionnaire_question_parts
        UPDATE questionnaire_question_parts
        SET is_deleted = true, deleted_at = NOW()
        WHERE questionnaire_question_id = NEW.id AND is_deleted = false;

    END CASE;

  END IF;

  RETURN NEW;
END;$$;
