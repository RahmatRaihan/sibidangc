"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Files, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  Image as ImageIcon,
  MessageSquare,
  Contact
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center text-textSecondary">Memuat sesi pengguna...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Manajemen Layanan', path: '/admin/layanan', icon: <Files size={20} /> },
    { name: 'Manajemen Banner', path: '/admin/banners', icon: <ImageIcon size={20} /> },
    { name: 'Informasi/Berita', path: '/admin/informasi', icon: <MessageSquare size={20} /> },
    { name: 'Pengaturan Kontak', path: '/admin/kontak', icon: <Contact size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-textPrimary">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-white transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-white shadow-md">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-contain p-1" />
            </div>
            <span className="text-lg font-bold text-primary">Admin Panel</span>
          </Link>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} className="text-textSecondary" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-primary' 
                      : 'text-textSecondary hover:bg-slate-100 hover:text-textPrimary'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4">
            <div className="mb-4 flex items-center gap-3 px-3">
              <UserCircle size={32} className="text-slate-400" />
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="truncate text-xs text-textSecondary">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 md:px-8">
          <button 
            className="rounded-md p-2 text-textSecondary hover:bg-slate-100 md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <a href="/" target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
              Lihat Web Publik &rarr;
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
