"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, Users, Scale, FileText } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

// --- Fetch Functions ---
const fetchBanners = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;

  // Transform image_url to public URL
  return data.map((banner: any) => ({
    ...banner,
    full_image_url: banner.image_url
      ? supabase.storage.from('dokumen-pelayanan').getPublicUrl(banner.image_url).data.publicUrl
      : 'https://via.placeholder.com/1200x400?text=Pengumuman'
  }));
};

const fetchLatestPersyaratan = async () => {
  const { data, error } = await supabase
    .from('persyaratan')
    .select('*, dokumen_persyaratan(count)')
    .eq('status', 'aktif')
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) throw error;
  return data;
};

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search Query
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['searchPersyaratan', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const { data, error } = await supabase
        .from('persyaratan')
        .select('*')
        .ilike('nama_layanan', `%${debouncedSearch}%`)
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: debouncedSearch.length > 0,
  });

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: fetchBanners,
  });

  const { data: latestServices = [] } = useQuery({
    queryKey: ['latestServices'],
    queryFn: fetchLatestPersyaratan,
  });

  const getSubbidangColor = (sub: string) => {
    switch (sub) {
      case 'diklat': return 'bg-primary text-white';
      case 'pengembangan_pegawai': return 'bg-secondary text-white';
      case 'disiplin': return 'bg-accent text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getSubbidangIcon = (sub: string, size = 24) => {
    switch (sub) {
      case 'diklat': return <GraduationCap size={size} />;
      case 'pengembangan_pegawai': return <Users size={size} />;
      case 'disiplin': return <Scale size={size} />;
      default: return <FileText size={size} />;
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16">

      {/* Overlay Blur saat search difokuskan */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-md dark:bg-slate-900/60"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Search Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-900 px-4 py-20 overflow-hidden">
        {/* Background Watermark Logo */}
        <div 
          className="absolute right-[-15%] md:right-[-10%] lg:right-[-5%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px] bg-no-repeat bg-center bg-contain opacity-[0.035] pointer-events-none select-none z-0"
          style={{ 
            backgroundImage: `url('/logo.png')`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-4xl text-center relative transition-all duration-300 ${isSearchFocused ? 'z-50' : 'z-10'}`}
        >
          <h2 className="mb-8 font-bold text-primary">
            <motion.span 
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="block text-4xl md:text-6xl lg:text-7xl pb-4 mb-2 leading-tight bg-[linear-gradient(110deg,#1e3a8a,45%,#3b82f6,55%,#1e3a8a)] bg-[length:200%_100%] bg-clip-text text-transparent"
            >
              Layanan Kepegawaian
            </motion.span>
            <span className="block text-xl md:text-3xl lg:text-4xl text-textSecondary">Bidang Diklat, Pengembangan Pegawai & Disiplin</span>
          </h2>
          <p className="mb-12 text-textSecondary md:text-xl lg:text-2xl max-w-3xl mx-auto">
            Temukan informasi dan persyaratan layanan kepegawaian dengan cepat dan mudah.
          </p>

          <div className={`relative mx-auto max-w-xl transition-all duration-300 ${isSearchFocused ? 'scale-110 z-50' : 'z-10'}`}>
            <div className={`relative flex items-center rounded-full p-2 shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 ${isSearchFocused ? 'ring-4 ring-primary/30 shadow-2xl' : 'focus-within:ring-2 focus-within:ring-primary'}`}>
              <Search className="ml-4 text-textSecondary" size={24} />
              <input
                type="text"
                placeholder="Cari layanan atau persyaratan..."
                className="w-full bg-transparent px-4 py-3 text-textPrimary outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  // Delay blur sedikit agar klik pada hasil dropdown sempat terbaca
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
              />
            </div>

            {/* Search Results Dropdown */}
            {debouncedSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 mt-2 w-full rounded-xl border border-border bg-white py-2 shadow-xl"
              >
                {isSearchLoading ? (
                  <div className="p-4 text-textSecondary">Mencari...</div>
                ) : searchResults?.length ? (
                  searchResults.map(res => (
                    <Link href={`/informasi?layanan=${res.id}`}
                      key={res.id}
                      className="block border-b border-border p-4 text-left last:border-0 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${getSubbidangColor(res.subbidang)}`}>
                          {res.subbidang.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="mt-1 font-semibold text-textPrimary">{res.nama_layanan}</h4>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-textSecondary">Tidak ada hasil ditemukan.</div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Banner Carousel */}
      <section className="container mx-auto px-4 md:px-8 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="overflow-hidden rounded-2xl shadow-lg"
        >
          {banners.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={0}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation
              autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              className="h-[300px] w-full md:h-[400px]"
            >
              {banners.map((banner: any) => (
                <SwiperSlide key={banner.id}>
                  <div
                    className="relative flex h-full w-full flex-col justify-end bg-cover bg-center bg-no-repeat p-8 text-white"
                    style={{ backgroundImage: `url(${banner.full_image_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="relative z-10">
                      {banner.subbidang && (
                        <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getSubbidangColor(banner.subbidang)}`}>
                          {banner.subbidang.replace('_', ' ')}
                        </span>
                      )}
                      {banner.link_url ? (
                        <a href={banner.link_url} target="_blank" rel="noreferrer" className="mb-2 block text-2xl font-bold hover:underline md:text-4xl">
                          {banner.title}
                        </a>
                      ) : (
                        <h3 className="mb-2 text-2xl font-bold md:text-4xl">{banner.title}</h3>
                      )}
                      <p className="max-w-2xl text-sm text-gray-200 md:text-base">{banner.description}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flex h-[300px] items-center justify-center bg-slate-100 text-textSecondary">
              Tidak ada pengumuman saat ini.
            </div>
          )}
        </motion.div>
      </section>

      {/* Shortcut Subbidang */}
      <section className="container mx-auto px-4 md:px-8 flex flex-col justify-center py-20">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="mb-12 text-center text-3xl font-bold text-textPrimary"
        >
          Layanan Berdasarkan Bidang
        </motion.h3>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { id: 'diklat', title: 'Diklat', icon: <GraduationCap size={40} />, color: 'bg-gradient-to-b from-white to-blue-50 text-primary border border-blue-200 border-b-[6px] border-b-blue-400', iconBg: 'bg-blue-100 shadow-inner', link: '/informasi?bidang=diklat' },
            { id: 'pengembangan_pegawai', title: 'Pengembangan Pegawai', icon: <Users size={40} />, color: 'bg-gradient-to-b from-white to-green-50 text-secondary border border-green-200 border-b-[6px] border-b-green-400', iconBg: 'bg-green-100 shadow-inner', link: '/informasi?bidang=pengembangan_pegawai' },
            { id: 'disiplin', title: 'Disiplin Pegawai', icon: <Scale size={40} />, color: 'bg-gradient-to-b from-white to-orange-50 text-accent border border-orange-200 border-b-[6px] border-b-orange-400', iconBg: 'bg-orange-100 shadow-inner', link: '/informasi?bidang=disiplin' }
          ].map((item, idx) => (
            <Link href={item.link} key={item.id} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <div className={`flex h-full flex-col items-center justify-center rounded-2xl p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${item.color}`}>
                  <div className={`mb-4 rounded-full p-4 ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <h4 className="text-xl font-bold">{item.title}</h4>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Persyaratan Terbaru */}
      <section className="container mx-auto px-4 md:px-8 flex flex-col justify-center pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="mb-12 flex items-center justify-between"
        >
          <h3 className="text-3xl font-bold text-textPrimary">Persyaratan Terbaru</h3>
          <Link href="/informasi" className="text-sm font-semibold text-primary hover:underline">
            Lihat Semua &rarr;
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestServices.length > 0 ? (
            latestServices.map((srv: any, idx: number) => (
              <Link href="/informasi" key={srv.id} className="block h-full">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  className="h-full"
                >
                  <div className="group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30">
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`rounded-lg p-3 ${getSubbidangColor(srv.subbidang)} bg-opacity-10 text-${getSubbidangColor(srv.subbidang).split(' ')[0].replace('bg-', '')}`}>
                        {getSubbidangIcon(srv.subbidang)}
                      </div>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {srv.status}
                      </span>
                    </div>
                    <h4 className="mb-2 text-lg font-bold text-textPrimary group-hover:text-primary">
                      {srv.nama_layanan}
                    </h4>
                    <p className="mb-4 line-clamp-2 text-sm text-textSecondary">
                      {srv.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-sm text-textSecondary">
                      <FileText size={16} />
                      <span>{srv.dokumen_persyaratan?.[0]?.count || 0} Dokumen</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-textSecondary">
              Belum ada data persyaratan.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
