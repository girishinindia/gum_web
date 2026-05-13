'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { GraduationCap, Menu, X, ArrowRight, UserRound } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { HEADER_LINKS } from '@/lib/homeContent';
import type { Language } from '@/lib/api';
import { cn } from '@/lib/cn';

interface Props {
  languages: Language[];
}

export function HeaderShell({ languages }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out',
        scrolled ? 'glass shadow-glass py-2' : 'bg-transparent py-3',
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Brand — same logo as the existing PHP site (tagline is baked into the SVG itself) */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <span className="h-12 w-12 rounded-md bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center shadow-btn group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6 text-white" />
          </span>
          <Image
            src="/images/GM_Logo_Dark.svg"
            alt="Grow Up More — Don't just learn, apply!"
            width={220}
            height={56}
            priority
            className="h-12 w-auto"
          />
        </Link>

        {/* Center links — desktop */}
        <ul className="hidden lg:flex items-center gap-1">
          {HEADER_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-3 py-2 rounded-sm text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher languages={languages} className="hidden md:flex" />
          <ButtonLink href="/login" variant="primary" size="md" className="hidden sm:inline-flex rounded-full">
            <UserRound className="h-4 w-4" /> Login <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-sm hover:bg-brand-50 text-slate-700"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 mx-3 glass rounded-md p-3 shadow-glass">
          <ul className="flex flex-col gap-1">
            {HEADER_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-sm text-sm font-medium text-slate-800 hover:text-brand-700 hover:bg-brand-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <LanguageSwitcher languages={languages} />
            </li>
            <li className="pt-2">
              <ButtonLink href="/login" variant="primary" size="md" className="w-full">Login</ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
