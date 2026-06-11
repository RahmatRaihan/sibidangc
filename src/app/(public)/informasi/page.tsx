"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Users, Scale, FileText, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const SUBBIDANG_OPTIONS = [
  { id: 'semua', label: 'Semua Bidang' },
  { id: 'diklat', label: 'Diklat' },
  { id: 'pengembangan_pegawai', label: 'Pengembangan Pegawai' },
  { id: 'disiplin', label: 'Disiplin' },
];

const STATUS_OPTIONS = [
  { id: 'semua', label: 'Semua Status' },
  { id: 'aktif', label: 'Aktif' },
  { id: 'diperbarui', label: 'Diperbarui' },
  { id: 'nonaktif', label: 'Nonaktif' },
];

function InformasiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const activeTab = searchParams?.get('bidang') || 'semua';
  const activeStatus = searchParams?.get('status') || 'semua';
  const [selectedPersyaratan, setSelectedPersyaratan] = useState<any | null>(null);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const { data: persyaratanList = [], isLoading } = useQuery({
    queryKey: ['persyaratan', activeTab, activeStatus],
    queryFn: async () => {
      let query = supabase
        .from('persyaratan')
        .select(`
          *,
          dokumen_persyaratan (*)
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'semua') {
        query = query.eq('subbidang', activeTab);
      }
      if (activeStatus !== 'semua') {
        query = query.eq('status', activeStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getSubbidangColor = (sub: string) => {
    switch (sub) {
      case 'diklat': return 'bg-primary text-white';
      case 'pengembangan_pegawai': return 'bg-secondary text-white';
      case 'disiplin': return 'bg-accent text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getSubbidangIcon = (sub: string, size = 20) => {
    switch (sub) {
      case 'diklat': return <GraduationCap size={size} />;
      case 'pengembangan_pegawai': return <Users size={size} />;
      case 'disiplin': return <Scale size={size} />;
      default: return <FileText size={size} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif': 
        return <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"><CheckCircle size={12}/> Aktif</span>;
      case 'diperbarui': 
        return <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"><Clock size={12}/> Diperbarui</span>;
      case 'nonaktif': 
        return <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"><XCircle size={12}/> Nonaktif</span>;
      default: 
        return null;
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      // Create a toast to show downloading state
      const toastId = toast.loading('Mengunduh dokumen...');
      
      const { data, error } = await supabase.storage
        .from('dokumen-pelayanan')
        .createSignedUrl(doc.file_url, 60); // 60 seconds expiry

      if (error) throw error;

      // Update download count (rpc or direct if allowed, typically requires RLS or backend logic, skipping for now)
      // Trigger download
      window.open(data.signedUrl, '_blank');
      toast.success('Dokumen berhasil diunduh', { id: toastId });
    } catch (error: any) {
      toast.error('Gagal mengunduh dokumen: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-textPrimary">Informasi Layanan & Persyaratan</h1>
        <p className="text-textSecondary">Temukan semua syarat dan ketentuan pelayanan BKPSDM di sini.</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Tabs Subbidang */}
        <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
          {SUBBIDANG_OPTIONS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateParams('bidang', tab.id)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-textSecondary">Status:</span>
          <select
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary"
            value={activeStatus}
            onChange={(e) => updateParams('status', e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-textSecondary">Memuat data...</div>
        ) : persyaratanList.length > 0 ? (
          persyaratanList.map((srv: any, idx: number) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="h-full"
            >
              <div 
                onClick={() => setSelectedPersyaratan(srv)}
                className="group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-2 ${getSubbidangColor(srv.subbidang)} bg-opacity-10 text-${getSubbidangColor(srv.subbidang).split(' ')[0].replace('bg-', '')}`}>
                      {getSubbidangIcon(srv.subbidang, 18)}
                    </div>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSubbidangColor(srv.subbidang)}`}>
                      {srv.subbidang.replace('_', ' ')}
                    </span>
                  </div>
                  {getStatusBadge(srv.status)}
                </div>
                <h3 className="mb-2 text-lg font-bold text-textPrimary group-hover:text-primary">
                  {srv.nama_layanan}
                </h3>
                <p className="mb-4 line-clamp-3 flex-1 text-sm text-textSecondary">
                  {srv.deskripsi || 'Tidak ada deskripsi yang tersedia.'}
                </p>
                <div className="mt-auto border-t border-border pt-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-textPrimary">
                    <FileText size={16} className="text-primary" />
                    {srv.dokumen_persyaratan?.length || 0} Dokumen Tersedia
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-slate-50 py-20 text-center">
            <h3 className="mb-2 text-xl font-bold text-textPrimary">Tidak ada data</h3>
            <p className="text-textSecondary">Tidak ada persyaratan yang cocok dengan filter yang dipilih.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Persyaratan */}
      <Modal
        isOpen={!!selectedPersyaratan}
        onClose={() => setSelectedPersyaratan(null)}
        title="Detail Persyaratan"
      >
        {selectedPersyaratan && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSubbidangColor(selectedPersyaratan.subbidang)}`}>
                  {selectedPersyaratan.subbidang.replace('_', ' ')}
                </span>
                {getStatusBadge(selectedPersyaratan.status)}
              </div>
              <h2 className="text-2xl font-bold text-textPrimary">{selectedPersyaratan.nama_layanan}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-textSecondary">
                {selectedPersyaratan.deskripsi}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-slate-50 p-4">
              <h4 className="mb-4 font-bold text-textPrimary">Dokumen yang Dibutuhkan</h4>
              {selectedPersyaratan.dokumen_persyaratan?.length > 0 ? (
                <ul className="space-y-3">
                  {selectedPersyaratan.dokumen_persyaratan.map((doc: any) => (
                    <li key={doc.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border border-border">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={20} className="shrink-0 text-primary" />
                        <div>
                          <p className="truncate font-medium text-textPrimary">{doc.nama_dokumen}</p>
                          {doc.deskripsi && <p className="truncate text-xs text-textSecondary">{doc.deskripsi}</p>}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                        className="flex shrink-0 items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-blue-100"
                      >
                        <Download size={14} /> Unduh
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-textSecondary">Tidak ada dokumen yang dilampirkan.</p>
              )}
            </div>
            
            <div className="text-right text-xs text-textSecondary">
              Terakhir diperbarui: {new Date(selectedPersyaratan.updated_at).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function InformasiPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-textSecondary">Memuat halaman...</div></div>}>
      <InformasiContent />
    </Suspense>
  );
}
