

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."assessment_statuses" AS ENUM (
    'draft',
    'active',
    'under_review',
    'completed',
    'archived'
);


ALTER TYPE "public"."assessment_statuses" OWNER TO "postgres";


COMMENT ON TYPE "public"."assessment_statuses" IS 'Statuses of Assessments';



CREATE TYPE "public"."assessment_types" AS ENUM (
    'onsite',
    'desktop'
);


ALTER TYPE "public"."assessment_types" OWNER TO "postgres";


COMMENT ON TYPE "public"."assessment_types" IS 'Type of Assessments';



CREATE TYPE "public"."company_role" AS ENUM (
    'owner',
    'admin',
    'viewer',
    'interviewee'
);


ALTER TYPE "public"."company_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."company_role" IS 'User roles on companies';



CREATE TYPE "public"."feedback_types" AS ENUM (
    'bug',
    'feature',
    'general',
    'suggestion',
    'post_interview_survey'
);


ALTER TYPE "public"."feedback_types" OWNER TO "postgres";


COMMENT ON TYPE "public"."feedback_types" IS 'Types of Feedback';



CREATE TYPE "public"."interview_statuses" AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."interview_statuses" OWNER TO "postgres";


COMMENT ON TYPE "public"."interview_statuses" IS 'Statuses of Interviews';



CREATE TYPE "public"."measurement_alignment_levels" AS ENUM (
    'question',
    'step',
    'section'
);


ALTER TYPE "public"."measurement_alignment_levels" OWNER TO "postgres";


COMMENT ON TYPE "public"."measurement_alignment_levels" IS 'Alignment levels for metrics';



CREATE TYPE "public"."measurement_providers" AS ENUM (
    'SAP',
    'other'
);


ALTER TYPE "public"."measurement_providers" OWNER TO "postgres";


COMMENT ON TYPE "public"."measurement_providers" IS 'Providers of metric data sources';



CREATE TYPE "public"."priority" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE "public"."priority" OWNER TO "postgres";


CREATE TYPE "public"."program_phase_status" AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'archived'
);


ALTER TYPE "public"."program_phase_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."program_phase_status" IS 'Program Execution Status';



CREATE TYPE "public"."program_statuses" AS ENUM (
    'draft',
    'active',
    'under_review',
    'completed',
    'archived'
);


ALTER TYPE "public"."program_statuses" OWNER TO "postgres";


COMMENT ON TYPE "public"."program_statuses" IS 'Program Statuses';



CREATE TYPE "public"."question_part_answer_type" AS ENUM (
    'boolean',
    'scale',
    'labelled_scale',
    'percentage',
    'number'
);


ALTER TYPE "public"."question_part_answer_type" OWNER TO "postgres";


CREATE TYPE "public"."questionnaire_statuses" AS ENUM (
    'draft',
    'active',
    'under_review',
    'archived'
);


ALTER TYPE "public"."questionnaire_statuses" OWNER TO "postgres";


COMMENT ON TYPE "public"."questionnaire_statuses" IS 'Statuses of Questionnaires';



CREATE TYPE "public"."rating_score_source" AS ENUM (
    'direct',
    'calculated',
    'override'
);


ALTER TYPE "public"."rating_score_source" OWNER TO "postgres";


CREATE TYPE "public"."recommendation_status" AS ENUM (
    'not_started',
    'in_progress',
    'completed'
);


ALTER TYPE "public"."recommendation_status" OWNER TO "postgres";


CREATE TYPE "public"."role_levels" AS ENUM (
    'executive',
    'management',
    'supervisor',
    'professional',
    'technician',
    'operator',
    'specialist',
    'other'
);


ALTER TYPE "public"."role_levels" OWNER TO "postgres";


COMMENT ON TYPE "public"."role_levels" IS 'Role Levels';



CREATE TYPE "public"."subscription_tier_enum" AS ENUM (
    'demo',
    'consultant',
    'enterprise',
    'interviewee'
);


ALTER TYPE "public"."subscription_tier_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cascade_soft_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- Only proceed if this is a soft delete (is_deleted changed from false to true)
  IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
    
    -- Handle different parent tables
    CASE TG_TABLE_NAME
      WHEN 'companies' THEN
        -- Cascade to business_units
        UPDATE business_units 
        SET is_deleted = true, deleted_at = NOW() 
        WHERE company_id = NEW.id AND is_deleted = false;
        
        -- Cascade to assessments
        UPDATE assessments 
        SET is_deleted = true, deleted_at = NOW() 
        WHERE company_id = NEW.id AND is_deleted = false;
        
        -- Cascade to asset_groups
        UPDATE asset_groups 
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
        
        -- Cascade to work_groups
        UPDATE work_groups 
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

      WHEN 'interviews' THEN
        -- Cascade to interview_responses
        UPDATE interview_responses 
        SET is_deleted = true, deleted_at = NOW() 
        WHERE interview_id = NEW.id AND is_deleted = false;

      WHEN 'interview_responses' THEN
        -- Cascade to interview_response_actions
        UPDATE interview_response_actions 
        SET is_deleted = true, deleted_at = NOW() 
        WHERE interview_response_id = NEW.id AND is_deleted = false;
        
        -- Hard delete interview_response_roles (no soft delete support)
        DELETE FROM interview_response_roles 
        WHERE interview_response_id = NEW.id;

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

    END CASE;
    
  END IF;
  
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."cascade_soft_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    INSERT INTO public.profiles (id, email, subscription_tier)
    VALUES (
      user_id,
      user_email,
      CASE
        WHEN user_metadata->>'account_type' = 'interviewee'
          THEN 'interviewee'::public.subscription_tier_enum
        ELSE 'demo'::public.subscription_tier_enum
      END
    );
  END;$$;


ALTER FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_demo_company"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT id 
  FROM public.companies 
  WHERE is_demo = true 
  LIMIT 1
$$;


ALTER FUNCTION "public"."get_demo_company"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Use PERFORM for void functions, not SELECT
  PERFORM public.create_user_profile(
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data
  );
  
  -- This is required for AFTER INSERT triggers
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_min_company_role"("check_company_id" "uuid", "check_role" "public"."company_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_companies 
    WHERE user_id = auth.uid()
      AND company_id = check_company_id 
      AND role = ANY(
        CASE check_role
          WHEN 'owner' THEN ARRAY['owner']::company_role[]
          WHEN 'admin' THEN ARRAY['owner', 'admin']::company_role[]
          WHEN 'viewer' THEN ARRAY['owner', 'admin', 'viewer']::company_role[]
        END
      )
  );
$$;


ALTER FUNCTION "public"."has_min_company_role"("check_company_id" "uuid", "check_role" "public"."company_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_demo_company"("company_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COALESCE(is_demo, false)
  FROM public.companies
  WHERE id = company_id AND is_deleted = false
$$;


ALTER FUNCTION "public"."is_demo_company"("company_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_demo_mode_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$SELECT COALESCE(subscription_tier = 'demo', false)
FROM public.profiles
WHERE id = auth.uid()$$;


ALTER FUNCTION "public"."is_demo_mode_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_demo_questionnaire"("questionnaire_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COALESCE(is_demo, false)
  FROM public.questionnaires
  WHERE id = questionnaire_id AND is_deleted = false
$$;


ALTER FUNCTION "public"."is_demo_questionnaire"("questionnaire_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_questionnaire_owner"("q_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM questionnaires 
        WHERE id = q_id 
        AND created_by = auth.uid()
        AND is_valid_user()
    );
END;
$$;


ALTER FUNCTION "public"."is_questionnaire_owner"("q_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_valid_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$SELECT is_admin() OR
(auth.uid() IS NOT NULL AND NOT is_demo_mode_user())$$;


ALTER FUNCTION "public"."is_valid_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_companies"() RETURNS TABLE("company_id" "uuid", "role" "public"."company_role")
    LANGUAGE "sql" STABLE
    AS $$
  SELECT company_id, role 
  FROM public.user_companies 
  WHERE user_id = auth.uid()  -- auth.uid() is built-in and works
$$;


ALTER FUNCTION "public"."user_companies"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assessment_objectives" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "assessment_id" bigint NOT NULL,
    "title" character varying NOT NULL,
    "description" character varying,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."assessment_objectives" OWNER TO "postgres";


ALTER TABLE "public"."assessment_objectives" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."assessment_objectives_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questionnaire_rating_scales" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "order_index" smallint NOT NULL,
    "value" smallint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "questionnaire_id" bigint NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."questionnaire_rating_scales" OWNER TO "postgres";


ALTER TABLE "public"."questionnaire_rating_scales" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."assessment_rating_scales_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questionnaires" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "guidelines" character varying,
    "is_demo" boolean DEFAULT false NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "status" "public"."questionnaire_statuses" DEFAULT 'draft'::"public"."questionnaire_statuses" NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."questionnaires" OWNER TO "postgres";


ALTER TABLE "public"."questionnaires" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."assessment_templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "questionnaire_id" bigint,
    "name" character varying NOT NULL,
    "description" character varying,
    "status" "public"."assessment_statuses" DEFAULT 'draft'::"public"."assessment_statuses" NOT NULL,
    "scheduled_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "business_unit_id" bigint,
    "region_id" bigint,
    "site_id" bigint,
    "asset_group_id" bigint,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "type" "public"."assessment_types" NOT NULL,
    "completed_at" timestamp with time zone,
    "company_id" "uuid" NOT NULL,
    "interview_overview" "text",
    "program_phase_id" bigint
);


ALTER TABLE "public"."assessments" OWNER TO "postgres";


ALTER TABLE "public"."assessments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."assessments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."asset_group_contacts" (
    "asset_group_id" bigint NOT NULL,
    "contact_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."asset_group_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."asset_groups" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "site_id" bigint NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "code" character varying,
    "asset_type" character varying,
    "company_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."asset_groups" OWNER TO "postgres";


ALTER TABLE "public"."asset_groups" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."asset_groups_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."business_unit_contacts" (
    "business_unit_id" bigint NOT NULL,
    "contact_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."business_unit_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_units" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" character varying NOT NULL,
    "code" character varying,
    "description" character varying,
    "company_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."business_units" OWNER TO "postgres";


ALTER TABLE "public"."business_units" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."business_units_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."measurements_calculated" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "measurement_definition_id" bigint NOT NULL,
    "data_source" character varying,
    "calculated_value" numeric NOT NULL,
    "calculation_metadata" "jsonb",
    "program_phase_id" bigint,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "business_unit_id" bigint,
    "region_id" bigint,
    "site_id" bigint,
    "asset_group_id" bigint,
    "work_group_id" bigint,
    "role_id" bigint,
    "assessment_id" bigint,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."measurements_calculated" OWNER TO "postgres";


COMMENT ON TABLE "public"."measurements_calculated" IS 'Calculated measurements for desktop analysis';



ALTER TABLE "public"."measurements_calculated" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."calculated_metrics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "code" character varying,
    "description" character varying,
    "icon_url" character varying,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_demo" boolean DEFAULT false NOT NULL,
    "branding" "jsonb"
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_contacts" (
    "company_id" "uuid" NOT NULL,
    "contact_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."company_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "full_name" character varying NOT NULL,
    "email" character varying NOT NULL,
    "phone" character varying,
    "title" character varying,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


ALTER TABLE "public"."contacts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contacts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."dashboards" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" character varying NOT NULL,
    "layout" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "widgets" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."dashboards" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboards" IS 'Dashboards';



ALTER TABLE "public"."dashboards" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."dashboards_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "message" character varying NOT NULL,
    "page_url" character varying NOT NULL,
    "type" "public"."feedback_types" DEFAULT 'general'::"public"."feedback_types" NOT NULL,
    "data" "jsonb"
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."feedback" IS 'User feedback';



ALTER TABLE "public"."feedback" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interview_evidence" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "uploaded_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "interview_response_id" bigint NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "company_id" "uuid" NOT NULL,
    "interview_id" bigint NOT NULL
);


ALTER TABLE "public"."interview_evidence" OWNER TO "postgres";


ALTER TABLE "public"."interview_evidence" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interview_evidence_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interview_question_applicable_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "interview_id" bigint NOT NULL,
    "questionnaire_question_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL,
    "role_id" bigint,
    "is_universal" boolean
);


ALTER TABLE "public"."interview_question_applicable_roles" OWNER TO "postgres";


ALTER TABLE "public"."interview_question_applicable_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interview_question_applicable_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interview_question_part_responses" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "interview_response_id" bigint NOT NULL,
    "question_part_id" bigint NOT NULL,
    "answer_value" "text" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."interview_question_part_responses" OWNER TO "postgres";


ALTER TABLE "public"."interview_question_part_responses" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interview_question_part_responses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interview_response_actions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" character varying,
    "description" character varying NOT NULL,
    "interview_response_id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "company_id" "uuid" NOT NULL,
    "interview_id" bigint NOT NULL
);


ALTER TABLE "public"."interview_response_actions" OWNER TO "postgres";


ALTER TABLE "public"."interview_response_actions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interview_response_actions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interview_response_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "role_id" bigint NOT NULL,
    "interview_response_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL,
    "interview_id" bigint NOT NULL
);


ALTER TABLE "public"."interview_response_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."interview_response_roles" IS 'Association between roles and interviewee responses';



ALTER TABLE "public"."interview_response_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interview_response_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interview_responses" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "rating_score" smallint,
    "comments" character varying,
    "answered_at" timestamp with time zone,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "interview_id" bigint NOT NULL,
    "questionnaire_question_id" bigint NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_applicable" boolean DEFAULT true NOT NULL,
    "company_id" "uuid" NOT NULL,
    "is_unknown" boolean DEFAULT false NOT NULL,
    "score_source" "public"."rating_score_source" DEFAULT 'direct'::"public"."rating_score_source" NOT NULL
);


ALTER TABLE "public"."interview_responses" OWNER TO "postgres";


ALTER TABLE "public"."interview_responses" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interview_responses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interview_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "interview_id" bigint NOT NULL,
    "role_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."interview_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."interview_roles" IS 'This restricts the scope of interviews to the related roles.';



ALTER TABLE "public"."interview_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interview_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."interviews" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "interviewer_id" "uuid" DEFAULT "auth"."uid"(),
    "assessment_id" bigint,
    "notes" character varying,
    "name" character varying DEFAULT 'Interview'::character varying NOT NULL,
    "is_individual" boolean DEFAULT false NOT NULL,
    "access_code" character varying,
    "assigned_role_id" bigint,
    "enabled" boolean DEFAULT false NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "status" "public"."interview_statuses" DEFAULT 'pending'::"public"."interview_statuses" NOT NULL,
    "program_id" bigint,
    "questionnaire_id" bigint,
    "company_id" "uuid" NOT NULL,
    "interview_contact_id" bigint,
    "program_phase_id" bigint,
    "interviewee_id" "uuid",
    "due_at" timestamp with time zone,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."interviews" OWNER TO "postgres";


ALTER TABLE "public"."interviews" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."interviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."measurement_alignments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "calculated_metric_id" bigint NOT NULL,
    "questionnaire_question_id" bigint,
    "questionnaire_step_id" bigint,
    "questionnaire_section_id" bigint,
    "company_id" "uuid" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "alignment_level" "public"."measurement_alignment_levels",
    "program_id" bigint NOT NULL
);


ALTER TABLE "public"."measurement_alignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."measurement_alignments" IS 'Measurement alignments for program desktop analysis';



CREATE TABLE IF NOT EXISTS "public"."measurement_definitions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "calculation_type" character varying,
    "provider" "public"."measurement_providers",
    "objective" "text",
    "calculation" "text",
    "required_csv_columns" "jsonb",
    "unit" character varying,
    "min_value" numeric,
    "max_value" numeric,
    "active" boolean DEFAULT false NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "check_required_csv_columns_structure" CHECK ((("required_csv_columns" IS NULL) OR ("jsonb_typeof"("required_csv_columns") = 'array'::"text")))
);


ALTER TABLE "public"."measurement_definitions" OWNER TO "postgres";


COMMENT ON TABLE "public"."measurement_definitions" IS 'Shared measurement definitions for desktop analysis';



ALTER TABLE "public"."measurement_alignments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."metric_alignments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."measurement_definitions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."metric_definitions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "is_internal" boolean DEFAULT false NOT NULL,
    "subscription_tier" "public"."subscription_tier_enum" DEFAULT 'demo'::"public"."subscription_tier_enum" NOT NULL,
    "subscription_features" "jsonb" DEFAULT '{"maxCompanies": 1}'::"jsonb" NOT NULL,
    "onboarded" boolean DEFAULT false NOT NULL,
    "onboarded_at" timestamp with time zone
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profiles';



CREATE TABLE IF NOT EXISTS "public"."program_phases" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "program_id" bigint NOT NULL,
    "sequence_number" smallint DEFAULT '1'::smallint NOT NULL,
    "planned_start_date" timestamp with time zone,
    "actual_start_date" timestamp with time zone,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "notes" "text",
    "status" "public"."program_phase_status" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "locked_for_analysis_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying,
    "planned_end_date" timestamp with time zone,
    "actual_end_date" timestamp with time zone,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."program_phases" OWNER TO "postgres";


ALTER TABLE "public"."program_phases" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."program_executions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."program_measurements" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "measurement_definition_id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "program_id" bigint NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."program_measurements" OWNER TO "postgres";


COMMENT ON TABLE "public"."program_measurements" IS 'Program measurements';



ALTER TABLE "public"."program_measurements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."program_metrics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."program_objectives" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "program_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."program_objectives" OWNER TO "postgres";


COMMENT ON TABLE "public"."program_objectives" IS 'Program Objectives';



ALTER TABLE "public"."program_objectives" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."program_objectives_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."programs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "company_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "current_sequence_number" smallint DEFAULT '1'::smallint NOT NULL,
    "is_demo" boolean DEFAULT false NOT NULL,
    "onsite_questionnaire_id" bigint,
    "status" "public"."program_statuses" DEFAULT 'draft'::"public"."program_statuses" NOT NULL,
    "presite_questionnaire_id" bigint
);


ALTER TABLE "public"."programs" OWNER TO "postgres";


COMMENT ON TABLE "public"."programs" IS 'Assessment Programs';



ALTER TABLE "public"."programs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."programs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questionnaire_question_rating_scales" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "questionnaire_question_id" bigint NOT NULL,
    "questionnaire_rating_scale_id" bigint NOT NULL,
    "description" character varying NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "questionnaire_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."questionnaire_question_rating_scales" OWNER TO "postgres";


ALTER TABLE "public"."questionnaire_question_rating_scales" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."question_rating_scales_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questionnaire_question_parts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "text" "text" NOT NULL,
    "order_index" smallint NOT NULL,
    "answer_type" "public"."question_part_answer_type" NOT NULL,
    "options" "jsonb" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "questionnaire_question_id" bigint NOT NULL
);


ALTER TABLE "public"."questionnaire_question_parts" OWNER TO "postgres";


ALTER TABLE "public"."questionnaire_question_parts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."questionnaire_question_parts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questionnaire_question_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "questionnaire_question_id" bigint NOT NULL,
    "shared_role_id" bigint NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "questionnaire_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."questionnaire_question_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."questionnaire_question_roles" IS 'Roles associated with questionnaire questions';



CREATE TABLE IF NOT EXISTS "public"."questionnaire_questions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "questionnaire_step_id" bigint NOT NULL,
    "question_text" character varying NOT NULL,
    "context" character varying DEFAULT 'Placeholder context'::character varying NOT NULL,
    "order_index" smallint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" character varying NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "questionnaire_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL,
    "rating_scale_mapping" "jsonb"
);


ALTER TABLE "public"."questionnaire_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questionnaire_sections" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "questionnaire_id" bigint NOT NULL,
    "title" character varying NOT NULL,
    "order_index" smallint NOT NULL,
    "expanded" boolean NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."questionnaire_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questionnaire_steps" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" character varying NOT NULL,
    "order_index" smallint NOT NULL,
    "expanded" boolean DEFAULT true NOT NULL,
    "questionnaire_section_id" bigint NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "questionnaire_id" bigint NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."questionnaire_steps" OWNER TO "postgres";


ALTER TABLE "public"."questionnaire_question_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."qustionnaire_question_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."recommendations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "program_id" bigint,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "company_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "context" "text" NOT NULL,
    "priority" "public"."priority" NOT NULL,
    "status" "public"."recommendation_status" DEFAULT 'not_started'::"public"."recommendation_status" NOT NULL,
    "title" character varying NOT NULL,
    "assessment_id" bigint
);


ALTER TABLE "public"."recommendations" OWNER TO "postgres";


ALTER TABLE "public"."recommendations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."recommendations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."region_contacts" (
    "region_id" bigint NOT NULL,
    "contact_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."region_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "business_unit_id" bigint NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "code" character varying,
    "company_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."regions" OWNER TO "postgres";


ALTER TABLE "public"."regions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."regions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."role_contacts" (
    "role_id" bigint NOT NULL,
    "contact_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."role_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "code" character varying,
    "company_id" "uuid" NOT NULL,
    "shared_role_id" bigint,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "level" "public"."role_levels",
    "work_group_id" bigint NOT NULL,
    "reports_to_role_id" bigint
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


ALTER TABLE "public"."roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."shared_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "company_id" "uuid"
);


ALTER TABLE "public"."shared_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."shared_roles" IS 'Shared global roles';



ALTER TABLE "public"."shared_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."shared_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."site_contacts" (
    "site_id" bigint NOT NULL,
    "contact_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."site_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sites" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "code" character varying,
    "region_id" bigint NOT NULL,
    "lat" double precision,
    "lng" double precision,
    "company_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."sites" OWNER TO "postgres";


ALTER TABLE "public"."sites" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."sites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."questionnaire_questions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."survey_questions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."questionnaire_sections" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."survey_sections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."questionnaire_steps" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."survey_steps_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_companies" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."company_role" DEFAULT 'viewer'::"public"."company_role" NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_companies" OWNER TO "postgres";


ALTER TABLE "public"."user_companies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_companies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."work_group_contacts" (
    "work_group_id" bigint NOT NULL,
    "contact_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."work_group_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_groups" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "code" character varying,
    "company_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    "asset_group_id" bigint NOT NULL
);


ALTER TABLE "public"."work_groups" OWNER TO "postgres";


ALTER TABLE "public"."work_groups" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."work_groups_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."assessment_objectives"
    ADD CONSTRAINT "assessment_objectives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_rating_scales"
    ADD CONSTRAINT "assessment_rating_scales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaires"
    ADD CONSTRAINT "assessment_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_group_contacts"
    ADD CONSTRAINT "asset_group_contacts_pkey" PRIMARY KEY ("asset_group_id", "contact_id");



ALTER TABLE ONLY "public"."asset_groups"
    ADD CONSTRAINT "asset_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_unit_contacts"
    ADD CONSTRAINT "business_unit_contacts_pkey" PRIMARY KEY ("business_unit_id", "contact_id");



ALTER TABLE ONLY "public"."business_units"
    ADD CONSTRAINT "business_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_contacts"
    ADD CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("company_id", "contact_id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_evidence"
    ADD CONSTRAINT "interview_evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_question_applicable_roles"
    ADD CONSTRAINT "interview_question_applicable_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_question_part_responses"
    ADD CONSTRAINT "interview_question_part_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_question_part_responses"
    ADD CONSTRAINT "interview_question_part_responses_unique_response_part" UNIQUE ("interview_response_id", "question_part_id");



ALTER TABLE ONLY "public"."interview_response_actions"
    ADD CONSTRAINT "interview_response_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_response_roles"
    ADD CONSTRAINT "interview_response_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_responses"
    ADD CONSTRAINT "interview_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_roles"
    ADD CONSTRAINT "interview_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."measurement_alignments"
    ADD CONSTRAINT "metric_alignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."measurement_definitions"
    ADD CONSTRAINT "metric_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_phases"
    ADD CONSTRAINT "program_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_measurements"
    ADD CONSTRAINT "program_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_objectives"
    ADD CONSTRAINT "program_objectives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_question_rating_scales"
    ADD CONSTRAINT "question_rating_scales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_question_parts"
    ADD CONSTRAINT "questionnaire_question_parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_question_roles"
    ADD CONSTRAINT "qustionnaire_question_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."region_contacts"
    ADD CONSTRAINT "region_contacts_pkey" PRIMARY KEY ("region_id", "contact_id");



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_contacts"
    ADD CONSTRAINT "role_contacts_pkey" PRIMARY KEY ("role_id", "contact_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_roles"
    ADD CONSTRAINT "shared_roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."shared_roles"
    ADD CONSTRAINT "shared_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_contacts"
    ADD CONSTRAINT "site_contacts_pkey" PRIMARY KEY ("site_id", "contact_id");



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_questions"
    ADD CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_sections"
    ADD CONSTRAINT "survey_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_steps"
    ADD CONSTRAINT "survey_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "unique_assessment_measurement_hierarchy" UNIQUE ("assessment_id", "measurement_definition_id", "company_id", "business_unit_id", "region_id", "site_id", "asset_group_id", "work_group_id", "role_id");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_unique_user_company" UNIQUE ("user_id", "company_id");



ALTER TABLE ONLY "public"."work_group_contacts"
    ADD CONSTRAINT "work_group_contacts_pkey" PRIMARY KEY ("work_group_id", "contact_id");



ALTER TABLE ONLY "public"."work_groups"
    ADD CONSTRAINT "work_groups_pkey" PRIMARY KEY ("id");



CREATE INDEX "assessments_phase_id_idx" ON "public"."assessments" USING "btree" ("program_phase_id");



CREATE INDEX "idx_assessment_objectives_assessment_id" ON "public"."assessment_objectives" USING "btree" ("assessment_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessment_objectives_created_by" ON "public"."assessment_objectives" USING "btree" ("created_by");



CREATE INDEX "idx_assessments_asset_group_id" ON "public"."assessments" USING "btree" ("asset_group_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_business_unit_id" ON "public"."assessments" USING "btree" ("business_unit_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_company_id" ON "public"."assessments" USING "btree" ("company_id");



CREATE INDEX "idx_assessments_company_status" ON "public"."assessments" USING "btree" ("company_id", "status") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_completed_at" ON "public"."assessments" USING "btree" ("completed_at") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_questionnaire_id" ON "public"."assessments" USING "btree" ("questionnaire_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_region_id" ON "public"."assessments" USING "btree" ("region_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_scheduled_at" ON "public"."assessments" USING "btree" ("scheduled_at") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_site_id" ON "public"."assessments" USING "btree" ("site_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_status" ON "public"."assessments" USING "btree" ("status") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_type" ON "public"."assessments" USING "btree" ("type") WHERE ("is_deleted" = false);



CREATE INDEX "idx_assessments_updated_at" ON "public"."assessments" USING "btree" ("updated_at" DESC) WHERE ("is_deleted" = false);



CREATE INDEX "idx_asset_group_contacts_contact_id" ON "public"."asset_group_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_asset_groups_company_id" ON "public"."asset_groups" USING "btree" ("company_id");



CREATE INDEX "idx_asset_groups_site_id" ON "public"."asset_groups" USING "btree" ("site_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_business_unit_contacts_contact_id" ON "public"."business_unit_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_business_units_company_id" ON "public"."business_units" USING "btree" ("company_id");



CREATE INDEX "idx_calculated_measurements_assessment" ON "public"."measurements_calculated" USING "btree" ("assessment_id");



CREATE INDEX "idx_calculated_measurements_measurement_assessment" ON "public"."measurements_calculated" USING "btree" ("measurement_definition_id", "assessment_id");



CREATE INDEX "idx_companies_demo" ON "public"."companies" USING "btree" ("is_demo") WHERE ("is_deleted" = false);



CREATE INDEX "idx_company_contacts_contact_id" ON "public"."company_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_contacts_company_id" ON "public"."contacts" USING "btree" ("company_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_contacts_email" ON "public"."contacts" USING "btree" ("email") WHERE ("is_deleted" = false);



CREATE INDEX "idx_feedback_type" ON "public"."feedback" USING "btree" ("type");



CREATE INDEX "idx_interview_evidence_interview_response_id" ON "public"."interview_evidence" USING "btree" ("interview_response_id");



CREATE INDEX "idx_interview_response_actions_interview_response_id" ON "public"."interview_response_actions" USING "btree" ("interview_response_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interview_response_roles_interview_response_id" ON "public"."interview_response_roles" USING "btree" ("interview_response_id");



CREATE INDEX "idx_interview_response_roles_role_id" ON "public"."interview_response_roles" USING "btree" ("role_id");



CREATE INDEX "idx_interview_responses_interview_id" ON "public"."interview_responses" USING "btree" ("interview_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interview_responses_interview_rating" ON "public"."interview_responses" USING "btree" ("interview_id", "rating_score") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interview_responses_questionnaire_question_id" ON "public"."interview_responses" USING "btree" ("questionnaire_question_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interview_roles_interview_id" ON "public"."interview_roles" USING "btree" ("interview_id");



CREATE INDEX "idx_interview_roles_role_id" ON "public"."interview_roles" USING "btree" ("role_id");



CREATE INDEX "idx_interviews_assessment_id" ON "public"."interviews" USING "btree" ("assessment_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interviews_assessment_status" ON "public"."interviews" USING "btree" ("assessment_id", "status") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interviews_assigned_role_id" ON "public"."interviews" USING "btree" ("assigned_role_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interviews_program_id" ON "public"."interviews" USING "btree" ("program_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interviews_public_access" ON "public"."interviews" USING "btree" ("access_code") WHERE (("is_individual" = true) AND ("is_deleted" = false));



CREATE INDEX "idx_interviews_questionnaire_id" ON "public"."interviews" USING "btree" ("questionnaire_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interviews_status" ON "public"."interviews" USING "btree" ("status") WHERE ("is_deleted" = false);



CREATE INDEX "idx_interviews_updated_at" ON "public"."interviews" USING "btree" ("updated_at" DESC) WHERE ("is_deleted" = false);



CREATE INDEX "idx_profiles_admin" ON "public"."profiles" USING "btree" ("is_admin") WHERE ("is_admin" = true);



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_internal" ON "public"."profiles" USING "btree" ("is_internal") WHERE ("is_internal" = true);



CREATE INDEX "idx_profiles_subscription_tier" ON "public"."profiles" USING "btree" ("subscription_tier");



CREATE INDEX "idx_program_executions_program_id" ON "public"."program_phases" USING "btree" ("program_id");



CREATE INDEX "idx_program_executions_scheduled_at" ON "public"."program_phases" USING "btree" ("planned_start_date");



CREATE INDEX "idx_program_executions_status" ON "public"."program_phases" USING "btree" ("status");



CREATE INDEX "idx_program_objectives_company_id" ON "public"."program_objectives" USING "btree" ("company_id");



CREATE INDEX "idx_program_objectives_program_id" ON "public"."program_objectives" USING "btree" ("program_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_programs_company_id" ON "public"."programs" USING "btree" ("company_id");



CREATE INDEX "idx_programs_company_status" ON "public"."programs" USING "btree" ("company_id", "status") WHERE ("is_deleted" = false);



CREATE INDEX "idx_programs_demo" ON "public"."programs" USING "btree" ("is_demo") WHERE ("is_deleted" = false);



CREATE INDEX "idx_programs_onsite_questionnaire_id" ON "public"."programs" USING "btree" ("onsite_questionnaire_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_programs_presite_questionnaire_id" ON "public"."programs" USING "btree" ("presite_questionnaire_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_programs_status" ON "public"."programs" USING "btree" ("status") WHERE ("is_deleted" = false);



CREATE INDEX "idx_question_rating_scales_quest_deleted" ON "public"."questionnaire_question_rating_scales" USING "btree" ("questionnaire_id", "is_deleted");



CREATE INDEX "idx_questionnaire_question_rating_scales_question_id" ON "public"."questionnaire_question_rating_scales" USING "btree" ("questionnaire_question_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_question_rating_scales_scale_id" ON "public"."questionnaire_question_rating_scales" USING "btree" ("questionnaire_rating_scale_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_question_roles_question_id" ON "public"."questionnaire_question_roles" USING "btree" ("questionnaire_question_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_question_roles_shared_role_id" ON "public"."questionnaire_question_roles" USING "btree" ("shared_role_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_questions_quest_deleted_order" ON "public"."questionnaire_questions" USING "btree" ("questionnaire_id", "is_deleted", "order_index");



CREATE INDEX "idx_questionnaire_questions_step_id" ON "public"."questionnaire_questions" USING "btree" ("questionnaire_step_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_questions_step_order" ON "public"."questionnaire_questions" USING "btree" ("questionnaire_step_id", "order_index") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_rating_scales_quest_deleted_order" ON "public"."questionnaire_rating_scales" USING "btree" ("questionnaire_id", "is_deleted", "order_index");



CREATE INDEX "idx_questionnaire_rating_scales_questionnaire_id" ON "public"."questionnaire_rating_scales" USING "btree" ("questionnaire_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_sections_quest_deleted_order" ON "public"."questionnaire_sections" USING "btree" ("questionnaire_id", "is_deleted", "order_index");



CREATE INDEX "idx_questionnaire_sections_questionnaire_id" ON "public"."questionnaire_sections" USING "btree" ("questionnaire_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_sections_questionnaire_order" ON "public"."questionnaire_sections" USING "btree" ("questionnaire_id", "order_index") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_steps_quest_deleted_order" ON "public"."questionnaire_steps" USING "btree" ("questionnaire_id", "is_deleted", "order_index");



CREATE INDEX "idx_questionnaire_steps_section_id" ON "public"."questionnaire_steps" USING "btree" ("questionnaire_section_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaire_steps_section_order" ON "public"."questionnaire_steps" USING "btree" ("questionnaire_section_id", "order_index") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaires_demo" ON "public"."questionnaires" USING "btree" ("is_demo") WHERE ("is_deleted" = false);



CREATE INDEX "idx_questionnaires_status" ON "public"."questionnaires" USING "btree" ("status") WHERE ("is_deleted" = false);



CREATE INDEX "idx_region_contacts_contact_id" ON "public"."region_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_regions_business_unit_id" ON "public"."regions" USING "btree" ("business_unit_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_regions_company_id" ON "public"."regions" USING "btree" ("company_id");



CREATE INDEX "idx_role_contacts_contact_id" ON "public"."role_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_roles_company_id" ON "public"."roles" USING "btree" ("company_id");



CREATE INDEX "idx_roles_level" ON "public"."roles" USING "btree" ("level") WHERE ("is_deleted" = false);



CREATE INDEX "idx_roles_reports_to_role_id" ON "public"."roles" USING "btree" ("reports_to_role_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_roles_shared_role_id" ON "public"."roles" USING "btree" ("shared_role_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_roles_work_group_id" ON "public"."roles" USING "btree" ("work_group_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_shared_roles_company_id" ON "public"."shared_roles" USING "btree" ("company_id");



CREATE INDEX "idx_site_contacts_contact_id" ON "public"."site_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_sites_company_id" ON "public"."sites" USING "btree" ("company_id");



CREATE INDEX "idx_sites_location" ON "public"."sites" USING "btree" ("lat", "lng") WHERE ("is_deleted" = false);



CREATE INDEX "idx_sites_region_id" ON "public"."sites" USING "btree" ("region_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_user_companies_lookup" ON "public"."user_companies" USING "btree" ("user_id", "company_id", "role");



CREATE INDEX "idx_work_group_contacts_contact_id" ON "public"."work_group_contacts" USING "btree" ("contact_id");



CREATE INDEX "idx_work_groups_asset_group_id" ON "public"."work_groups" USING "btree" ("asset_group_id") WHERE ("is_deleted" = false);



CREATE INDEX "idx_work_groups_company_id" ON "public"."work_groups" USING "btree" ("company_id");



CREATE OR REPLACE TRIGGER "assessments_soft_delete_cascade" AFTER UPDATE ON "public"."assessments" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "asset_groups_soft_delete_cascade" AFTER UPDATE ON "public"."asset_groups" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "business_units_soft_delete_cascade" AFTER UPDATE ON "public"."business_units" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "companies_soft_delete_cascade" AFTER UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "interview_responses_soft_delete_cascade" AFTER UPDATE ON "public"."interview_responses" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "interviews_soft_delete_cascade" AFTER UPDATE ON "public"."interviews" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "questionnaire_questions_soft_delete_cascade" AFTER UPDATE ON "public"."questionnaire_questions" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "questionnaire_sections_soft_delete_cascade" AFTER UPDATE ON "public"."questionnaire_sections" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "questionnaire_steps_soft_delete_cascade" AFTER UPDATE ON "public"."questionnaire_steps" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "questionnaires_soft_delete_cascade" AFTER UPDATE ON "public"."questionnaires" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "regions_soft_delete_cascade" AFTER UPDATE ON "public"."regions" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "sites_soft_delete_cascade" AFTER UPDATE ON "public"."sites" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



CREATE OR REPLACE TRIGGER "work_groups_soft_delete_cascade" AFTER UPDATE ON "public"."work_groups" FOR EACH ROW EXECUTE FUNCTION "public"."cascade_soft_delete"();



ALTER TABLE ONLY "public"."assessment_objectives"
    ADD CONSTRAINT "assessment_objectives_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_objectives"
    ADD CONSTRAINT "assessment_objectives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_objectives"
    ADD CONSTRAINT "assessment_objectives_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_asset_group_id_fkey" FOREIGN KEY ("asset_group_id") REFERENCES "public"."asset_groups"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "public"."business_units"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_phase_id_fkey" FOREIGN KEY ("program_phase_id") REFERENCES "public"."program_phases"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."asset_group_contacts"
    ADD CONSTRAINT "asset_group_contacts_asset_group_id_fkey" FOREIGN KEY ("asset_group_id") REFERENCES "public"."asset_groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_group_contacts"
    ADD CONSTRAINT "asset_group_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_group_contacts"
    ADD CONSTRAINT "asset_group_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_group_contacts"
    ADD CONSTRAINT "asset_group_contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_groups"
    ADD CONSTRAINT "asset_groups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_groups"
    ADD CONSTRAINT "asset_groups_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_groups"
    ADD CONSTRAINT "asset_groups_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_unit_contacts"
    ADD CONSTRAINT "business_unit_contacts_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "public"."business_units"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_unit_contacts"
    ADD CONSTRAINT "business_unit_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_unit_contacts"
    ADD CONSTRAINT "business_unit_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_unit_contacts"
    ADD CONSTRAINT "business_unit_contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_units"
    ADD CONSTRAINT "business_units_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_units"
    ADD CONSTRAINT "business_units_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_measurements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_asset_group_id_fkey" FOREIGN KEY ("asset_group_id") REFERENCES "public"."asset_groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "public"."business_units"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_metric_id_fkey" FOREIGN KEY ("measurement_definition_id") REFERENCES "public"."measurement_definitions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_program_phase_id_fkey" FOREIGN KEY ("program_phase_id") REFERENCES "public"."program_phases"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurements_calculated"
    ADD CONSTRAINT "calculated_metrics_work_group_id_fkey" FOREIGN KEY ("work_group_id") REFERENCES "public"."work_groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_contacts"
    ADD CONSTRAINT "company_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_contacts"
    ADD CONSTRAINT "company_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_contacts"
    ADD CONSTRAINT "company_contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dashboards"
    ADD CONSTRAINT "dashboards_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_evidence"
    ADD CONSTRAINT "interview_evidence_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."interview_evidence"
    ADD CONSTRAINT "interview_evidence_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id");



ALTER TABLE ONLY "public"."interview_evidence"
    ADD CONSTRAINT "interview_evidence_interview_response_id_fkey" FOREIGN KEY ("interview_response_id") REFERENCES "public"."interview_responses"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_evidence"
    ADD CONSTRAINT "interview_evidence_uploaded_by_fkey1" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_applicable_roles"
    ADD CONSTRAINT "interview_question_applicable_ro_questionnaire_question_id_fkey" FOREIGN KEY ("questionnaire_question_id") REFERENCES "public"."questionnaire_questions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_applicable_roles"
    ADD CONSTRAINT "interview_question_applicable_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_applicable_roles"
    ADD CONSTRAINT "interview_question_applicable_roles_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_applicable_roles"
    ADD CONSTRAINT "interview_question_applicable_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_part_responses"
    ADD CONSTRAINT "interview_question_part_responses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_part_responses"
    ADD CONSTRAINT "interview_question_part_responses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_part_responses"
    ADD CONSTRAINT "interview_question_part_responses_interview_response_id_fkey" FOREIGN KEY ("interview_response_id") REFERENCES "public"."interview_responses"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_question_part_responses"
    ADD CONSTRAINT "interview_question_part_responses_question_part_id_fkey" FOREIGN KEY ("question_part_id") REFERENCES "public"."questionnaire_question_parts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_response_actions"
    ADD CONSTRAINT "interview_response_actions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."interview_response_actions"
    ADD CONSTRAINT "interview_response_actions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_response_actions"
    ADD CONSTRAINT "interview_response_actions_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id");



ALTER TABLE ONLY "public"."interview_response_actions"
    ADD CONSTRAINT "interview_response_actions_interview_response_id_fkey" FOREIGN KEY ("interview_response_id") REFERENCES "public"."interview_responses"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_response_roles"
    ADD CONSTRAINT "interview_response_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."interview_response_roles"
    ADD CONSTRAINT "interview_response_roles_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_response_roles"
    ADD CONSTRAINT "interview_response_roles_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_response_roles"
    ADD CONSTRAINT "interview_response_roles_interview_response_id_fkey" FOREIGN KEY ("interview_response_id") REFERENCES "public"."interview_responses"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_response_roles"
    ADD CONSTRAINT "interview_response_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."interview_responses"
    ADD CONSTRAINT "interview_responses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_responses"
    ADD CONSTRAINT "interview_responses_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_responses"
    ADD CONSTRAINT "interview_responses_questionnaire_question_id_fkey" FOREIGN KEY ("questionnaire_question_id") REFERENCES "public"."questionnaire_questions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_roles"
    ADD CONSTRAINT "interview_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."interview_roles"
    ADD CONSTRAINT "interview_roles_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_roles"
    ADD CONSTRAINT "interview_roles_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_roles"
    ADD CONSTRAINT "interview_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_assigned_role_id_fkey" FOREIGN KEY ("assigned_role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_interview_contact_id_fkey" FOREIGN KEY ("interview_contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_interviewee_id_fkey" FOREIGN KEY ("interviewee_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_program_phase_id_fkey" FOREIGN KEY ("program_phase_id") REFERENCES "public"."program_phases"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurement_alignments"
    ADD CONSTRAINT "measurement_alignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurement_alignments"
    ADD CONSTRAINT "measurement_alignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurement_alignments"
    ADD CONSTRAINT "metric_alignments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurement_alignments"
    ADD CONSTRAINT "metric_alignments_questionnaire_question_id_fkey" FOREIGN KEY ("questionnaire_question_id") REFERENCES "public"."questionnaire_questions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurement_alignments"
    ADD CONSTRAINT "metric_alignments_questionnaire_section_id_fkey" FOREIGN KEY ("questionnaire_section_id") REFERENCES "public"."questionnaire_sections"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."measurement_alignments"
    ADD CONSTRAINT "metric_alignments_questionnaire_step_id_fkey" FOREIGN KEY ("questionnaire_step_id") REFERENCES "public"."questionnaire_steps"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_measurements"
    ADD CONSTRAINT "program_measurements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_measurements"
    ADD CONSTRAINT "program_measurements_measurement_id_fkey" FOREIGN KEY ("measurement_definition_id") REFERENCES "public"."measurement_definitions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_measurements"
    ADD CONSTRAINT "program_metrics_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_objectives"
    ADD CONSTRAINT "program_objectives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."program_objectives"
    ADD CONSTRAINT "program_objectives_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_objectives"
    ADD CONSTRAINT "program_objectives_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_phases"
    ADD CONSTRAINT "program_phases_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_phases"
    ADD CONSTRAINT "program_phases_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_phases"
    ADD CONSTRAINT "program_phases_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_presite_questionnaire_id_fkey" FOREIGN KEY ("presite_questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_questionnaire_id_fkey" FOREIGN KEY ("onsite_questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_parts"
    ADD CONSTRAINT "questionnaire_question_parts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_parts"
    ADD CONSTRAINT "questionnaire_question_parts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_parts"
    ADD CONSTRAINT "questionnaire_question_parts_questionnaire_question_id_fkey" FOREIGN KEY ("questionnaire_question_id") REFERENCES "public"."questionnaire_questions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_rating_scales"
    ADD CONSTRAINT "questionnaire_question_rating_questionnaire_rating_scale_i_fkey" FOREIGN KEY ("questionnaire_rating_scale_id") REFERENCES "public"."questionnaire_rating_scales"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_rating_scales"
    ADD CONSTRAINT "questionnaire_question_rating_sc_questionnaire_question_id_fkey" FOREIGN KEY ("questionnaire_question_id") REFERENCES "public"."questionnaire_questions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_rating_scales"
    ADD CONSTRAINT "questionnaire_question_rating_scales_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_rating_scales"
    ADD CONSTRAINT "questionnaire_question_rating_scales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_rating_scales"
    ADD CONSTRAINT "questionnaire_question_rating_scales_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_roles"
    ADD CONSTRAINT "questionnaire_question_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_roles"
    ADD CONSTRAINT "questionnaire_question_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_roles"
    ADD CONSTRAINT "questionnaire_question_roles_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_questions"
    ADD CONSTRAINT "questionnaire_questions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_questions"
    ADD CONSTRAINT "questionnaire_questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_questions"
    ADD CONSTRAINT "questionnaire_questions_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_questions"
    ADD CONSTRAINT "questionnaire_questions_questionnaire_step_id_fkey" FOREIGN KEY ("questionnaire_step_id") REFERENCES "public"."questionnaire_steps"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_rating_scales"
    ADD CONSTRAINT "questionnaire_rating_scales_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_rating_scales"
    ADD CONSTRAINT "questionnaire_rating_scales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_rating_scales"
    ADD CONSTRAINT "questionnaire_rating_scales_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_sections"
    ADD CONSTRAINT "questionnaire_sections_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_sections"
    ADD CONSTRAINT "questionnaire_sections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_sections"
    ADD CONSTRAINT "questionnaire_sections_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_steps"
    ADD CONSTRAINT "questionnaire_steps_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_steps"
    ADD CONSTRAINT "questionnaire_steps_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_steps"
    ADD CONSTRAINT "questionnaire_steps_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_steps"
    ADD CONSTRAINT "questionnaire_steps_questionnaire_section_id_fkey" FOREIGN KEY ("questionnaire_section_id") REFERENCES "public"."questionnaire_sections"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaires"
    ADD CONSTRAINT "questionnaires_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaires"
    ADD CONSTRAINT "questionnaires_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_roles"
    ADD CONSTRAINT "qustionnaire_question_roles_questionnaire_question_id_fkey" FOREIGN KEY ("questionnaire_question_id") REFERENCES "public"."questionnaire_questions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_question_roles"
    ADD CONSTRAINT "qustionnaire_question_roles_shared_role_id_fkey" FOREIGN KEY ("shared_role_id") REFERENCES "public"."shared_roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."region_contacts"
    ADD CONSTRAINT "region_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."region_contacts"
    ADD CONSTRAINT "region_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."region_contacts"
    ADD CONSTRAINT "region_contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."region_contacts"
    ADD CONSTRAINT "region_contacts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "public"."business_units"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_contacts"
    ADD CONSTRAINT "role_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_contacts"
    ADD CONSTRAINT "role_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_contacts"
    ADD CONSTRAINT "role_contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_contacts"
    ADD CONSTRAINT "role_contacts_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_reports_to_role_id_fkey" FOREIGN KEY ("reports_to_role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_shared_role_id_fkey" FOREIGN KEY ("shared_role_id") REFERENCES "public"."shared_roles"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_work_group_id_fkey" FOREIGN KEY ("work_group_id") REFERENCES "public"."work_groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_roles"
    ADD CONSTRAINT "shared_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_roles"
    ADD CONSTRAINT "shared_roles_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_contacts"
    ADD CONSTRAINT "site_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_contacts"
    ADD CONSTRAINT "site_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_contacts"
    ADD CONSTRAINT "site_contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_contacts"
    ADD CONSTRAINT "site_contacts_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_group_contacts"
    ADD CONSTRAINT "work_group_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_group_contacts"
    ADD CONSTRAINT "work_group_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_group_contacts"
    ADD CONSTRAINT "work_group_contacts_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_group_contacts"
    ADD CONSTRAINT "work_group_contacts_work_group_id_fkey" FOREIGN KEY ("work_group_id") REFERENCES "public"."work_groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_groups"
    ADD CONSTRAINT "work_groups_asset_group_id_fkey" FOREIGN KEY ("asset_group_id") REFERENCES "public"."asset_groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_groups"
    ADD CONSTRAINT "work_groups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_groups"
    ADD CONSTRAINT "work_groups_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE "public"."assessment_objectives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_group_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."asset_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_unit_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dashboards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_assessment_objectives" ON "public"."assessment_objectives" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_assessments" ON "public"."assessments" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_asset_group_contacts" ON "public"."asset_group_contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_asset_groups" ON "public"."asset_groups" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_business_unit_contacts" ON "public"."business_unit_contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_business_units" ON "public"."business_units" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_calculated_metrics" ON "public"."measurements_calculated" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_companies" ON "public"."companies" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("id", 'owner'::"public"."company_role"));



CREATE POLICY "delete_company_contacts" ON "public"."company_contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_contacts" ON "public"."contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_dashboards" ON "public"."dashboards" FOR DELETE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "delete_interview_evidence" ON "public"."interview_evidence" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_interview_question_applicable_roles" ON "public"."interview_question_applicable_roles" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_interview_response_actions" ON "public"."interview_response_actions" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_interview_response_roles" ON "public"."interview_response_roles" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_interview_responses" ON "public"."interview_responses" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_interview_roles" ON "public"."interview_roles" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_interviews" ON "public"."interviews" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_metric_alignments" ON "public"."measurement_alignments" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_program_objectives" ON "public"."program_objectives" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_program_phases" ON "public"."program_phases" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_programs" ON "public"."programs" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_public_interview_evidence" ON "public"."interview_evidence" FOR DELETE TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id") AND (("auth"."jwt"() ->> 'sub'::"text") = ("uploaded_by")::"text")));



CREATE POLICY "delete_public_interview_response_actions" ON "public"."interview_response_actions" FOR DELETE TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id") AND (("auth"."jwt"() ->> 'sub'::"text") = ("created_by")::"text")));



CREATE POLICY "delete_questionnaire_question_rating_scales" ON "public"."questionnaire_question_rating_scales" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_questionnaire_question_roles" ON "public"."questionnaire_question_roles" FOR DELETE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "delete_questionnaire_questions" ON "public"."questionnaire_questions" FOR DELETE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "delete_questionnaire_rating_scales" ON "public"."questionnaire_rating_scales" FOR DELETE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "delete_questionnaire_sections" ON "public"."questionnaire_sections" FOR DELETE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "delete_questionnaire_steps" ON "public"."questionnaire_steps" FOR DELETE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "delete_questionnaires" ON "public"."questionnaires" FOR DELETE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "delete_recommendations" ON "public"."recommendations" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_region_contacts" ON "public"."region_contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_regions" ON "public"."regions" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_role_contacts" ON "public"."role_contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_roles" ON "public"."roles" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_shared_roles" ON "public"."shared_roles" FOR DELETE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "delete_site_contacts" ON "public"."site_contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_sites" ON "public"."sites" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_user_companies" ON "public"."user_companies" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_work_group_contacts" ON "public"."work_group_contacts" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "delete_work_groups" ON "public"."work_groups" FOR DELETE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_assessment_objectives" ON "public"."assessment_objectives" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_assessments" ON "public"."assessments" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_asset_group_contacts" ON "public"."asset_group_contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_asset_groups" ON "public"."asset_groups" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_business_unit_contacts" ON "public"."business_unit_contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_business_units" ON "public"."business_units" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_calculated_metrics" ON "public"."measurements_calculated" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_companies" ON "public"."companies" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("created_by" = "auth"."uid"())));



CREATE POLICY "insert_company_contacts" ON "public"."company_contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_contacts" ON "public"."contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_dashboards" ON "public"."dashboards" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "insert_feedback" ON "public"."feedback" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "insert_interview_evidence" ON "public"."interview_evidence" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_interview_question_applicable_roles" ON "public"."interview_question_applicable_roles" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_interview_response_actions" ON "public"."interview_response_actions" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_interview_response_roles" ON "public"."interview_response_roles" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_interview_responses" ON "public"."interview_responses" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_interview_roles" ON "public"."interview_roles" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_interviews" ON "public"."interviews" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_metric_alignments" ON "public"."measurement_alignments" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_program_objectives" ON "public"."program_objectives" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_program_phases" ON "public"."program_phases" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_programs" ON "public"."programs" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_public_interview_evidence" ON "public"."interview_evidence" FOR INSERT TO "authenticated" WITH CHECK (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id") AND (("auth"."jwt"() ->> 'sub'::"text") = ("uploaded_by")::"text")));



CREATE POLICY "insert_public_interview_response_actions" ON "public"."interview_response_actions" FOR INSERT TO "authenticated" WITH CHECK (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id") AND (("auth"."jwt"() ->> 'sub'::"text") = ("created_by")::"text")));



CREATE POLICY "insert_questionnaire_question_rating_scales" ON "public"."questionnaire_question_rating_scales" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_questionnaire_question_roles" ON "public"."questionnaire_question_roles" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_questionnaire_questions" ON "public"."questionnaire_questions" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_questionnaire_rating_scales" ON "public"."questionnaire_rating_scales" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_questionnaire_sections" ON "public"."questionnaire_sections" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_questionnaire_steps" ON "public"."questionnaire_steps" FOR INSERT TO "authenticated" WITH CHECK ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "insert_questionnaires" ON "public"."questionnaires" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "insert_recommendations" ON "public"."recommendations" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_region_contacts" ON "public"."region_contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_regions" ON "public"."regions" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_role_contacts" ON "public"."role_contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_roles" ON "public"."roles" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_shared_roles" ON "public"."shared_roles" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "insert_site_contacts" ON "public"."site_contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_sites" ON "public"."sites" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_user_companies" ON "public"."user_companies" FOR INSERT TO "authenticated" WITH CHECK (("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role") OR (("created_by" = "auth"."uid"()) AND ("user_id" = "auth"."uid"()))));



CREATE POLICY "insert_work_group_contacts" ON "public"."work_group_contacts" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "insert_work_groups" ON "public"."work_groups" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



ALTER TABLE "public"."interview_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_question_applicable_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_response_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_response_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."measurement_alignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."measurement_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."measurements_calculated" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."programs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire_question_rating_scales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire_question_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire_rating_scales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaires" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."region_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."regions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_assessment_objectives" ON "public"."assessment_objectives" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_assessments" ON "public"."assessments" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_asset_group_contacts" ON "public"."asset_group_contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_asset_groups" ON "public"."asset_groups" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_business_unit_contacts" ON "public"."business_unit_contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_business_units" ON "public"."business_units" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_calculated_metrics" ON "public"."measurements_calculated" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_companies" ON "public"."companies" FOR SELECT TO "authenticated" USING (("public"."has_min_company_role"("id", 'viewer'::"public"."company_role") OR ("created_by" = "auth"."uid"())));



CREATE POLICY "select_company_contacts" ON "public"."company_contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_contacts" ON "public"."contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_dashboards" ON "public"."dashboards" FOR SELECT TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "select_interview_evidence" ON "public"."interview_evidence" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_interview_question_applicable_roles" ON "public"."interview_question_applicable_roles" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_interview_response_actions" ON "public"."interview_response_actions" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_interview_response_roles" ON "public"."interview_response_roles" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_interview_responses" ON "public"."interview_responses" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_interview_roles" ON "public"."interview_roles" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_interviews" ON "public"."interviews" FOR SELECT TO "authenticated" USING (("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role") OR ("auth"."uid"() = "interviewee_id")));



CREATE POLICY "select_measurement_definitions" ON "public"."measurement_definitions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "select_metric_alignments" ON "public"."measurement_alignments" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR (EXISTS ( SELECT 1
   FROM "public"."user_companies" "uc1"
  WHERE (("uc1"."user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
           FROM "public"."user_companies" "uc2"
          WHERE (("uc2"."user_id" = "profiles"."id") AND ("uc2"."company_id" = "uc1"."company_id")))))))));



CREATE POLICY "select_program_objectives" ON "public"."program_objectives" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_program_phases" ON "public"."program_phases" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_programs" ON "public"."programs" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_public_assessments" ON "public"."assessments" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'assessmentId'::"text"))::integer = "id")));



CREATE POLICY "select_public_companies" ON "public"."companies" FOR SELECT USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'companyId'::"text"))::"uuid" = "id")));



CREATE POLICY "select_public_interview_evidence" ON "public"."interview_evidence" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id") AND (("auth"."jwt"() ->> 'sub'::"text") = ("uploaded_by")::"text")));



CREATE POLICY "select_public_interview_response_actions" ON "public"."interview_response_actions" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id")));



CREATE POLICY "select_public_interview_responses" ON "public"."interview_responses" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id")));



CREATE POLICY "select_public_questionnaire_question_rating_scales" ON "public"."questionnaire_question_rating_scales" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'questionnaireId'::"text"))::integer = "questionnaire_id")));



CREATE POLICY "select_public_questionnaire_questions" ON "public"."questionnaire_questions" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'questionnaireId'::"text"))::integer = "questionnaire_id")));



CREATE POLICY "select_public_questionnaire_rating_scales" ON "public"."questionnaire_rating_scales" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'questionnaireId'::"text"))::integer = "questionnaire_id")));



CREATE POLICY "select_public_questionnaire_steps" ON "public"."questionnaire_sections" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'questionnaireId'::"text"))::integer = "questionnaire_id")));



CREATE POLICY "select_public_questionnaire_steps" ON "public"."questionnaire_steps" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'questionnaireId'::"text"))::integer = "questionnaire_id")));



CREATE POLICY "select_questionnaire_public" ON "public"."questionnaires" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'questionnaireId'::"text"))::integer = "id")));



CREATE POLICY "select_questionnaire_question_rating_scales" ON "public"."questionnaire_question_rating_scales" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_questionnaire_question_roles" ON "public"."questionnaire_question_roles" FOR SELECT TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role")));



CREATE POLICY "select_questionnaire_questions" ON "public"."questionnaire_questions" FOR SELECT TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role")));



CREATE POLICY "select_questionnaire_rating_scales" ON "public"."questionnaire_rating_scales" FOR SELECT TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role")));



CREATE POLICY "select_questionnaire_sections" ON "public"."questionnaire_sections" FOR SELECT TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role")));



CREATE POLICY "select_questionnaire_steps" ON "public"."questionnaire_steps" FOR SELECT TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role")));



CREATE POLICY "select_questionnaires" ON "public"."questionnaires" FOR SELECT TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR ("is_demo" = true) OR "public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role")));



CREATE POLICY "select_recommendations" ON "public"."recommendations" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_region_contacts" ON "public"."region_contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_regions" ON "public"."regions" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_role_contacts" ON "public"."role_contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_roles" ON "public"."roles" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_shared_roles" ON "public"."shared_roles" FOR SELECT TO "authenticated" USING ((("created_by" IS NULL) OR ("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role")));



CREATE POLICY "select_site_contacts" ON "public"."site_contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_sites" ON "public"."sites" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_user_companies" ON "public"."user_companies" FOR SELECT TO "authenticated" USING (("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role") OR ("user_id" = "auth"."uid"()) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "select_work_group_contacts" ON "public"."work_group_contacts" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



CREATE POLICY "select_work_groups" ON "public"."work_groups" FOR SELECT TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'viewer'::"public"."company_role"));



ALTER TABLE "public"."shared_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_assessment_objectives" ON "public"."assessment_objectives" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_assessments" ON "public"."assessments" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_asset_group_contacts" ON "public"."asset_group_contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_asset_groups" ON "public"."asset_groups" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_business_unit_contacts" ON "public"."business_unit_contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_business_units" ON "public"."business_units" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_calculated_metrics" ON "public"."measurements_calculated" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_companies" ON "public"."companies" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("id", 'admin'::"public"."company_role"));



CREATE POLICY "update_company_contacts" ON "public"."company_contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_contacts" ON "public"."contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_dashboards" ON "public"."dashboards" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "update_interview_evidence" ON "public"."interview_evidence" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_interview_question_applicable_roles" ON "public"."interview_question_applicable_roles" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_interview_response_actions" ON "public"."interview_response_actions" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_interview_response_roles" ON "public"."interview_response_roles" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_interview_responses" ON "public"."interview_responses" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_interview_roles" ON "public"."interview_roles" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_interviews" ON "public"."interviews" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_metric_alignments" ON "public"."measurement_alignments" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "update_program_objectives" ON "public"."program_objectives" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_program_phases" ON "public"."program_phases" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_programs" ON "public"."programs" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_public_interview_evidence" ON "public"."interview_evidence" FOR UPDATE USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id") AND (("auth"."jwt"() ->> 'sub'::"text") = ("uploaded_by")::"text")));



CREATE POLICY "update_public_interview_response_actions" ON "public"."interview_response_actions" FOR UPDATE TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id") AND (("auth"."jwt"() ->> 'sub'::"text") = ("created_by")::"text")));



CREATE POLICY "update_public_interview_responses" ON "public"."interview_responses" FOR UPDATE TO "authenticated" USING (((("auth"."jwt"() ->> 'anonymousRole'::"text") = 'public_interviewee'::"text") AND ((("auth"."jwt"() ->> 'interviewId'::"text"))::integer = "interview_id")));



CREATE POLICY "update_questionnaire_question_rating_scales" ON "public"."questionnaire_question_rating_scales" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_questionnaire_question_roles" ON "public"."questionnaire_question_roles" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"))) WITH CHECK ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "update_questionnaire_questions" ON "public"."questionnaire_questions" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"))) WITH CHECK ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "update_questionnaire_rating_scales" ON "public"."questionnaire_rating_scales" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"))) WITH CHECK ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "update_questionnaire_sections" ON "public"."questionnaire_sections" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"))) WITH CHECK ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "update_questionnaire_steps" ON "public"."questionnaire_steps" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"))) WITH CHECK ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "update_questionnaires" ON "public"."questionnaires" FOR UPDATE TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"))) WITH CHECK ((("created_by" = "auth"."uid"()) OR "public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")));



CREATE POLICY "update_recommendations" ON "public"."recommendations" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_region_contacts" ON "public"."region_contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_regions" ON "public"."regions" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_role_contacts" ON "public"."role_contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_roles" ON "public"."roles" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_shared_roles" ON "public"."shared_roles" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "update_site_contacts" ON "public"."site_contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_sites" ON "public"."sites" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_user_companies" ON "public"."user_companies" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_work_group_contacts" ON "public"."work_group_contacts" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



CREATE POLICY "update_work_groups" ON "public"."work_groups" FOR UPDATE TO "authenticated" USING ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role")) WITH CHECK ("public"."has_min_company_role"("company_id", 'admin'::"public"."company_role"));



ALTER TABLE "public"."user_companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_group_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_groups" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."cascade_soft_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."cascade_soft_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cascade_soft_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_demo_company"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_demo_company"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_demo_company"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_min_company_role"("check_company_id" "uuid", "check_role" "public"."company_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_min_company_role"("check_company_id" "uuid", "check_role" "public"."company_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_min_company_role"("check_company_id" "uuid", "check_role" "public"."company_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_demo_company"("company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_demo_company"("company_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_demo_company"("company_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_demo_mode_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_demo_mode_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_demo_mode_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_demo_questionnaire"("questionnaire_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."is_demo_questionnaire"("questionnaire_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_demo_questionnaire"("questionnaire_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_questionnaire_owner"("q_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."is_questionnaire_owner"("q_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_questionnaire_owner"("q_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_valid_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_valid_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_valid_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_companies"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_companies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_companies"() TO "service_role";


















GRANT ALL ON TABLE "public"."assessment_objectives" TO "anon";
GRANT ALL ON TABLE "public"."assessment_objectives" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_objectives" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_objectives_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_objectives_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_objectives_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_rating_scales" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_rating_scales" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_rating_scales" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_rating_scales_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_rating_scales_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_rating_scales_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaires" TO "anon";
GRANT ALL ON TABLE "public"."questionnaires" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaires" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."assessments" TO "anon";
GRANT ALL ON TABLE "public"."assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."assessments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."asset_group_contacts" TO "anon";
GRANT ALL ON TABLE "public"."asset_group_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_group_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."asset_groups" TO "anon";
GRANT ALL ON TABLE "public"."asset_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_groups" TO "service_role";



GRANT ALL ON SEQUENCE "public"."asset_groups_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."asset_groups_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."asset_groups_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."business_unit_contacts" TO "anon";
GRANT ALL ON TABLE "public"."business_unit_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."business_unit_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."business_units" TO "anon";
GRANT ALL ON TABLE "public"."business_units" TO "authenticated";
GRANT ALL ON TABLE "public"."business_units" TO "service_role";



GRANT ALL ON SEQUENCE "public"."business_units_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."business_units_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."business_units_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."measurements_calculated" TO "anon";
GRANT ALL ON TABLE "public"."measurements_calculated" TO "authenticated";
GRANT ALL ON TABLE "public"."measurements_calculated" TO "service_role";



GRANT ALL ON SEQUENCE "public"."calculated_metrics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."calculated_metrics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."calculated_metrics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_contacts" TO "anon";
GRANT ALL ON TABLE "public"."company_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."company_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contacts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contacts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contacts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."dashboards" TO "anon";
GRANT ALL ON TABLE "public"."dashboards" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboards" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dashboards_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dashboards_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dashboards_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interview_evidence" TO "anon";
GRANT ALL ON TABLE "public"."interview_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_evidence" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interview_evidence_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interview_evidence_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interview_evidence_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interview_question_applicable_roles" TO "anon";
GRANT ALL ON TABLE "public"."interview_question_applicable_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_question_applicable_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interview_question_applicable_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interview_question_applicable_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interview_question_applicable_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interview_question_part_responses" TO "anon";
GRANT ALL ON TABLE "public"."interview_question_part_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_question_part_responses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interview_question_part_responses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interview_question_part_responses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interview_question_part_responses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interview_response_actions" TO "anon";
GRANT ALL ON TABLE "public"."interview_response_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_response_actions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interview_response_actions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interview_response_actions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interview_response_actions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interview_response_roles" TO "anon";
GRANT ALL ON TABLE "public"."interview_response_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_response_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interview_response_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interview_response_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interview_response_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interview_responses" TO "anon";
GRANT ALL ON TABLE "public"."interview_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_responses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interview_responses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interview_responses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interview_responses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interview_roles" TO "anon";
GRANT ALL ON TABLE "public"."interview_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interview_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interview_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interview_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."interviews" TO "anon";
GRANT ALL ON TABLE "public"."interviews" TO "authenticated";
GRANT ALL ON TABLE "public"."interviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interviews_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."measurement_alignments" TO "anon";
GRANT ALL ON TABLE "public"."measurement_alignments" TO "authenticated";
GRANT ALL ON TABLE "public"."measurement_alignments" TO "service_role";



GRANT ALL ON TABLE "public"."measurement_definitions" TO "anon";
GRANT ALL ON TABLE "public"."measurement_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."measurement_definitions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."metric_alignments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."metric_alignments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."metric_alignments_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."metric_definitions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."metric_definitions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."metric_definitions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."program_phases" TO "anon";
GRANT ALL ON TABLE "public"."program_phases" TO "authenticated";
GRANT ALL ON TABLE "public"."program_phases" TO "service_role";



GRANT ALL ON SEQUENCE "public"."program_executions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."program_executions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."program_executions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."program_measurements" TO "anon";
GRANT ALL ON TABLE "public"."program_measurements" TO "authenticated";
GRANT ALL ON TABLE "public"."program_measurements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."program_metrics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."program_metrics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."program_metrics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."program_objectives" TO "anon";
GRANT ALL ON TABLE "public"."program_objectives" TO "authenticated";
GRANT ALL ON TABLE "public"."program_objectives" TO "service_role";



GRANT ALL ON SEQUENCE "public"."program_objectives_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."program_objectives_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."program_objectives_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."programs" TO "anon";
GRANT ALL ON TABLE "public"."programs" TO "authenticated";
GRANT ALL ON TABLE "public"."programs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."programs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."programs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."programs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_question_rating_scales" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_question_rating_scales" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_question_rating_scales" TO "service_role";



GRANT ALL ON SEQUENCE "public"."question_rating_scales_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."question_rating_scales_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."question_rating_scales_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_question_parts" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_question_parts" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_question_parts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."questionnaire_question_parts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questionnaire_question_parts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questionnaire_question_parts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_question_roles" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_question_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_question_roles" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_questions" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_questions" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_sections" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_sections" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_steps" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_steps" TO "service_role";



GRANT ALL ON SEQUENCE "public"."qustionnaire_question_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."qustionnaire_question_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."qustionnaire_question_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recommendations" TO "anon";
GRANT ALL ON TABLE "public"."recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."recommendations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recommendations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recommendations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recommendations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."region_contacts" TO "anon";
GRANT ALL ON TABLE "public"."region_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."region_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."regions" TO "anon";
GRANT ALL ON TABLE "public"."regions" TO "authenticated";
GRANT ALL ON TABLE "public"."regions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."regions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."regions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."regions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."role_contacts" TO "anon";
GRANT ALL ON TABLE "public"."role_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."role_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."shared_roles" TO "anon";
GRANT ALL ON TABLE "public"."shared_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."shared_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shared_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shared_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."site_contacts" TO "anon";
GRANT ALL ON TABLE "public"."site_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."site_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."sites" TO "anon";
GRANT ALL ON TABLE "public"."sites" TO "authenticated";
GRANT ALL ON TABLE "public"."sites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sites_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."survey_questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."survey_questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."survey_questions_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."survey_sections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."survey_sections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."survey_sections_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."survey_steps_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."survey_steps_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."survey_steps_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_companies" TO "anon";
GRANT ALL ON TABLE "public"."user_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."user_companies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_companies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_companies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_companies_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."work_group_contacts" TO "anon";
GRANT ALL ON TABLE "public"."work_group_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."work_group_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."work_groups" TO "anon";
GRANT ALL ON TABLE "public"."work_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."work_groups" TO "service_role";



GRANT ALL ON SEQUENCE "public"."work_groups_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."work_groups_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."work_groups_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow authenticated users to delete company icons"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'company-icons'::text));



  create policy "Allow authenticated users to read company icons"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'company-icons'::text));



  create policy "Allow authenticated users to update company icons"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'company-icons'::text));



  create policy "Allow authenticated users to upload company icons"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'company-icons'::text));



  create policy "Allow full access to authenticated users  2482c_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'temp'::text));



  create policy "Allow full access to authenticated users  2482c_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'temp'::text));



  create policy "Allow full access to authenticated users  2482c_2"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'temp'::text));



