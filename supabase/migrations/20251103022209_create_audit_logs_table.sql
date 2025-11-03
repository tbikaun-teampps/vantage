-- 20251103022209_create_audit_logs_table.sql

-- Create the audit logs table
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID DEFAULT auth.uid(),
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  record_display_name TEXT, -- e.g., "Q4 Assessment" instead of UUID/int8
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],    -- List of fields that were changed
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical indexes for performance
CREATE INDEX idx_audit_logs_company_created ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS for multi-tenant security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone with viewer access or higher can see audit logs
CREATE POLICY "Company members can view audit logs" ON audit_logs
  FOR SELECT 
  USING (has_min_company_role(company_id, 'viewer'::company_role));

-- No INSERT/UPDATE/DELETE policies - only the system should write audit logs
-- The trigger function uses SECURITY DEFINER to bypass RLS when writing

-- Foreign key constraints
ALTER TABLE "public"."audit_logs"
ADD CONSTRAINT "audit_logs_company_id_fkey"
FOREIGN KEY ("company_id")
REFERENCES "public"."companies"("id")
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE "public"."audit_logs"
ADD CONSTRAINT "audit_logs_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."profiles"("id")
ON UPDATE CASCADE
ON DELETE SET NULL;

-- Grant permissions
GRANT SELECT ON audit_logs TO authenticated;
-- No INSERT/UPDATE/DELETE grants - only triggers should write


-- Create the trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[] := ARRAY[]::TEXT[];
  user_email TEXT;
  user_name TEXT;
  record_name TEXT;
  computed_company_id UUID;
  key TEXT;
BEGIN
  -- Get user info from profiles table
  SELECT email, full_name INTO user_email, user_name
  FROM profiles WHERE id = auth.uid();
  
  -- Get display name for the record (customize per table)
  CASE TG_TABLE_NAME
    WHEN 'assessments' THEN 
      record_name := COALESCE(NEW.name, OLD.name);
    WHEN 'companies' THEN 
      record_name := COALESCE(NEW.name, OLD.name);
    WHEN 'interviews' THEN 
      record_name := COALESCE(NEW.name, OLD.name);
    WHEN 'questionnaires' THEN 
      record_name := COALESCE(NEW.name, OLD.name);
    ELSE 
      record_name := NULL;
  END CASE;

  -- Compute company_id based on table type
  IF TG_TABLE_NAME = 'companies' THEN
    -- Companies table uses 'id' instead of 'company_id'
    computed_company_id := COALESCE(NEW.id, OLD.id)::UUID;
  ELSIF TG_TABLE_NAME IN ('profiles', 'measurement_definitions') THEN
    -- Tables without company_id should use NULL
    computed_company_id := NULL;
  ELSE
    -- All other tables use company_id
    computed_company_id := COALESCE(NEW.company_id, OLD.company_id);
  END IF;

  -- Validate: if not a known table without company_id, it must have one
  IF computed_company_id IS NULL
     AND TG_TABLE_NAME NOT IN ('companies', 'profiles', 'measurement_definitions') THEN
    RAISE EXCEPTION 'Audit trigger error: Table "%" is missing company_id. Add to audit trigger exceptions or fix schema.', TG_TABLE_NAME;
  END IF;

  -- Track which fields changed (for UPDATE only)
  IF TG_OP = 'UPDATE' THEN
    FOR key IN SELECT jsonb_object_keys(to_jsonb(NEW))
    LOOP
      IF to_jsonb(OLD)->key IS DISTINCT FROM to_jsonb(NEW)->key 
         AND key NOT IN ('updated_at', 'last_seen_at') THEN
        changed_fields := array_append(changed_fields, key);
      END IF;
    END LOOP;
    
    -- Skip if no meaningful changes
    IF array_length(changed_fields, 1) IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;
  
  INSERT INTO audit_logs (
    company_id,
    user_id,
    user_email,
    user_name,
    action,
    table_name,
    record_id,
    record_display_name,
    old_values,
    new_values,
    changed_fields,
    metadata
  ) VALUES (
    computed_company_id,
    auth.uid(),
    user_email,
    user_name,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::TEXT,
    record_name,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    changed_fields,
    jsonb_build_object(
      'ip', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to enable auditing on tables
CREATE OR REPLACE FUNCTION enable_audit_for_table(target_table TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('
    DROP TRIGGER IF EXISTS audit_trigger ON %I;
    CREATE TRIGGER audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON %I
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  ', target_table, target_table);
  
  RAISE NOTICE 'Audit enabled for table: %', target_table;
END;
$$ LANGUAGE plpgsql;