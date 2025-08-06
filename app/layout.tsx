import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Political Truth Tracker',
  description: 'Track political promises, electoral bonds, fact-checks, and more',
  keywords: 'politics, promises, electoral bonds, fact-check, transparency',
  authors: [{ name: 'Political Truth Tracker Team' }],
  openGraph: {
    title: 'Political Truth Tracker',
    description: 'Track political promises, electoral bonds, fact-checks, and more',
    type: 'website',
  },
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
