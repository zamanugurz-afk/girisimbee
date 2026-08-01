-- Allow authenticated users to SELECT from marketplace-documents bucket
-- (required for createSignedUrl and cross-user document access flows)

DROP POLICY IF EXISTS documents_select_policy ON storage.objects;
CREATE POLICY documents_select_policy
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'marketplace-documents');
