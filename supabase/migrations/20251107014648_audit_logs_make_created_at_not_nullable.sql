-- Migration to make created_at column in audit_logs table not nullable

ALTER TABLE audit_logs
ALTER COLUMN created_at SET NOT NULL;