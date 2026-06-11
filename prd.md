# 📄 Product Requirements Document (PRD)
## Sistem Informasi Syarat & Ketentuan Pelayanan
### BKPSDM Kabupaten Mempawah — Bidang Diklat, Pengembangan Pegawai & Disiplin

---

> **Versi:** 1.0.0  
> **Tanggal:** Juni 2026  
> **Status:** Draft — Siap untuk Development  
> **Bahasa Sistem:** Bahasa Indonesia

---

## 📋 Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Tujuan & Latar Belakang](#2-tujuan--latar-belakang)
3. [Stakeholder & Pengguna](#3-stakeholder--pengguna)
4. [Arsitektur Sistem](#4-arsitektur-sistem)
5. [Stack Teknologi](#5-stack-teknologi)
6. [Skema Database (Supabase/PostgreSQL)](#6-skema-database-supabasepostgresql)
7. [Sistem Autentikasi & Otorisasi](#7-sistem-autentikasi--otorisasi)
8. [Fitur & Halaman Detail](#8-fitur--halaman-detail)
9. [Desain UI/UX](#9-desain-uiux)
10. [Keamanan](#10-keamanan)
11. [Performa & Skalabilitas](#11-performa--skalabilitas)
12. [Panduan Setup Supabase & Deployment](#12-panduan-setup-supabase--deployment)
13. [Struktur Folder Proyek](#13-struktur-folder-proyek)
14. [Alur Kerja (User Flow)](#14-alur-kerja-user-flow)
15. [Acceptance Criteria](#15-acceptance-criteria)
16. [Timeline Pengembangan](#16-timeline-pengembangan)

---

## 1. Ringkasan Eksekutif

**SIMFO BKPSDM** (Sistem Informasi BKPSDM) adalah aplikasi web berbasis React.js yang menyediakan informasi syarat dan ketentuan pelayanan di Bidang Diklat, Pengembangan Pegawai, dan Disiplin BKPSDM Kabupaten Mempawah secara transparan, mudah diakses, dan dapat dikelola oleh admin masing-masing subbidang.

Sistem ini dirancang untuk:
- Mempermudah masyarakat/ASN menemukan persyaratan pelayanan secara digital
- Memberikan kewenangan pengelolaan konten kepada admin tiap subbidang
- Memastikan informasi selalu up-to-date dengan status yang jelas (Aktif/Nonaktif/Diperbarui)
- Mendukung skalabilitas jangka panjang menggunakan Supabase sebagai backend

---

## 2. Tujuan & Latar Belakang

### Latar Belakang
BKPSDM Kabupaten Mempawah memiliki 3 (tiga) subbidang pelayanan: Diklat, Pengembangan Pegawai, dan Disiplin. Selama ini informasi persyaratan pelayanan masih tersebar dan sulit diakses secara digital oleh ASN maupun masyarakat yang membutuhkan.

### Tujuan Utama
| No | Tujuan | Indikator Keberhasilan |
|----|--------|------------------------|
| 1 | Digitalisasi informasi pelayanan | Semua persyaratan 3 subbidang tersedia online |
| 2 | Kemudahan akses publik | User dapat mengakses tanpa login |
| 3 | Pengelolaan mandiri per subbidang | Admin subbidang bisa CRUD data bidangnya |
| 4 | Transparansi & akuntabilitas | Log aktivitas admin tersedia untuk Superadmin |
| 5 | Keamanan data | Data tidak bisa dimanipulasi user biasa |

---

## 3. Stakeholder & Pengguna

### 3.1 Role Pengguna

| Role | Deskripsi | Login | Jumlah Akun |
|------|-----------|-------|-------------|
| **Superadmin** | Mengelola seluruh sistem, semua subbidang, akun admin, dan melihat log | ✅ Wajib | 1 |
| **Admin Subbidang** | Mengelola konten (informasi, persyaratan, file) hanya di subbidangnya | ✅ Wajib | 3 (1 per subbidang) |
| **User/Publik** | Hanya melihat informasi dan mengunduh file | ❌ Tidak perlu | Unlimited |

### 3.2 Admin Subbidang

| ID | Subbidang | Kewenangan |
|----|-----------|------------|
| A1 | Diklat | CRUD data, informasi, dan file Subbidang Diklat |
| A2 | Pengembangan Pegawai | CRUD data, informasi, dan file Subbidang Pengembangan Pegawai |
| A3 | Disiplin | CRUD data, informasi, dan file Subbidang Disiplin |

---

## 4. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│              React.js + Framer Motion + Tailwind         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Landing │ │   Info   │ │  Kontak  │ │   Admin   │  │
│  │   Page   │ │   Page   │ │   Page   │ │  Panel    │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST / Realtime
┌────────────────────────▼────────────────────────────────┐
│                   SUPABASE BACKEND                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Auth       │  │  Database    │  │  Storage       │  │
│  │  (JWT/RLS)  │  │  PostgreSQL  │  │  (File Upload) │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Row Level Security (RLS) Policies                  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Prinsip Arsitektur
- **Client-Side Rendering** menggunakan React.js (Vite)
- **BFF Pattern**: Semua interaksi database melalui Supabase client SDK dengan RLS
- **Stateless Auth**: JWT token disimpan secara aman, tidak ada session server-side
- **File Storage**: Semua file (PDF/Word/Excel) disimpan di Supabase Storage
- **Separation of Concern**: Setiap subbidang terisolasi melalui RLS di database

---

## 5. Stack Teknologi

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| React.js | ^18.x | Core UI Framework |
| Vite | ^5.x | Build Tool & Dev Server |
| Framer Motion | ^11.x | Animasi (klik, hover, scroll, transisi) |
| Tailwind CSS | ^3.x | Styling & Responsivitas |
| React Router v6 | ^6.x | Client-Side Routing |
| Zustand | ^4.x | State Management |
| React Query (TanStack) | ^5.x | Server State & Caching |
| Supabase JS SDK | ^2.x | Database & Auth Client |
| React Hot Toast | ^2.x | Notifikasi UI |
| Lucide React | latest | Ikon |
| Swiper.js | ^11.x | Carousel/Slider Banner |

### Backend / Database
| Teknologi | Kegunaan |
|-----------|----------|
| Supabase | Backend as a Service (BaaS) |
| PostgreSQL | Database Relasional |
| Supabase Auth | Autentikasi (JWT) |
| Supabase Storage | Penyimpanan File |
| Supabase RLS | Row-Level Security per role |
| Supabase Realtime | Pencarian real-time (opsional) |

### Deployment
| Komponen | Platform |
|----------|----------|
| Frontend | Vercel / Netlify |
| Database & Backend | Supabase Cloud |
| Domain | Custom domain (opsional) |

---

## 6. Skema Database (Supabase/PostgreSQL)

### 6.1 Tabel: `profiles`
Extend tabel `auth.users` bawaan Supabase.

```sql
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
```

### 6.2 Tabel: `banners`
Untuk carousel pengumuman di Landing Page.

```sql
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
```

### 6.3 Tabel: `informasi`
Untuk konten kartu informasi di Halaman Informasi.

```sql
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
```

### 6.4 Tabel: `persyaratan`
Inti sistem — data syarat pelayanan.

```sql
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

-- Index untuk pencarian cepat
CREATE INDEX persyaratan_search_idx ON persyaratan USING GIN (search_vector);
CREATE INDEX persyaratan_subbidang_idx ON persyaratan (subbidang);
CREATE INDEX persyaratan_status_idx ON persyaratan (status);
```

### 6.5 Tabel: `dokumen_persyaratan`
File yang bisa diunduh user (relasi ke persyaratan).

```sql
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
```

### 6.6 Tabel: `kontak`
Data kontak per subbidang.

```sql
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
```

### 6.7 Tabel: `audit_logs`
Log semua aktivitas admin.

```sql
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

-- Index untuk query log
CREATE INDEX audit_logs_user_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_created_idx ON audit_logs (created_at DESC);
```

### 6.8 Tabel: `page_views`
Untuk statistik pengunjung di dashboard admin.

```sql
CREATE TABLE page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Sistem Autentikasi & Otorisasi

### 7.1 Alur Autentikasi

```
User membuka /admin
    ↓
Cek JWT token di localStorage
    ↓ Tidak ada / Expired
Redirect ke /login
    ↓ Input email + password
Supabase Auth → Validasi kredensial
    ↓ Berhasil
Ambil data profile (role, subbidang)
    ↓
Simpan di Zustand store
    ↓
Redirect ke /admin/dashboard
```

### 7.2 Row Level Security (RLS) Policies

```sql
-- ============================================================
-- AKTIFKAN RLS PADA SEMUA TABEL
-- ============================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE informasi         ENABLE ROW LEVEL SECURITY;
ALTER TABLE persyaratan       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_persyaratan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontak            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: PUBLIK (tanpa login)
-- ============================================================

-- User publik bisa baca informasi yang published
CREATE POLICY "public_read_informasi" ON informasi
  FOR SELECT USING (is_published = TRUE);

-- User publik bisa baca persyaratan
CREATE POLICY "public_read_persyaratan" ON persyaratan
  FOR SELECT USING (TRUE);

-- User publik bisa baca dokumen & menghitung download
CREATE POLICY "public_read_dokumen" ON dokumen_persyaratan
  FOR SELECT USING (TRUE);

-- User publik bisa baca kontak aktif
CREATE POLICY "public_read_kontak" ON kontak
  FOR SELECT USING (is_active = TRUE);

-- User publik bisa baca banner aktif
CREATE POLICY "public_read_banners" ON banners
  FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- POLICIES: ADMIN SUBBIDANG
-- ============================================================

-- Helper function untuk mendapatkan subbidang user login
CREATE OR REPLACE FUNCTION get_user_subbidang()
RETURNS TEXT AS $$
  SELECT subbidang FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Admin bisa CRUD persyaratan di subbidangnya saja
CREATE POLICY "admin_manage_persyaratan" ON persyaratan
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND subbidang = get_user_subbidang())
  );

-- Admin bisa CRUD informasi di subbidangnya saja
CREATE POLICY "admin_manage_informasi" ON informasi
  FOR ALL USING (
    get_user_role() = 'superadmin' OR
    (get_user_role() = 'admin' AND subbidang = get_user_subbidang())
  );

-- Admin bisa CRUD dokumen di subbidangnya
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

-- ============================================================
-- POLICIES: SUPERADMIN ONLY
-- ============================================================

-- Superadmin bisa baca semua log
CREATE POLICY "superadmin_read_audit_logs" ON audit_logs
  FOR SELECT USING (get_user_role() = 'superadmin');

-- Superadmin bisa kelola semua profil admin
CREATE POLICY "superadmin_manage_profiles" ON profiles
  FOR ALL USING (get_user_role() = 'superadmin');
```

### 7.3 Protected Routes di Frontend

```
/                     → Publik (Landing Page)
/informasi            → Publik
/kontak               → Publik
/login                → Publik (redirect jika sudah login)
/admin                → Protected (semua role login)
/admin/dashboard      → Protected (semua role login)
/admin/persyaratan    → Protected (admin subbidang + superadmin)
/admin/informasi      → Protected (admin subbidang + superadmin)
/admin/banners        → Protected (admin subbidang + superadmin)
/admin/kontak         → Protected (superadmin only)
/admin/users          → Protected (superadmin only)
/admin/audit-log      → Protected (superadmin only)
/admin/statistik      → Protected (superadmin only)
```

---

## 8. Fitur & Halaman Detail

### 8.1 Splash Screen (Loading Screen)
- **Tampilan**: Fullscreen dengan background gradasi biru-hijau
- **Animasi**: Fade-in logo BKPSDM → animasi loading bar ala iPhone (garis tipis bergerak dari kiri ke kanan) → teks "Selamat Datang di Sistem Informasi BKPSDM Kab Mempawah" muncul dengan animasi karakter per karakter (typewriter effect)
- **Durasi**: 3–4 detik, kemudian otomatis transisi ke Landing Page dengan animasi fade-out
- **Implementasi**: Framer Motion `AnimatePresence` untuk exit animation

### 8.2 Halaman Awal (Landing Page) — `/`

#### 8.2.1 Komponen Search Bar (Sticky Top)
- Posisi di tengah-atas, sticky saat scroll
- Input teks dengan placeholder: *"Cari layanan atau persyaratan..."*
- **Real-time search**: Debounce 300ms, query ke tabel `persyaratan` menggunakan PostgreSQL Full-Text Search
- Hasil muncul sebagai dropdown card di bawah input
- Setiap hasil menampilkan: nama layanan, subbidang (badge berwarna), status (badge), deskripsi singkat
- Klik hasil → navigasi ke halaman Informasi atau anchor ke layanan tersebut

#### 8.2.2 Carousel Banner / Pengumuman
- **Library**: Swiper.js dengan Framer Motion overlay
- Geser kiri-kanan (drag & tombol navigasi panah)
- Autoplay 5 detik, dengan pause saat hover
- Setiap slide menampilkan: gambar/background, judul pengumuman, deskripsi singkat, badge subbidang
- Pagination dots di bawah slide
- Responsif: full-width di mobile, contained di desktop
- Data dari tabel `banners` (filter `is_active = true`)

#### 8.2.3 Shortcut Subbidang
- 3 card besar dengan ikon dan warna berbeda per subbidang (Diklat = Biru, Pengembangan Pegawai = Hijau, Disiplin = Oranye)
- Animasi hover: scale-up + shadow + color shift (Framer Motion)
- Klik → scroll atau filter ke subbidang tersebut di Halaman Informasi

#### 8.2.4 Persyaratan Terbaru
- Grid card menampilkan 6 persyaratan terbaru
- Setiap card: ikon subbidang, nama layanan, status badge, jumlah dokumen tersedia
- Animasi scroll: staggered fade-in dari bawah (Framer Motion `viewport`)

### 8.3 Halaman Informasi — `/informasi`

#### 8.3.1 Filter & Navigasi
- Tabs filter berdasarkan subbidang: **Semua | Diklat | Pengembangan Pegawai | Disiplin**
- Filter tambahan: Status (Aktif/Diperbarui/Nonaktif)
- Animasi tab: sliding indicator (Framer Motion `layoutId`)

#### 8.3.2 Card Informasi
Setiap card informasi menampilkan:
- **Header**: Ikon subbidang + badge subbidang + badge status (warna berbeda: Aktif=hijau, Diperbarui=kuning, Nonaktif=abu)
- **Body**: Judul layanan, deskripsi, gambar thumbnail (opsional)
- **Footer**: Daftar dokumen yang bisa diunduh (tombol download per file)
- **Format file yang didukung**: PDF, Word (.doc/.docx), Excel (.xls/.xlsx)
- Animasi hover card: lift + shadow (Framer Motion)
- Klik card → expand detail (accordion / modal)

#### 8.3.3 Detail Persyaratan (Modal/Drawer)
Saat card diklik, muncul panel detail:
- Nama layanan lengkap
- Deskripsi/ketentuan detail
- Daftar dokumen yang dibutuhkan dengan tombol download
- Subbidang yang menangani
- Tanggal terakhir diperbarui

### 8.4 Halaman Kontak — `/kontak`

Grid card kontak per subbidang. Setiap card menampilkan:
- **Header**: Ikon + Nama Subbidang
- **Isi**: Nama petugas, jabatan, nomor telepon (klik-to-call), email (klik-to-email), lokasi ruangan, jam kerja
- 3 card (satu per subbidang), layout 3 kolom di desktop / 1 kolom di mobile
- Animasi staggered entrance saat halaman dimuat (Framer Motion)

### 8.5 Halaman Login Admin — `/login`

- Form login: Email + Password
- Tombol "Masuk" dengan loading state
- Validasi sisi klien sebelum submit
- Pesan error dari Supabase Auth
- Redirect otomatis ke `/admin/dashboard` setelah berhasil
- Tidak ada fitur registrasi (akun dibuat oleh Superadmin)
- Animasi: fade-in card login saat halaman dimuat

### 8.6 Panel Admin — `/admin/*`

#### 8.6.1 Layout Admin
- **Sidebar** (fixed di desktop, drawer di mobile): Logo, menu navigasi, nama user + role, tombol logout
- **Top Navigation**: Judul halaman aktif, breadcrumb, tombol logout
- Animasi sidebar: slide-in dari kiri (Framer Motion)

#### 8.6.2 Dashboard Admin — `/admin/dashboard`
Menampilkan statistik:
- Total pengunjung hari ini / bulan ini
- Jumlah persyaratan per subbidang
- Dokumen paling banyak diunduh (Top 5)
- Grafik kunjungan 7 hari terakhir (chart sederhana)
- Aktivitas terbaru (log 5 terakhir untuk admin subbidang; semua log untuk superadmin)

#### 8.6.3 Manajemen Persyaratan — `/admin/persyaratan`
| Fitur | Admin Subbidang | Superadmin |
|-------|----------------|------------|
| Lihat semua persyaratan subbidangnya | ✅ | ✅ (semua subbidang) |
| Tambah persyaratan baru | ✅ | ✅ |
| Edit persyaratan | ✅ (miliknya) | ✅ |
| Hapus persyaratan | ✅ (miliknya) | ✅ |
| Ubah status (Aktif/Nonaktif/Diperbarui) | ✅ | ✅ |
| Upload/hapus dokumen | ✅ | ✅ |

**Form Tambah/Edit Persyaratan**:
- Nama layanan (wajib)
- Deskripsi / ketentuan (rich text atau textarea)
- Subbidang (auto-filled untuk admin, pilihan untuk superadmin)
- Status: Aktif / Nonaktif / Diperbarui
- Upload dokumen: Drag & Drop atau klik pilih file (PDF, DOC, DOCX, XLS, XLSX), batas ukuran 10MB per file

#### 8.6.4 Manajemen Informasi — `/admin/informasi`
- CRUD konten kartu informasi
- Toggle publish/unpublish
- Upload thumbnail (opsional)
- Hanya bisa kelola informasi subbidangnya (admin) atau semua (superadmin)

#### 8.6.5 Manajemen Banner — `/admin/banners`
- CRUD banner carousel
- Upload gambar banner
- Atur urutan tampil (drag-and-drop sort_order)
- Toggle aktif/nonaktif
- Admin hanya bisa kelola banner subbidangnya

#### 8.6.6 Manajemen Kontak — `/admin/kontak` *(Superadmin only)*
- CRUD data kontak per subbidang
- Atur urutan tampil
- Toggle aktif/nonaktif

#### 8.6.7 Manajemen User/Admin — `/admin/users` *(Superadmin only)*
- Lihat semua akun admin
- Buat akun admin baru (pilih subbidang)
- Aktifkan / nonaktifkan akun admin
- Reset password admin
- **Catatan**: Hapus akun admin dilakukan di Supabase Dashboard (tidak diekspos di UI untuk keamanan)

#### 8.6.8 Audit Log — `/admin/audit-log` *(Superadmin only)*
- Tabel log seluruh aktivitas: siapa, apa, kapan, dari IP mana
- Filter berdasarkan: user, tipe aksi (CREATE/UPDATE/DELETE/LOGIN), tanggal
- Pagination (20 baris per halaman)
- Export log ke CSV

#### 8.6.9 Statistik — `/admin/statistik` *(Superadmin only)*
- Total kunjungan per halaman
- Grafik kunjungan per hari/minggu/bulan
- Top 10 dokumen paling banyak diunduh
- Distribusi kunjungan per subbidang
- Dapat difilter berdasarkan rentang tanggal

---

## 9. Desain UI/UX

### 9.1 Palet Warna

| Nama | Hex | Penggunaan |
|------|-----|------------|
| Primary Blue | `#1E40AF` | Header, CTA utama, Subbidang Diklat |
| Secondary Green | `#16A34A` | Aksen, badge aktif, Subbidang Pengembangan Pegawai |
| Accent Orange | `#EA580C` | Highlight, badge diperbarui, Subbidang Disiplin |
| Background | `#F8FAFC` | Background halaman |
| Card White | `#FFFFFF` | Background card |
| Text Primary | `#1E293B` | Teks utama |
| Text Secondary | `#64748B` | Teks sub |
| Border | `#E2E8F0` | Border card, divider |
| Error | `#DC2626` | Pesan error |
| Warning | `#D97706` | Badge nonaktif |

### 9.2 Tipografi

| Jenis | Font | Ukuran |
|-------|------|--------|
| Heading | Inter / Plus Jakarta Sans | 24–48px |
| Body | Inter | 14–16px |
| Caption | Inter | 12px |
| Code/Mono | JetBrains Mono | 13px |

**Import Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### 9.3 Panduan Animasi Framer Motion

| Trigger | Animasi | Konfigurasi |
|---------|---------|-------------|
| Page transition | Fade + Slide Up | `initial: {opacity:0, y:20}` → `animate: {opacity:1, y:0}` |
| Card hover | Scale + Shadow | `whileHover: {scale:1.03, y:-4}` |
| Button klik | Scale Down | `whileTap: {scale:0.96}` |
| Scroll masuk viewport | Staggered Fade Up | `viewport: {once: true, amount: 0.2}` |
| Modal/Dialog | Scale + Fade | `initial: {opacity:0, scale:0.9}` |
| Sidebar (mobile) | Slide dari kiri | `initial: {x:-300}` → `animate: {x:0}` |
| Splash screen exit | Fade Out | `exit: {opacity:0}` dengan `AnimatePresence` |

### 9.4 Responsivitas

| Breakpoint | Lebar | Layout |
|------------|-------|--------|
| Mobile | < 640px | 1 kolom, hamburger menu |
| Tablet | 640–1024px | 2 kolom, sidebar collapsible |
| Desktop | > 1024px | 3–4 kolom, sidebar fixed |

### 9.5 Ikon Per Subbidang
- **Diklat**: 🎓 (GraduationCap dari Lucide)
- **Pengembangan Pegawai**: 👥 (Users dari Lucide)
- **Disiplin**: ⚖️ (Scale dari Lucide)

---

## 10. Keamanan

### 10.1 Checklist Keamanan

| Area | Implementasi |
|------|-------------|
| Autentikasi | Supabase Auth (JWT + Refresh Token) |
| Otorisasi | Row Level Security (RLS) di level database |
| Token Storage | `localStorage` + HttpOnly cookie (Supabase default) |
| Input Sanitasi | Sanitasi di frontend (DOMPurify) + validasi di Supabase RLS |
| File Upload | Validasi tipe MIME di frontend & Storage Policies Supabase |
| XSS | React JSX auto-escaping + hindari `dangerouslySetInnerHTML` |
| CSRF | Tidak relevan (SPA + JWT, bukan session cookie) |
| Rate Limiting | Supabase built-in rate limiting pada Auth |
| Environment Variable | Semua kunci di `.env`, tidak di-commit ke git |
| HTTPS | Wajib di semua environment (Vercel/Netlify enforce HTTPS) |

### 10.2 Aturan Storage Supabase

```sql
-- Hanya authenticated user yang bisa upload
CREATE POLICY "authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Semua orang bisa download (file publik)
CREATE POLICY "public_download" ON storage.objects
  FOR SELECT USING (bucket_id = 'dokumen-pelayanan');

-- Hanya admin yang bisa hapus file di subbidangnya
CREATE POLICY "admin_delete_file" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = get_user_subbidang()
  );
```

### 10.3 Struktur Folder di Supabase Storage

```
bucket: dokumen-pelayanan/
├── diklat/
│   ├── {persyaratan_id}/
│   │   ├── formulir-pendaftaran.pdf
│   │   └── template-surat.docx
├── pengembangan_pegawai/
│   └── {persyaratan_id}/
│       └── ...
└── disiplin/
    └── {persyaratan_id}/
        └── ...
```

---

## 11. Performa & Skalabilitas

### 11.1 Optimasi Frontend
- **Code Splitting**: Lazy load setiap halaman dengan `React.lazy()` dan `Suspense`
- **Image Optimization**: Gunakan `loading="lazy"` dan format WebP untuk gambar
- **Caching**: React Query cache response API selama 5 menit
- **Debounce Search**: 300ms debounce pada input pencarian

### 11.2 Optimasi Database
- Index pada kolom yang sering di-query (`subbidang`, `status`, `created_at`)
- Full-Text Search dengan `tsvector` untuk pencarian persyaratan
- Pagination (limit-offset) pada semua list data di admin
- `SELECT` hanya kolom yang dibutuhkan (hindari `SELECT *`)

### 11.3 Skalabilitas
- **Supabase Free Tier** cukup untuk awal (500MB database, 1GB storage, 50MB bandwidth/hari)
- **Upgrade mudah** ke Supabase Pro jika traffic meningkat
- Komponen React didesain modular dan reusable
- State management Zustand ringan dan mudah di-extend
- Kode menggunakan TypeScript (opsional, sangat direkomendasikan)

---

## 12. Panduan Setup Supabase & Deployment

### 12.1 Setup Supabase Project

**Langkah 1: Buat Project**
1. Buka [https://supabase.com](https://supabase.com) → klik "Start your project"
2. Login dengan GitHub/Google
3. Klik "New Project"
4. Isi: Nama project (`bkpsdm-mempawah`), Database Password (simpan baik-baik!), Region (pilih Singapore - `ap-southeast-1`)
5. Klik "Create new project" → tunggu ~2 menit

**Langkah 2: Jalankan SQL Schema**
1. Di dashboard Supabase → klik "SQL Editor" di sidebar
2. Klik "New Query"
3. Paste & jalankan semua SQL dari Bagian 6 (Skema Database) secara berurutan
4. Jalankan juga SQL RLS Policies dari Bagian 7.2

**Langkah 3: Setup Storage Bucket**
1. Klik "Storage" di sidebar
2. Klik "New Bucket"
3. Nama bucket: `dokumen-pelayanan`
4. Centang "Public bucket" → Klik "Create bucket"
5. Di tab "Policies" pada bucket tersebut → tambahkan policies dari Bagian 10.2

**Langkah 4: Buat Akun Superadmin**
1. Klik "Authentication" → "Users" → "Invite user"
2. Masukkan email superadmin
3. Setelah user menerima invite dan set password, jalankan SQL:
```sql
INSERT INTO profiles (id, full_name, role, subbidang)
VALUES (
  '<UUID dari auth.users>',
  'Nama Superadmin',
  'superadmin',
  NULL
);
```

**Langkah 5: Dapatkan API Keys**
1. Klik "Settings" → "API"
2. Catat:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJ...` (untuk frontend)
   - **service_role key**: `eyJ...` (JANGAN expose ke frontend!)

### 12.2 Setup Proyek React

```bash
# 1. Buat proyek Vite + React
npm create vite@latest bkpsdm-mempawah -- --template react
cd bkpsdm-mempawah

# 2. Install dependencies
npm install @supabase/supabase-js @tanstack/react-query zustand
npm install framer-motion react-router-dom
npm install swiper lucide-react react-hot-toast
npm install -D tailwindcss postcss autoprefixer

# 3. Setup Tailwind CSS
npx tailwindcss init -p
```

### 12.3 Environment Variables

Buat file `.env` di root proyek:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
VITE_APP_NAME=SIMFO BKPSDM Mempawah
VITE_APP_VERSION=1.0.0
```

**WAJIB**: Tambahkan `.env` ke `.gitignore`

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### 12.4 Deployment ke Vercel

**Langkah 1: Push ke GitHub**
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/bkpsdm-mempawah.git
git push -u origin main
```

**Langkah 2: Deploy di Vercel**
1. Buka [https://vercel.com](https://vercel.com) → Login dengan GitHub
2. Klik "Add New Project" → pilih repo `bkpsdm-mempawah`
3. Framework preset: **Vite**
4. Di bagian "Environment Variables", tambahkan:
   - `VITE_SUPABASE_URL` → URL Supabase kamu
   - `VITE_SUPABASE_ANON_KEY` → Anon key Supabase kamu
5. Klik "Deploy"
6. Selesai! Vercel akan memberikan URL seperti `bkpsdm-mempawah.vercel.app`

**Langkah 3: Setup Domain Custom (Opsional)**
1. Di Vercel → Settings → Domains
2. Tambahkan domain (misal: `pelayanan.bkpsdm-mempawah.go.id`)
3. Arahkan DNS domain ke nameserver Vercel

### 12.5 Supabase Auth Settings

Di Supabase Dashboard → Authentication → Settings:
- **Site URL**: `https://bkpsdm-mempawah.vercel.app` (atau domain custom)
- **Redirect URLs**: Tambahkan URL yang sama + `/admin/dashboard`
- **Email confirmation**: Aktifkan jika diperlukan
- **Disable signup**: ✅ Aktifkan (agar tidak ada yang bisa daftar sendiri)

---

## 13. Struktur Folder Proyek

```
bkpsdm-mempawah/
├── public/
│   ├── favicon.ico
│   └── logo-bkpsdm.png
├── src/
│   ├── assets/           # Gambar, ikon statis
│   ├── components/       # Komponen reusable
│   │   ├── ui/           # Button, Card, Badge, Modal, dll
│   │   ├── layout/       # Navbar, Sidebar, Footer
│   │   └── shared/       # SearchBar, FileUpload, AuditTable
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSearch.js
│   │   └── useAuditLog.js
│   ├── lib/              # Konfigurasi library
│   │   ├── supabase.js   # Supabase client
│   │   └── queryClient.js
│   ├── pages/            # Halaman (route)
│   │   ├── public/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── InformasiPage.jsx
│   │   │   └── KontakPage.jsx
│   │   └── admin/
│   │       ├── DashboardPage.jsx
│   │       ├── PersyaratanPage.jsx
│   │       ├── InformasiAdminPage.jsx
│   │       ├── BannerPage.jsx
│   │       ├── KontakAdminPage.jsx
│   │       ├── UsersPage.jsx
│   │       ├── AuditLogPage.jsx
│   │       └── StatistikPage.jsx
│   ├── router/
│   │   ├── index.jsx     # Definisi semua routes
│   │   └── ProtectedRoute.jsx
│   ├── store/            # Zustand stores
│   │   ├── authStore.js
│   │   └── uiStore.js
│   ├── SplashScreen.jsx  # Komponen splash screen
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 14. Alur Kerja (User Flow)

### 14.1 User/Publik
```
Buka Website
    → Splash Screen (3-4 detik)
    → Landing Page (Banner + Search + Shortcut)
    → Ketik di Search → Hasil real-time muncul
    → Klik hasil → Detail persyaratan
    → Download file (PDF/Word/Excel)
```

### 14.2 Admin Subbidang
```
Buka /login
    → Input email + password
    → Redirect ke /admin/dashboard
    → Lihat statistik subbidangnya
    → Navigasi ke /admin/persyaratan
    → Tambah persyaratan baru (form + upload file)
    → Publish → Tampil di halaman publik
    → Logout
```

### 14.3 Superadmin
```
Login → Dashboard (semua statistik)
    → Kelola semua data semua subbidang
    → Buat akun admin baru (/admin/users)
    → Pantau audit log (/admin/audit-log)
    → Analisis statistik (/admin/statistik)
    → Export log ke CSV
```

---

## 15. Acceptance Criteria

### 15.1 Fungsional

| Fitur | Kriteria Penerimaan |
|-------|---------------------|
| Splash Screen | Muncul saat pertama buka, animasi lancar, auto-close setelah 4 detik |
| Carousel Banner | Bisa geser kiri-kanan, autoplay, responsif di mobile |
| Real-time Search | Hasil muncul < 500ms setelah pengguna berhenti mengetik |
| Download File | File berhasil diunduh, counter download bertambah di database |
| Login Admin | Berhasil login dalam < 3 detik, redirect ke dashboard |
| RLS | Admin subbidang A tidak bisa lihat/edit data subbidang B |
| Audit Log | Setiap CREATE/UPDATE/DELETE tercatat dengan user + timestamp |
| Status Persyaratan | Badge status tampil benar sesuai data (Aktif/Nonaktif/Diperbarui) |
| Responsif | Layout benar di Chrome mobile 375px dan desktop 1920px |

### 15.2 Non-Fungsional

| Parameter | Target |
|-----------|--------|
| Lighthouse Performance | > 85 |
| Lighthouse Accessibility | > 90 |
| First Contentful Paint | < 2 detik |
| Time to Interactive | < 3 detik |
| Ukuran bundle JS | < 500KB (gzipped) |
| Uptime | > 99.5% (Vercel + Supabase SLA) |

---

## 16. Timeline Pengembangan

| Fase | Durasi | Output |
|------|--------|--------|
| **Fase 1**: Setup & Fondasi | Minggu 1 | Repo, Supabase setup, auth, routing, layout |
| **Fase 2**: Halaman Publik | Minggu 2 | Landing Page, Informasi, Kontak, Search |
| **Fase 3**: Panel Admin | Minggu 3–4 | Dashboard, CRUD Persyaratan, Informasi, Banner |
| **Fase 4**: Superadmin Features | Minggu 5 | User management, Audit Log, Statistik |
| **Fase 5**: Polish & Testing | Minggu 6 | Animasi, responsif, performance, bug fix |
| **Fase 6**: Deployment & Serah Terima | Minggu 7 | Deploy Vercel, training admin, dokumentasi |

---

> **Dokumen ini adalah living document.** Perubahan kebutuhan direkam sebagai versi baru (v1.1, v1.2, dst) dan dikomunikasikan ke tim pengembang sebelum diimplementasikan.

---

*Dibuat untuk: BKPSDM Kabupaten Mempawah | Bidang Diklat, Pengembangan Pegawai & Disiplin*  
*Versi PRD: 1.0.0 | Juni 2026*