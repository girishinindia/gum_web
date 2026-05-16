import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Sora, Outfit, JetBrains_Mono } from 'next/font/google';
import { ViewportRouter } from '@/components/layout/ViewportRouter';
import { AuthProvider } from '@/components/auth/AuthProvider';
import './globals.css';

const sora      = Sora({       subsets: ['latin'], weight: ['300','400','500','600','700','800'], variable: '--font-sora',      display: 'swap' });
const outfit    = Outfit({     subsets: ['latin'], weight: ['300','400','500','600','700','800','900'], variable: '--font-outfit', display: 'swap' });
const jetBrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Grow Up More — Master IT Skills That Matter', template: '%s · Grow Up More' },
  description: "Empowering India's next generation of tech professionals through accessible, multilingual, job-oriented IT education.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  openGraph: {
    title: 'Grow Up More — Master IT Skills That Matter',
    description: 'Multilingual, job-oriented IT courses with placement assistance across 12+ Indian languages.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${outfit.variable} ${jetBrains.variable}`}>
      <body>
        {/* Floating orbs — fixed, behind all content (PHP parity) */}
        <div aria-hidden className="orb orb--1" />
        <div aria-hidden className="orb orb--2" />
        <div aria-hidden className="orb orb--3" />
        {/* Live viewport watcher — hot-swaps between /m and desktop URLs when */}
        {/* the window crosses the lg breakpoint (1024px). Suspense is required */}
        {/* because useSearchParams suspends during render. */}
        <Suspense fallback={null}>
          <ViewportRouter />
        </Suspense>
        {/* Auth context — wraps both the (marketing|auth|app) desktop tree
            and the /m mobile tree so they share a single user session. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
