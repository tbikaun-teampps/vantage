-- 20251103022209_create_audit_logs_table.sql

-- Create the audit logs table
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  company_id UUID, -- Nullable for global tables like companies and profiles
  user_id UUID DEFAULT auth.uid(),
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,

  operation_type TEXT DEFAULT 'user_action', -- 'user_action', 'cascade', 'system', 'soft_delete'
  operation_group_id UUID,   -- Groups related cascade operations
  parent_audit_id BIGINT,     -- Links to parent audit entry for cascades
  is_soft_delete BOOLEAN DEFAULT FALSE,

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
CREATE INDEX idx_audit_logs_operation_group ON audit_logs(operation_group_id) WHERE operation_group_id IS NOT NULL;
CREATE INDEX idx_audit_logs_operation_type ON audit_logs(operation_type, created_at DESC);

-- Enable RLS for multi-tenant security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone with viewer access or higher can see audit logs
CREATE POLICY "Company members can view audit logs" ON audit_logs
  FOR SELECT 
  USING (has_min_company_role(company_id, 'viewer'::company_role));

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

-- Create the enhanced trigger function with soft delete and cascade detection
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[] := ARRAY[]::TEXT[];
  user_email TEXT;
  user_name TEXT;
  computed_company_id UUID;
  key TEXT;
  operation_type TEXT := 'user_action';
  operation_group_id UUID;
  parent_audit_id BIGINT;
  is_soft BOOLEAN := FALSE;
  last_audit_id BIGINT;
  soft_delete_timestamp TIMESTAMPTZ;
BEGIN
  -- Get user info from profiles table
  SELECT email, full_name INTO user_email, user_name
  FROM profiles WHERE id = auth.uid();

  -- Compute company_id based on table type
  IF TG_TABLE_NAME = 'companies' THEN
    computed_company_id := COALESCE(NEW.id, OLD.id)::UUID;
  ELSIF TG_TABLE_NAME IN ('profiles', 'measurement_definitions') THEN
    computed_company_id := NULL;
  ELSE
    computed_company_id := COALESCE(NEW.company_id, OLD.company_id);
  END IF;

  -- Validate company_id requirement
  IF computed_company_id IS NULL
     AND TG_TABLE_NAME NOT IN ('companies', 'profiles', 'measurement_definitions') THEN
    RAISE EXCEPTION 'Audit trigger error: Table "%" is missing company_id', TG_TABLE_NAME;
  END IF;

  -- Detect soft deletes (but keep action as UPDATE)
  -- Wrap in exception handling since not all tables have deleted_at column
  IF TG_OP = 'UPDATE' THEN
    BEGIN
      -- Check if this is a soft delete (deleted_at being set)
      IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        is_soft := TRUE;
        operation_type := 'soft_delete';
        soft_delete_timestamp := NEW.deleted_at;
      -- Check if this is a restore (deleted_at being cleared)
      ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
        operation_type := 'restore';
      END IF;
    EXCEPTION
      WHEN undefined_column THEN
        -- Table doesn't have deleted_at column, skip soft delete detection
        NULL;
    END;
  END IF;

  -- Detect cascade operations
  IF current_setting('audit.cascade_depth', true) IS NOT NULL THEN
    operation_type := 'cascade';
    operation_group_id := current_setting('audit.operation_group_id', true)::UUID;
    parent_audit_id := current_setting('audit.parent_audit_id', true)::BIGINT;
  END IF;

  -- For delete operations that might cascade, set up context
  IF TG_OP = 'DELETE' AND operation_type = 'user_action' THEN
    -- Check if this table has any foreign keys that might cascade
    IF EXISTS (
      SELECT 1 
      FROM information_schema.referential_constraints rc
      JOIN information_schema.constraint_column_usage ccu 
        ON rc.constraint_name = ccu.constraint_name
      WHERE rc.delete_rule = 'CASCADE'
        AND ccu.table_name = TG_TABLE_NAME
    ) THEN
      operation_group_id := gen_random_uuid();
      PERFORM set_config('audit.cascade_depth', '1', true);
      PERFORM set_config('audit.operation_group_id', operation_group_id::TEXT, true);
    END IF;
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
    
    -- Skip if no meaningful changes (but allow soft deletes/restores through)
    IF array_length(changed_fields, 1) IS NULL 
       AND operation_type NOT IN ('soft_delete', 'restore') THEN
      RETURN NEW;
    END IF;
  END IF;
  
  INSERT INTO audit_logs (
    company_id,
    user_id,
    user_email,
    user_name,
    action,  -- Will always be INSERT, UPDATE, or DELETE
    table_name,
    record_id,
    operation_type,  -- This tells us if it's a soft_delete, restore, cascade, etc.
    operation_group_id,
    parent_audit_id,
    is_soft_delete,
    old_values,
    new_values,
    changed_fields,
    metadata
  ) VALUES (
    computed_company_id,
    auth.uid(),
    user_email,
    user_name,
    TG_OP,  -- INSERT, UPDATE, or DELETE only
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::TEXT,
    operation_type,
    operation_group_id,
    parent_audit_id,
    is_soft,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    changed_fields,
    jsonb_build_object(
      'ip', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'soft_delete_at', soft_delete_timestamp
    )
  ) RETURNING id INTO last_audit_id;

  -- If this is a parent operation, store the audit ID for children
  IF operation_group_id IS NOT NULL AND parent_audit_id IS NULL THEN
    PERFORM set_config('audit.parent_audit_id', last_audit_id::TEXT, true);
  END IF;
  
  -- Clear cascade context after operation
  IF TG_OP = 'DELETE' AND operation_type != 'cascade' THEN
    PERFORM set_config('audit.cascade_depth', NULL, true);
    PERFORM set_config('audit.operation_group_id', NULL, true);
    PERFORM set_config('audit.parent_audit_id', NULL, true);
  END IF;
  
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