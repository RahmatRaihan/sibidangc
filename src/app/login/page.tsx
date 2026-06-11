"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  if (user) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setUser(data.user);

      toast.success('Login berhasil!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans text-textPrimary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="bg-primary p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white p-2">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold">Portal Admin</h2>
          <p className="mt-2 text-sm text-blue-100">Portal Bidang C Kabupaten Mempawah</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-textSecondary" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textSecondary">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-slate-50 p-3 pl-10 text-textPrimary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="admin@mempawahkab.go.id"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-textSecondary" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textSecondary">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-border bg-slate-50 p-3 pl-10 text-textPrimary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-70"
            >
              {isSubmitting ? 'Memproses...' : <><LogIn size={20} /> Masuk ke Dashboard</>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-textSecondary">
            Kembali ke <a href="/" className="font-semibold text-primary hover:underline">Halaman Publik</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
