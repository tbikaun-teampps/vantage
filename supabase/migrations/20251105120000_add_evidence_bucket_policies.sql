-- 20251105120000_add_evidence_bucket_policies.sql

-- Add storage policies for the evidence bucket to allow authenticated users to manage files

-- Allow authenticated users to upload evidence files
create policy "Allow authenticated users to upload evidence"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'evidence'::text));

-- Allow authenticated users to update evidence files
create policy "Allow authenticated users to update evidence"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'evidence'::text));

-- Allow authenticated users to delete evidence files
create policy "Allow authenticated users to delete evidence"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'evidence'::text));
