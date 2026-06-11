"use client";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

const fetchStats = async () => {
  const [totalRes, aktifRes, diperbaruiRes, nonaktifRes] = await Promise.all([
    supabase.from('persyaratan').select('id', { count: 'exact' }),
    supabase.from('persyaratan').select('id', { count: 'exact' }).eq('status', 'aktif'),
    supabase.from('persyaratan').select('id', { count: 'exact' }).eq('status', 'diperbarui'),
    supabase.from('persyaratan').select('id', { count: 'exact' }).eq('status', 'nonaktif'),
  ]);

  return {
    total: totalRes.count || 0,
    aktif: aktifRes.count || 0,
    diperbarui: diperbaruiRes.count || 0,
    nonaktif: nonaktifRes.count || 0,
  };
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textPrimary md:text-3xl">Dashboard</h1>
        <p className="text-textSecondary">Selamat datang di Panel Admin Portal Bidang C Kabupaten Mempawah.</p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">Memuat statistik...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-50 p-3 text-primary">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-textSecondary">Total Layanan</p>
                <p className="text-2xl font-bold text-textPrimary">{stats?.total}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-50 p-3 text-secondary">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-textSecondary">Status Aktif</p>
                <p className="text-2xl font-bold text-textPrimary">{stats?.aktif}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-textSecondary">Status Diperbarui</p>
                <p className="text-2xl font-bold text-textPrimary">{stats?.diperbarui}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-gray-600">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-textSecondary">Status Nonaktif</p>
                <p className="text-2xl font-bold text-textPrimary">{stats?.nonaktif}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-textPrimary">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/layanan"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <FileText size={20} /> Kelola Data Layanan
          </Link>
        </div>
      </div>
    </div>
  );
}
