-- 20251103022210_enable_audit_on_tables.sql

-- Create a function to enable audit on all tables except excluded ones
DO $$
DECLARE
  tbl RECORD;
  excluded_tables TEXT[] := ARRAY[
    -- System/Meta tables
    'audit_logs'
  ];
  should_exclude BOOLEAN;
  pattern TEXT;
BEGIN
  -- Loop through all tables in public schema
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    should_exclude := FALSE;
    
    -- Check if table should be excluded
    FOREACH pattern IN ARRAY excluded_tables
    LOOP
      -- Check for exact match or pattern match
      IF tbl.tablename = pattern OR tbl.tablename LIKE pattern THEN
        should_exclude := TRUE;
        RAISE NOTICE 'Skipping audit for table: % (excluded)', tbl.tablename;
        EXIT;
      END IF;
    END LOOP;
    
    -- Enable audit if not excluded
    IF NOT should_exclude THEN
      PERFORM enable_audit_for_table(tbl.tablename);
      RAISE NOTICE 'Audit enabled for table: %', tbl.tablename;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Audit setup complete!';
END $$;