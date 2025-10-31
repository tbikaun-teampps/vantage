-- Automatically reset all sequences in public schema to match max IDs
DO $$
DECLARE
    seq_record RECORD;
    max_id BIGINT;
    sql_statement TEXT;
BEGIN
    -- Loop through all sequences in public schema
    FOR seq_record IN
        SELECT
            s.relname AS sequence_name,
            t.relname AS table_name,
            a.attname AS column_name
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class t ON d.refobjid = t.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
        WHERE s.relkind = 'S'
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        BEGIN
            -- Get max ID from the table
            EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM public.%I',
                seq_record.column_name, seq_record.table_name) INTO max_id;
            
            -- Skip if table is empty
            IF max_id = 0 THEN
                RAISE NOTICE 'Skipping empty table %.% (sequence: %)',
                    seq_record.table_name, seq_record.column_name, seq_record.sequence_name;
                CONTINUE;
            END IF;
            
            -- Reset the sequence
            EXECUTE format('SELECT setval(pg_get_serial_sequence(''public.%I'', ''%I''), %s, false)',
                seq_record.table_name, seq_record.column_name, max_id + 1);
                
            RAISE NOTICE 'Reset sequence for %.% to %',
                seq_record.table_name, seq_record.column_name, max_id + 1;
                
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to reset sequence % for table %.%: %', 
                seq_record.sequence_name, seq_record.table_name, seq_record.column_name, SQLERRM;
            -- Continue processing other sequences
        END;
    END LOOP;
END $$;