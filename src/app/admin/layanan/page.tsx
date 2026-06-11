"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function LayananPage() {
  const [search, setSearch] = useState('');
  const [filterBidang, setFilterBidang] = useState('semua');
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const queryClient = useQueryClient();

  const { data: layananList = [], isLoading } = useQuery({
    queryKey: ['admin-layanan', filterBidang],
    queryFn: async () => {
      let query = supabase.from('persyaratan').select('*, dokumen_persyaratan(count)').order('created_at', { ascending: false });
      if (filterBidang !== 'semua') {
        query = query.eq('subbidang', filterBidang);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('persyaratan').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Layanan berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-layanan'] });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    },
    onError: (err: any) => {
      toast.error('Gagal menghapus: ' + err.message);
      setIsDeleteModalOpen(false);
    }
  });

  const handleDeleteClick = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const filteredData = layananList.filter((item: any) => 
    item.nama_layanan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary md:text-3xl">Manajemen Layanan</h1>
          <p className="text-textSecondary">Kelola data persyaratan dan dokumen pelayanan.</p>
        </div>
        <Link
          href="/admin/layanan/baru"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus size={20} /> Tambah Layanan
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
          <input
            type="text"
            placeholder="Cari nama layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white p-2.5 pl-10 text-textPrimary outline-none focus:border-primary"
          />
        </div>
        <select
          value={filterBidang}
          onChange={(e) => setFilterBidang(e.target.value)}
          className="rounded-lg border border-border bg-white p-2.5 text-textPrimary outline-none focus:border-primary md:w-48"
        >
          <option value="semua">Semua Bidang</option>
          <option value="diklat">Diklat</option>
          <option value="pengembangan_pegawai">Pengembangan Pegawai</option>
          <option value="disiplin">Disiplin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textPrimary">
            <thead className="bg-slate-50 text-xs uppercase text-textSecondary">
              <tr>
                <th className="px-6 py-4">Nama Layanan</th>
                <th className="px-6 py-4">Subbidang</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dokumen</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-textSecondary">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-textSecondary">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="border-b border-border transition-colors hover:bg-slate-50 last:border-0">
                    <td className="px-6 py-4 font-medium">{item.nama_layanan}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {item.subbidang.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === 'aktif' ? 'bg-green-100 text-green-800' :
                        item.status === 'diperbarui' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-textSecondary">
                        <FileText size={16} />
                        {item.dokumen_persyaratan?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/layanan/${item.id}`}
                          className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.nama_layanan)}
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
        title="Hapus Layanan"
        message={`Apakah Anda yakin ingin menghapus layanan "${itemToDelete?.name}"? Semua dokumen persyaratan yang terkait juga akan ikut terhapus dan tidak dapat dikembalikan.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
