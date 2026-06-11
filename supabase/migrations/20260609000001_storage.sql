INSERT INTO storage.buckets (id, name, public) VALUES ('dokumen-pelayanan', 'dokumen-pelayanan', true);

CREATE POLICY "authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "public_download" ON storage.objects
  FOR SELECT USING (bucket_id = 'dokumen-pelayanan');

CREATE POLICY "admin_delete_file" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = get_user_subbidang()
  );
