-- Helper Functions (Just in case they haven't been created)
CREATE OR REPLACE FUNCTION get_user_subbidang()
RETURNS TEXT AS $$
  SELECT subbidang FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Tabel Banners
CREATE TABLE IF NOT EXISTS banners (
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

-- Tabel Informasi
CREATE TABLE IF NOT EXISTS informasi (
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

-- Tabel Kontak
CREATE TABLE IF NOT EXISTS kontak (
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

-- RLS Policies
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE informasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontak ENABLE ROW LEVEL SECURITY;

-- Public Access (Read Only)
-- Banners with is_active = true
DROP POLICY IF EXISTS "public_read_banners" ON banners;
CREATE POLICY "public_read_banners" ON banners FOR SELECT USING (is_active = TRUE);

-- Informasi with is_published = true
DROP POLICY IF EXISTS "public_read_informasi" ON informasi;
CREATE POLICY "public_read_informasi" ON informasi FOR SELECT USING (is_published = TRUE);

-- Kontak with is_active = true
DROP POLICY IF EXISTS "public_read_kontak" ON kontak;
CREATE POLICY "public_read_kontak" ON kontak FOR SELECT USING (is_active = TRUE);


-- Admin Access (CRUD)
-- Banners
DROP POLICY IF EXISTS "admin_manage_banners" ON banners;
CREATE POLICY "admin_manage_banners" ON banners
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND subbidang = get_user_subbidang())
  );

-- Informasi
DROP POLICY IF EXISTS "admin_manage_informasi" ON informasi;
CREATE POLICY "admin_manage_informasi" ON informasi
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND subbidang = get_user_subbidang())
  );

-- Kontak 
DROP POLICY IF EXISTS "admin_manage_kontak" ON kontak;
CREATE POLICY "admin_manage_kontak" ON kontak
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND subbidang = get_user_subbidang())
  );
