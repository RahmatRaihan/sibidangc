"use client";
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Users, Scale, Phone, Mail, MapPin, Clock, UserCircle } from 'lucide-react';

const fetchKontak = async () => {
  const { data, error } = await supabase
    .from('kontak')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data;
};

export default function KontakPage() {
  const { data: kontakList = [], isLoading } = useQuery({
    queryKey: ['kontak'],
    queryFn: fetchKontak,
  });

  const getSubbidangConfig = (sub: string) => {
    switch (sub) {
      case 'diklat':
        return { name: 'Bidang Diklat', color: 'bg-primary', icon: <GraduationCap size={28} /> };
      case 'pengembangan_pegawai':
        return { name: 'Pengembangan Pegawai', color: 'bg-secondary', icon: <Users size={28} /> };
      case 'disiplin':
        return { name: 'Disiplin', color: 'bg-accent', icon: <Scale size={28} /> };
      default:
        return { name: sub, color: 'bg-gray-600', icon: <UserCircle size={28} /> };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold text-textPrimary md:text-5xl">Hubungi Kami</h1>
        <p className="mx-auto max-w-2xl text-textSecondary">
          Tim BKPSDM Kabupaten Mempawah siap membantu Anda. Silakan hubungi kontak masing-masing bidang di bawah ini untuk pertanyaan lebih lanjut terkait layanan.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-textSecondary">Memuat data kontak...</div>
      ) : kontakList.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {kontakList.map((kontak: any) => {
            const config = getSubbidangConfig(kontak.subbidang);
            return (
              <motion.div 
                key={kontak.id}
                variants={cardVariants}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg transition-shadow hover:shadow-xl"
              >
                {/* Header Card */}
                <div className={`${config.color} flex items-center gap-3 p-6 text-white`}>
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    {config.icon}
                  </div>
                  <h3 className="text-xl font-bold">{config.name}</h3>
                </div>

                {/* Body Card */}
                <div className="p-6">
                  <div className="mb-6 flex items-start gap-3 border-b border-border pb-4">
                    <UserCircle className="mt-1 shrink-0 text-textSecondary" size={20} />
                    <div>
                      <p className="font-bold text-textPrimary">{kontak.nama_petugas}</p>
                      <p className="text-sm text-textSecondary">{kontak.jabatan || 'Petugas Pelayanan'}</p>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {kontak.no_telepon && (
                      <li className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-primary">
                          <Phone size={16} />
                        </div>
                        <a href={`tel:${kontak.no_telepon}`} className="text-sm font-medium text-textPrimary hover:text-primary hover:underline">
                          {kontak.no_telepon}
                        </a>
                      </li>
                    )}
                    {kontak.email && (
                      <li className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-secondary">
                          <Mail size={16} />
                        </div>
                        <a href={`mailto:${kontak.email}`} className="text-sm font-medium text-textPrimary hover:text-secondary hover:underline">
                          {kontak.email}
                        </a>
                      </li>
                    )}
                    {kontak.lokasi && (
                      <li className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-accent">
                          <MapPin size={16} />
                        </div>
                        <span className="text-sm text-textPrimary">{kontak.lokasi}</span>
                      </li>
                    )}
                    {kontak.jam_kerja && (
                      <li className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <Clock size={16} />
                        </div>
                        <span className="text-sm text-textPrimary">{kontak.jam_kerja}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-slate-50 py-20 text-center text-textSecondary">
          Belum ada data kontak yang tersedia.
        </div>
      )}
    </div>
  );
}
