"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, UploadCloud, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LayananFormPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    nama_layanan: '',
    deskripsi: '',
    subbidang: 'diklat',
    status: 'aktif',
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchLayanan();
    }
  }, [id]);

  const fetchLayanan = async () => {
    try {
      const { data: layanan, error } = await supabase
        .from('persyaratan')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setFormData({
        nama_layanan: layanan.nama_layanan,
        deskripsi: layanan.deskripsi || '',
        subbidang: layanan.subbidang,
        status: layanan.status,
      });

      const { data: docs, error: docsError } = await supabase
        .from('dokumen_persyaratan')
        .select('*')
        .eq('persyaratan_id', id);

      if (docsError) throw docsError;
      setDocuments(docs || []);
    } catch (error: any) {
      toast.error('Gagal memuat data: ' + error.message);
      router.push('/admin/layanan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteExistingDoc = async (docId: string, filePath: string) => {
    if (!confirm('Hapus dokumen ini?')) return;
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('dokumen-pelayanan')
        .remove([filePath]);
      if (storageError) throw storageError;

      // Delete from db
      const { error: dbError } = await supabase
        .from('dokumen_persyaratan')
        .delete()
        .eq('id', docId);
      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Dokumen dihapus');
    } catch (error: any) {
      toast.error('Gagal menghapus dokumen: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let persyaratanId = id;

      // 1. Save Persyaratan
      if (isEdit) {
        const { error } = await supabase
          .from('persyaratan')
          .update({
            nama_layanan: formData.nama_layanan,
            deskripsi: formData.deskripsi,
            subbidang: formData.subbidang,
            status: formData.status,
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('persyaratan')
          .insert([{
            nama_layanan: formData.nama_layanan,
            deskripsi: formData.deskripsi,
            subbidang: formData.subbidang,
            status: formData.status,
          }])
          .select()
          .single();
        if (error) throw error;
        persyaratanId = data.id;
      }

      // 2. Upload New Files
      if (newFiles.length > 0 && persyaratanId) {
        for (const file of newFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${formData.subbidang}/${persyaratanId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('dokumen-pelayanan')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;

          const { error: dbError } = await supabase
            .from('dokumen_persyaratan')
            .insert([{
              persyaratan_id: persyaratanId,
              nama_dokumen: file.name,
              file_url: fileName,
              file_name: file.name,
              file_size: file.size,
              file_type: fileExt?.toLowerCase() || 'pdf',
            }]);
          
          if (dbError) throw dbError;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin-layanan'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(isEdit ? 'Layanan berhasil diperbarui' : 'Layanan berhasil ditambahkan');
      router.push('/admin/layanan');
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
        <Link href="/admin/layanan" className="rounded-full p-2 text-textSecondary transition-colors hover:bg-slate-100 hover:text-textPrimary">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">{isEdit ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h1>
          <p className="text-textSecondary">Lengkapi informasi layanan beserta dokumen persyaratannya.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-sm md:p-8">
        
        {/* Basic Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-textPrimary">Nama Layanan <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.nama_layanan}
              onChange={(e) => setFormData({ ...formData, nama_layanan: e.target.value })}
              className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
              placeholder="Contoh: Izin Belajar"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-textPrimary">Deskripsi Layanan</label>
            <textarea
              rows={4}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
              placeholder="Jelaskan deskripsi atau keterangan singkat mengenai layanan ini..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textPrimary">Subbidang <span className="text-red-500">*</span></label>
            <select
              value={formData.subbidang}
              onChange={(e) => setFormData({ ...formData, subbidang: e.target.value })}
              className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
            >
              <option value="diklat">Diklat</option>
              <option value="pengembangan_pegawai">Pengembangan Pegawai</option>
              <option value="disiplin">Disiplin</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-textPrimary">Status <span className="text-red-500">*</span></label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-border bg-slate-50 p-3 text-textPrimary outline-none focus:border-primary"
            >
              <option value="aktif">Aktif</option>
              <option value="diperbarui">Diperbarui</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <hr className="border-border" />

        {/* Documents */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-textPrimary">Dokumen Persyaratan</h3>
          
          {/* Existing Documents */}
          {documents.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-textSecondary">Dokumen Tersimpan:</p>
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-primary" />
                    <span className="text-sm font-medium">{doc.nama_dokumen}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteExistingDoc(doc.id, doc.file_url)}
                    className="text-red-500 hover:text-red-700"
                    title="Hapus file"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload New Documents */}
          <div>
            <label className="mb-2 block text-sm font-medium text-textSecondary">Upload Dokumen Baru (Bisa lebih dari 1 file PDF/Word/Excel)</label>
            <div className="flex w-full items-center justify-center">
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-slate-50 transition-colors hover:bg-slate-100">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <UploadCloud size={32} className="mb-2 text-textSecondary" />
                  <p className="mb-2 text-sm text-textSecondary">
                    <span className="font-semibold text-primary">Klik untuk upload</span> atau drag and drop
                  </p>
                </div>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* New Files Preview */}
            {newFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-textSecondary">File yang akan diupload:</p>
                {newFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href="/admin/layanan" className="rounded-lg px-6 py-2.5 font-medium text-textSecondary hover:bg-slate-100">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {isSubmitting ? 'Menyimpan...' : <><Save size={20} /> Simpan Layanan</>}
          </button>
        </div>
      </form>
    </div>
  );
}
