"use client";
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Save, Phone, Mail, MapPin, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SUBBIDANG_OPTIONS = [
  { id: 'diklat', label: 'Pendidikan dan Pelatihan (Diklat)' },
  { id: 'pengembangan_pegawai', label: 'Pengembangan Pegawai' },
  { id: 'disiplin', label: 'Disiplin dan Penghargaan' },
];

export default function KontakPage() {
  const [activeTab, setActiveTab] = useState('diklat');
  const queryClient = useQueryClient();

  const { data: kontakList = [], isLoading } = useQuery({
    queryKey: ['admin-kontak'],
    queryFn: async () => {
      const { data, error } = await supabase.from('kontak').select('*');
      if (error) throw error;
      return data;
    },
  });

  const activeKontak = kontakList.find((k: any) => k.subbidang === activeTab) || null;

  const [formData, setFormData] = useState({
    nama_petugas: '',
    jabatan: '',
    no_telepon: '',
    email: '',
    lokasi: '',
    jam_kerja: '',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeKontak) {
      setFormData({
        nama_petugas: activeKontak.nama_petugas || '',
        jabatan: activeKontak.jabatan || '',
        no_telepon: activeKontak.no_telepon || '',
        email: activeKontak.email || '',
        lokasi: activeKontak.lokasi || '',
        jam_kerja: activeKontak.jam_kerja || '',
        is_active: activeKontak.is_active ?? true,
      });
    } else {
      setFormData({
        nama_petugas: '',
        jabatan: '',
        no_telepon: '',
        email: '',
        lokasi: '',
        jam_kerja: '',
        is_active: true,
      });
    }
  }, [activeKontak, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeKontak) {
        // Update existing
        const { error } = await supabase
          .from('kontak')
          .update(formData)
          .eq('id', activeKontak.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('kontak')
          .insert([{ ...formData, subbidang: activeTab }]);
        if (error) throw error;
      }

      toast.success('Data kontak berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['admin-kontak'] });
      queryClient.invalidateQueries({ queryKey: ['kontak'] }); // public query
    } catch (error: any) {
      toast.error('Gagal menyimpan kontak: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textPrimary md:text-3xl">Pengaturan Kontak</h1>
        <p className="text-textSecondary">Kelola informasi narahubung untuk setiap subbidang layanan.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {SUBBIDANG_OPTIONS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-textSecondary hover:bg-slate-100 hover:text-textPrimary'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-textSecondary">Memuat data kontak...</div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-textPrimary">Informasi Kontak: {SUBBIDANG_OPTIONS.find(t => t.id === activeTab)?.label}</h2>
            <p className="text-sm text-textSecondary">Pastikan data yang diisi valid dan mudah dihubungi oleh pengunjung.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-textPrimary">
                <User size={16} className="text-textSecondary" /> Nama Petugas / Admin <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_petugas}
                onChange={(e) => setFormData({ ...formData, nama_petugas: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
                placeholder="Misal: Bapak Budi Santoso"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-textPrimary">
                <User size={16} className="text-textSecondary" /> Jabatan
              </label>
              <input
                type="text"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
                placeholder="Misal: Admin Layanan Diklat"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-textPrimary">
                <Phone size={16} className="text-textSecondary" /> Nomor WhatsApp / Telepon
              </label>
              <input
                type="text"
                value={formData.no_telepon}
                onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
                placeholder="Misal: 081234567890"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-textPrimary">
                <Mail size={16} className="text-textSecondary" /> Alamat Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
                placeholder="Misal: diklat@bkpsdm.mempawah.go.id"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-textPrimary">
                <MapPin size={16} className="text-textSecondary" /> Lokasi Ruangan / Meja Layanan
              </label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
                placeholder="Misal: Gedung A, Lantai 2, Ruang Subbidang Diklat"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-textPrimary">
                <Clock size={16} className="text-textSecondary" /> Jam Kerja / Pelayanan
              </label>
              <input
                type="text"
                value={formData.jam_kerja}
                onChange={(e) => setFormData({ ...formData, jam_kerja: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
                placeholder="Misal: Senin - Jumat, 08:00 - 15:00 WIB"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-textPrimary">
                Tampilkan kontak ini di halaman publik
              </label>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end border-t border-border pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-70"
            >
              {isSubmitting ? 'Menyimpan...' : <><Save size={20} /> Simpan Kontak</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
