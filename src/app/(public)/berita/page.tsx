"use client";
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Calendar, Tag } from 'lucide-react';

export default function BeritaPage() {
  const { data: beritaList = [], isLoading } = useQuery({
    queryKey: ['berita'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('informasi')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        ...item,
        full_image_url: item.thumbnail_url 
          ? supabase.storage.from('dokumen-pelayanan').getPublicUrl(item.thumbnail_url).data.publicUrl 
          : 'https://via.placeholder.com/600x400?text=Berita'
      }));
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-textPrimary md:text-5xl">Informasi & Berita</h1>
        <p className="mx-auto max-w-2xl text-textSecondary">
          Kumpulan berita, pengumuman, dan informasi terbaru seputar layanan BKPSDM Kabupaten Mempawah.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-textSecondary">Memuat berita...</div>
      ) : beritaList.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {beritaList.map((berita: any, idx: number) => (
            <motion.div 
              key={berita.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="h-48 w-full overflow-hidden bg-slate-100">
                <img 
                  src={berita.full_image_url} 
                  alt={berita.judul} 
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-4 text-xs text-textSecondary">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(berita.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {berita.kategori && (
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      {berita.kategori}
                    </span>
                  )}
                </div>
                <h3 className="mb-3 text-xl font-bold text-textPrimary line-clamp-2">
                  {berita.judul}
                </h3>
                <p className="mb-4 line-clamp-3 flex-1 text-sm text-textSecondary whitespace-pre-wrap">
                  {berita.isi}
                </p>
                <div className="mt-auto pt-4 border-t border-border">
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {berita.subbidang?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-slate-50 py-20 text-center text-textSecondary">
          Belum ada berita atau informasi terbaru yang dipublikasikan.
        </div>
      )}
    </div>
  );
}
