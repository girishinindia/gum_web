'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Phone, ChevronLeft } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ChangePasswordCard } from '@/components/auth/sections/ChangePasswordCard';
import { ChangeEmailCard }    from '@/components/auth/sections/ChangeEmailCard';
import { ChangeMobileCard }   from '@/components/auth/sections/ChangeMobileCard';
import { cn } from '@/lib/cn';

type Tab = 'password' | 'email' | 'mobile';

export default function MobileSecurityPage() {
  return (
    <RequireAuth loginPath="/m/login">
      <Suspense fallback={<div className="p-4 text-sm text-slate-500">Loading…</div>}>
        <Inner />
      </Suspense>
    </RequireAuth>
  );
}

function Inner() {
  // Initial tab from `?tab=password|email|mobile` so the user menu can
  // deep-link to each flow individually. Same wiring as desktop.
  const params = useSearchParams();
  const router = useRouter();
  function tabFromParam(): Tab {
    const raw = params?.get('tab');
    return raw === 'email' || raw === 'mobile' ? raw : 'password';
  }
  const [tab, setTab] = useState<Tab>(tabFromParam());
  useEffect(() => {
    setTab(tabFromParam());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  function selectTab(next: Tab) {
    setTab(next);
    router.push(`/m/profile/security?tab=${next}`);
  }

  return (
    <div className="px-3 pb-6">
      <div className="flex items-center gap-2 py-3">
        <Link href="/m/profile" className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 active:scale-95">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <div className="heading text-base font-bold text-slate-900">Security</div>
          <div className="text-[11.5px] text-slate-500">Password · Email · Mobile</div>
        </div>
      </div>

      <nav className="flex gap-1 bg-white border border-slate-200 rounded-md p-1 mt-2 mb-3 shadow-card">
        <TabBtn active={tab === 'password'} onClick={() => selectTab('password')} icon={<Lock  className="h-3.5 w-3.5" />} label="Password" />
        <TabBtn active={tab === 'email'}    onClick={() => selectTab('email')}    icon={<Mail  className="h-3.5 w-3.5" />} label="Email" />
        <TabBtn active={tab === 'mobile'}   onClick={() => selectTab('mobile')}   icon={<Phone className="h-3.5 w-3.5" />} label="Mobile" />
      </nav>

      {tab === 'password' && <ChangePasswordCard />}
      {tab === 'email'    && <ChangeEmailCard />}
      {tab === 'mobile'   && <ChangeMobileCard />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-[12.5px] font-semibold transition-colors',
        active ? 'bg-brand-50 text-brand-700' : 'text-slate-700 active:bg-slate-50',
      )}
    >
      <span className={active ? 'text-brand-700' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  );
}
