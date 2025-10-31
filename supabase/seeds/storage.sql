-- Create evidence bucket
INSERT INTO storage.buckets
(id, name, public)
VALUES
('evidence', 'evidence', false)

-- Create assets bucket (stores company icons, etc.)
-- INSERT INTO storage.buckets
-- (id, name, public)
-- VALUES
-- ('assets', 'assets', true)