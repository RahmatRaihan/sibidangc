"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InformasiFormPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    subbidang: 'diklat',
    kategori: '',
    is_published: false,
  });
  
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchInformasi();
    }
  }, [id]);

  const fetchInformasi = async () => {
    try {
      const { data: info, error } = await supabase
        .from('informasi')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setFormData({
        judul: info.judul,
        isi: info.isi || '',
        subbidang: info.subbidang || 'diklat',
        kategori: info.kategori || '',
        is_published: info.is_published,
      });
      
      if (info.thumbnail_url) {
        setCurrentImageUrl(info.thumbnail_url);
        const publicUrl = supabase.storage.from('dokumen-pelayanan').getPublicUrl(info.thumbnail_url).data.publicUrl;
        setImagePreview(publicUrl);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data: ' + error.message);
      router.push('/admin/informasi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = currentImageUrl;

      // Upload new image if exists
      if (newImage) {
        const fileExt = newImage.name.split('.').pop();
        const fileName = `informasi/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('dokumen-pelayanan')
          .upload(fileName, newImage);
        
        if (uploadError) throw uploadError;
        
        if (isEdit && currentImageUrl) {
          supabase.storage.from('dokumen-pelayanan').remove([currentImageUrl]).catch(console.error);
        }

        finalImageUrl = fileName;
      }

      const payload = {
        judul: formData.judul,
        isi: formData.isi,
        subbidang: formData.subbidang,
        kategori: formData.kategori,
        is_published: formData.is_published,
        thumbnail_url: finalImageUrl,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('informasi')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('informasi')
          .insert([payload]);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['admin-informasi'] });
      queryClient.invalidateQueries({ queryKey: ['informasi'] });
      toast.success(isEdit ? 'Informasi berhasil diperbarui' : 'Informasi berhasil ditambahkan');
      router.push('/admin/informasi');
    } catch (error: any) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-textSecondary">Memuat form...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/informasi" className="rounded-full p-2 text-textSecondary transition-colors hover:bg-slate-100 hover:text-textPrimary">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">{isEdit ? 'Edit Informasi' : 'Tambah Informasi Baru'}</h1>
          <p className="text-textSecondary">Buat artikel berita atau pengumuman penting.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-sm md:p-8">
        
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Main Content Area */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-textPrimary">Judul Informasi <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
                placeholder="Contoh: Pendaftaran Diklat PIM III Dibuka"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-textPrimary">Isi / Konten <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={12}
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
                placeholder="Tulis detail informasi selengkapnya di sini..."
              />
            </div>
          </div>

          {/* Sidebar / Metadata Area */}
          <div className="space-y-4 md:col-span-1">
            
            {/* Image Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-textPrimary">Gambar Thumbnail</label>
              <div className="flex w-full items-center justify-center">
                <label className="relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-slate-50 transition-colors hover:bg-slate-100">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <ImageIcon size={32} className="mb-2 text-textSecondary" />
                      <p className="text-xs font-semibold text-textPrimary">Pilih gambar</p>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-textPrimary">
                      <UploadCloud size={16} /> Ganti
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-textPrimary">Kategori</label>
              <input
                type="text"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
                placeholder="Misal: Pengumuman"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-textPrimary">Subbidang <span className="text-red-500">*</span></label>
              <select
                value={formData.subbidang}
                onChange={(e) => setFormData({ ...formData, subbidang: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
              >
                <option value="diklat">Diklat</option>
                <option value="pengembangan_pegawai">Pengembangan Pegawai</option>
                <option value="disiplin">Disiplin</option>
              </select>
            </div>

            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-textPrimary">
                  Publikasikan Informasi
                </label>
              </div>
              <p className="mt-1 pl-6 text-xs text-textSecondary">
                Jika tidak dicentang, informasi ini hanya akan disimpan sebagai draft.
              </p>
            </div>

          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
          <Link href="/admin/informasi" className="rounded-lg px-6 py-2.5 font-medium text-textSecondary hover:bg-slate-100">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : <><Save size={20} /> Simpan Informasi</>}
          </button>
        </div>
      </form>
    </div>
  );
}
