import type { Metadata } from 'next';
import { Sora, Outfit, JetBrains_Mono } from 'next/font/google';
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
        {children}
      </body>
    </html>
  );
}
