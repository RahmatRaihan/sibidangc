"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BannerFormPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link_url: '',
    subbidang: 'umum',
    is_active: true,
    sort_order: 0,
  });
  
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchBanner();
    }
  }, [id]);

  const fetchBanner = async () => {
    try {
      const { data: banner, error } = await supabase
        .from('banners')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setFormData({
        title: banner.title,
        description: banner.description || '',
        link_url: banner.link_url || '',
        subbidang: banner.subbidang || 'umum',
        is_active: banner.is_active,
        sort_order: banner.sort_order || 0,
      });
      
      if (banner.image_url) {
        setCurrentImageUrl(banner.image_url);
        // Set preview to public url
        const publicUrl = supabase.storage.from('dokumen-pelayanan').getPublicUrl(banner.image_url).data.publicUrl;
        setImagePreview(publicUrl);
      }
    } catch (error: any) {
      toast.error('Gagal memuat data: ' + error.message);
      router.push('/admin/banners');
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
        const fileName = `banners/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('dokumen-pelayanan')
          .upload(fileName, newImage);
        
        if (uploadError) throw uploadError;
        
        // If it's an edit and we have an old image, we could optionally delete it to save space
        if (isEdit && currentImageUrl) {
          supabase.storage.from('dokumen-pelayanan').remove([currentImageUrl]).catch(console.error);
        }

        finalImageUrl = fileName;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        link_url: formData.link_url,
        subbidang: formData.subbidang,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order.toString()),
        image_url: finalImageUrl,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('banners')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([payload]);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] }); // Public query
      toast.success(isEdit ? 'Banner berhasil diperbarui' : 'Banner berhasil ditambahkan');
      router.push('/admin/banners');
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
        <Link href="/admin/banners" className="rounded-full p-2 text-textSecondary transition-colors hover:bg-slate-100 hover:text-textPrimary">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">{isEdit ? 'Edit Banner' : 'Tambah Banner Baru'}</h1>
          <p className="text-textSecondary">Banner akan ditampilkan di bagian atas halaman utama.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-sm md:p-8">
        
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Left Column: Image Upload */}
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-textPrimary">Gambar Banner</label>
            <div className="flex w-full items-center justify-center">
              <label className="relative flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-slate-50 transition-colors hover:bg-slate-100">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <ImageIcon size={40} className="mb-2 text-textSecondary" />
                    <p className="mb-1 text-sm font-semibold text-textPrimary">Pilih gambar</p>
                    <p className="text-xs text-textSecondary">PNG, JPG, WEBP up to 5MB</p>
                    <p className="mt-2 text-[10px] text-textSecondary">Rekomendasi ukuran: 1200x400px</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-textPrimary">
                    <UploadCloud size={18} /> Ganti Gambar
                  </span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            {!isEdit && !newImage && (
              <p className="mt-2 text-xs text-red-500">Silakan unggah gambar banner terlebih dahulu.</p>
            )}
          </div>

          {/* Right Column: Form Fields */}
          <div className="space-y-4 md:col-span-1">
            <div>
              <label className="mb-1 block text-sm font-medium text-textPrimary">Judul Banner <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
                placeholder="Contoh: Selamat Datang..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-textPrimary">Deskripsi Singkat</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
                placeholder="Jelaskan isi pengumuman/banner ini..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-textPrimary">Tautan Tuju (Link Opsional)</label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-textPrimary">Subbidang</label>
                <select
                  value={formData.subbidang}
                  onChange={(e) => setFormData({ ...formData, subbidang: e.target.value })}
                  className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
                >
                  <option value="umum">Umum</option>
                  <option value="diklat">Diklat</option>
                  <option value="pengembangan_pegawai">Pengembangan Pegawai</option>
                  <option value="disiplin">Disiplin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-textPrimary">Urutan</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-border bg-slate-50 p-2.5 text-textPrimary outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-textPrimary">
                Banner Aktif (Tampilkan di Beranda)
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
          <Link href="/admin/banners" className="rounded-lg px-6 py-2.5 font-medium text-textSecondary hover:bg-slate-100">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || (!isEdit && !newImage)}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : <><Save size={20} /> Simpan Banner</>}
          </button>
        </div>
      </form>
    </div>
  );
}
