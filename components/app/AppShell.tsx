'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Heart, ShoppingCart, Wallet, Bell, MessageSquare,
  LifeBuoy, User, FileText, CreditCard, Search, Menu, X, ChevronDown, LogOut,
  GraduationCap, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem { href: string; label: string; Icon: LucideIcon; badge?: string | number; }

const NAV: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Learn',
    items: [
      { href: '/dashboard',   label: 'Dashboard',     Icon: LayoutDashboard },
      { href: '/my-courses',  label: 'My Courses',    Icon: BookOpen, badge: 3 },
      { href: '/wishlist',    label: 'Wishlist',      Icon: Heart, badge: 5 },
    ],
  },
  {
    heading: 'Money',
    items: [
      { href: '/cart',        label: 'Cart',          Icon: ShoppingCart, badge: 2 },
      { href: '/payments',    label: 'Payments',      Icon: CreditCard },
      { href: '/wallet',      label: 'Wallet',        Icon: Wallet },
    ],
  },
  {
    heading: 'You',
    items: [
      { href: '/notifications', label: 'Notifications', Icon: Bell, badge: 4 },
      { href: '/chat',          label: 'Chat',          Icon: MessageSquare },
      { href: '/profile',       label: 'Profile',       Icon: User },
      { href: '/resume',        label: 'Resume',        Icon: FileText },
      { href: '/support',       label: 'Support',       Icon: LifeBuoy },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = (
    <nav className="flex flex-col h-full">
      <Link href="/" className="flex items-center gap-2 p-4 border-b border-slate-200/70">
        <span className="h-10 w-10 rounded-md bg-gradient-to-br from-brand-500 to-accent flex items-center justify-center shadow-btn">
          <GraduationCap className="h-5 w-5 text-white" />
        </span>
        <Image src="/images/GM_Logo_Dark.svg" alt="Grow Up More" width={170} height={40} className="h-9 w-auto" />
      </Link>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {NAV.map((group) => (
          <div key={group.heading}>
            <div className="px-2 py-1.5 text-[10.5px] uppercase tracking-[0.12em] font-bold text-slate-400">{group.heading}</div>
            <ul className="space-y-0.5">
              {group.items.map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href + '/');
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-700 hover:bg-brand-50/50 hover:text-brand-700',
                      )}
                    >
                      <it.Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge != null && (
                        <span className={cn(
                          'rounded-full text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center',
                          active ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600',
                        )}>{it.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-200/70">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200/70 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div aria-hidden className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col shadow-2xl">{SidebarContent}</aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200/70">
          <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-brand-50 text-slate-700">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search your courses, threads, certificates…" />
                <kbd className="hidden sm:inline-flex font-mono text-[10px] bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-500">Ctrl K</kbd>
              </div>
            </div>
            <button className="relative h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-brand-50 text-slate-700">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-brand-50 cursor-pointer transition-colors">
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white text-[11px] font-bold flex items-center justify-center">A</span>
              <span className="text-sm font-semibold text-slate-800 hidden sm:inline">Anjali</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
