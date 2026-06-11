import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Portal Bidang C BKPSDM Kab Mempawah',
  description: 'Sistem Informasi Layanan Kepegawaian BKPSDM Kabupaten Mempawah',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-textPrimary" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1e293b',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              fontWeight: '500',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
