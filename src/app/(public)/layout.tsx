"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Informasi Layanan', path: '/informasi' },
    { name: 'Berita & Pengumuman', path: '/berita' },
    { name: 'Kontak', path: '/kontak' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-textPrimary overflow-x-hidden">
      {/* Navbar */}
      <header 
        className={`fixed top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? 'border-b border-border bg-white/70 backdrop-blur-md shadow-sm py-0' 
            : 'bg-white border-transparent py-2'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center">
                <img src="/logo.png" alt="Logo Mempawah" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight text-primary">Portal Bidang C</h1>
                <p className="text-[10px] font-medium tracking-wide text-textSecondary uppercase">Kabupaten Mempawah</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.path ? 'text-primary' : 'text-textSecondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/admin"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105 hover:bg-primary/90"
              >
                Login Admin
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="text-textSecondary md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="border-t border-border bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium ${
                    pathname === link.path ? 'text-primary' : 'text-textSecondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 rounded-md bg-primary py-2 text-center text-sm font-semibold text-white shadow-sm"
              >
                Login Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to push content down because header is now fixed */}
      <div className={isScrolled ? "h-16" : "h-20 transition-all duration-300"} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div className="flex flex-col items-center">
              <h3 className="mb-4 text-lg font-bold">Portal Bidang C</h3>
              <p className="max-w-xs text-sm text-blue-100">
                Sistem Informasi Syarat & Ketentuan Pelayanan Bidang Diklat, Pengembangan Pegawai, dan Disiplin.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="mb-4 text-lg font-bold">Tautan Cepat</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/informasi" className="hover:text-white">Persyaratan Layanan</Link></li>
                <li><Link href="/berita" className="hover:text-white">Berita & Pengumuman</Link></li>
                <li><Link href="/kontak" className="hover:text-white">Hubungi Kami</Link></li>
                <li><Link href="/admin" className="hover:text-white">Portal Admin</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="mb-4 text-lg font-bold">Kontak</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>Kantor BKPSDM Kab. Mempawah</li>
                <li>Telp: (0561) 123456</li>
                <li>Email: bkpsdm@mempawahkab.go.id</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center border-t border-blue-800 pt-8 text-center text-sm text-blue-200">
            <span>&copy; {new Date().getFullYear()} BKPSDM Kabupaten Mempawah. Hak Cipta Dilindungi.</span>
            <span className="mt-1">Developed by Rahmat Raihan B</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
