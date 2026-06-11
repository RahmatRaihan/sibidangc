"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function BannerPage() {
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; imageUrl?: string } | null>(null);

  const queryClient = useQueryClient();

  const { data: bannersList = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: { id: string, imageUrl?: string }) => {
      // If there's an image, attempt to delete it from storage
      if (item.imageUrl) {
        // Extract file path from URL or just use the stored path depending on how we save it.
        // Assuming imageUrl is the storage path
        await supabase.storage.from('dokumen-pelayanan').remove([item.imageUrl]);
      }
      
      const { error } = await supabase.from('banners').delete().eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Banner berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    },
    onError: (err: any) => {
      toast.error('Gagal menghapus: ' + err.message);
      setIsDeleteModalOpen(false);
    }
  });

  const handleDeleteClick = (id: string, name: string, imageUrl?: string) => {
    setItemToDelete({ id, name, imageUrl });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate({ id: itemToDelete.id, imageUrl: itemToDelete.imageUrl });
    }
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase.from('banners').update({ is_active: !is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Status banner diperbarui');
    },
    onError: (err: any) => {
      toast.error('Gagal memperbarui status: ' + err.message);
    }
  });

  const filteredData = bannersList.filter((item: any) => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary md:text-3xl">Manajemen Banner</h1>
          <p className="text-textSecondary">Kelola pengumuman banner yang tampil di halaman utama.</p>
        </div>
        <Link
          href="/admin/banners/baru"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus size={20} /> Tambah Banner
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
          <input
            type="text"
            placeholder="Cari judul banner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white p-2.5 pl-10 text-textPrimary outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table / Grid */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textPrimary">
            <thead className="bg-slate-50 text-xs uppercase text-textSecondary">
              <tr>
                <th className="px-6 py-4">Thumbnail</th>
                <th className="px-6 py-4">Judul Banner</th>
                <th className="px-6 py-4">Subbidang</th>
                <th className="px-6 py-4">Urutan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="border-b border-border transition-colors hover:bg-slate-50 last:border-0">
                    <td className="px-6 py-4">
                      {item.image_url ? (
                        <img 
                          src={supabase.storage.from('dokumen-pelayanan').getPublicUrl(item.image_url).data.publicUrl} 
                          alt={item.title}
                          className="h-12 w-20 rounded object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-12 w-20 items-center justify-center rounded bg-slate-200 text-xs text-textSecondary">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{item.title}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {item.subbidang?.replace('_', ' ') || 'Umum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      {item.sort_order}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleActiveMutation.mutate({ id: item.id, is_active: item.is_active })}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80 ${
                          item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/banners/${item.id}`}
                          className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.title, item.image_url)}
                          className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Banner"
        message={`Apakah Anda yakin ingin menghapus banner "${itemToDelete?.name}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
