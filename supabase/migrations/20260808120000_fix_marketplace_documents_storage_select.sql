-- Tighten marketplace-documents SELECT.
-- A later migration added a bucket-wide SELECT for all authenticated users,
-- which overrode the owner-scoped policy for practical access checks.
-- Keep owner-only SELECT (folder[1] = auth.uid()) from ecosystem_rls_policies.

DROP POLICY IF EXISTS documents_select_policy ON storage.objects;

-- Ensure owner-scoped SELECT remains present (idempotent recreate).
DROP POLICY IF EXISTS marketplace_documents_storage_owner_read ON storage.objects;
CREATE POLICY marketplace_documents_storage_owner_read
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'marketplace-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
