CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('superadmin', 'admin')),
  subbidang   TEXT CHECK (subbidang IN ('diklat', 'pengembangan_pegawai', 'disiplin')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: Admin harus punya subbidang, Superadmin tidak
ALTER TABLE profiles ADD CONSTRAINT check_admin_subbidang
  CHECK (
    (role = 'admin' AND subbidang IS NOT NULL) OR
    (role = 'superadmin' AND subbidang IS NULL)
  );

CREATE TABLE banners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  link_url     TEXT,
  subbidang    TEXT CHECK (subbidang IN ('diklat', 'pengembangan_pegawai', 'disiplin', 'umum')),
  is_active    BOOLEAN DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE informasi (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul        TEXT NOT NULL,
  isi          TEXT NOT NULL,
  subbidang    TEXT NOT NULL CHECK (subbidang IN ('diklat', 'pengembangan_pegawai', 'disiplin')),
  kategori     TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE persyaratan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_layanan    TEXT NOT NULL,
  deskripsi       TEXT,
  subbidang       TEXT NOT NULL CHECK (subbidang IN ('diklat', 'pengembangan_pegawai', 'disiplin')),
  status          TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif', 'diperbarui')),
  search_vector   TSVECTOR GENERATED ALWAYS AS (to_tsvector('indonesian', nama_layanan || ' ' || COALESCE(deskripsi, ''))) STORED,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX persyaratan_search_idx ON persyaratan USING GIN (search_vector);
CREATE INDEX persyaratan_subbidang_idx ON persyaratan (subbidang);
CREATE INDEX persyaratan_status_idx ON persyaratan (status);

CREATE TABLE dokumen_persyaratan (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persyaratan_id   UUID NOT NULL REFERENCES persyaratan(id) ON DELETE CASCADE,
  nama_dokumen     TEXT NOT NULL,
  deskripsi        TEXT,
  file_url         TEXT NOT NULL,
  file_name        TEXT NOT NULL,
  file_size        BIGINT,
  file_type        TEXT CHECK (file_type IN ('pdf', 'docx', 'xlsx', 'doc', 'xls')),
  download_count   INTEGER DEFAULT 0,
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kontak (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subbidang    TEXT NOT NULL CHECK (subbidang IN ('diklat', 'pengembangan_pegawai', 'disiplin')),
  nama_petugas TEXT NOT NULL,
  jabatan      TEXT,
  no_telepon   TEXT,
  email        TEXT,
  lokasi       TEXT,
  jam_kerja    TEXT,
  sort_order   INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES profiles(id),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id),
  user_name    TEXT,
  action       TEXT NOT NULL,           -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  table_name   TEXT,                    -- nama tabel yang diubah
  record_id    UUID,                    -- id record yang diubah
  old_data     JSONB,                   -- data sebelum diubah
  new_data     JSONB,                   -- data sesudah diubah
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX audit_logs_user_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_created_idx ON audit_logs (created_at DESC);

CREATE TABLE page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE informasi         ENABLE ROW LEVEL SECURITY;
ALTER TABLE persyaratan       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_persyaratan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontak            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_informasi" ON informasi
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "public_read_persyaratan" ON persyaratan
  FOR SELECT USING (TRUE);

CREATE POLICY "public_read_dokumen" ON dokumen_persyaratan
  FOR SELECT USING (TRUE);

CREATE POLICY "public_read_kontak" ON kontak
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "public_read_banners" ON banners
  FOR SELECT USING (is_active = TRUE);

CREATE OR REPLACE FUNCTION get_user_subbidang()
RETURNS TEXT AS $$
  SELECT subbidang FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE POLICY "admin_manage_persyaratan" ON persyaratan
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND subbidang = get_user_subbidang())
  );

CREATE POLICY "admin_manage_informasi" ON informasi
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND subbidang = get_user_subbidang())
  );

CREATE POLICY "admin_manage_dokumen" ON dokumen_persyaratan
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND
      EXISTS (
        SELECT 1 FROM persyaratan p
        WHERE p.id = persyaratan_id
        AND p.subbidang = get_user_subbidang()
      )
    )
  );

CREATE POLICY "superadmin_read_audit_logs" ON audit_logs
  FOR SELECT USING (get_user_role() = 'superadmin');

CREATE POLICY "superadmin_manage_profiles" ON profiles
  FOR ALL USING (get_user_role() = 'superadmin');
