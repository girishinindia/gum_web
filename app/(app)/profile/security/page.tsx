'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Phone, Shield } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ChangePasswordCard } from '@/components/auth/sections/ChangePasswordCard';
import { ChangeEmailCard }    from '@/components/auth/sections/ChangeEmailCard';
import { ChangeMobileCard }   from '@/components/auth/sections/ChangeMobileCard';
import { cn } from '@/lib/cn';

type Tab = 'password' | 'email' | 'mobile';

/**
 * Authenticated security center — one page with three independent flows
 * picked via a side-rail tab strip. Each tab card owns its own state +
 * dual/single OTP machinery.
 *
 * The initial tab is driven by `?tab=password|email|mobile` so the
 * UserMenu can deep-link to each flow individually (Reset Password /
 * Change Email / Change Mobile menu items). Clicking a tab also pushes
 * a new history entry so the browser back button restores the previous
 * flow rather than leaving the security page entirely.
 */
export default function SecurityPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
        <SecurityInner />
      </Suspense>
    </RequireAuth>
  );
}

function SecurityInner() {
  const params = useSearchParams();
  const router = useRouter();

  function tabFromParam(): Tab {
    const raw = params?.get('tab');
    return raw === 'email' || raw === 'mobile' ? raw : 'password';
  }

  const [tab, setTab] = useState<Tab>(tabFromParam());

  // Sync state ← URL when the user navigates via menu links (or back/forward).
  useEffect(() => {
    setTab(tabFromParam());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function selectTab(next: Tab) {
    setTab(next);
    // Push (not replace) so the back button restores the prior tab.
    router.push(`/profile/security?tab=${next}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10">
      <header className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
          <Shield className="h-3.5 w-3.5" /> Security
        </div>
        <h1 className="mt-2 heading text-3xl text-slate-900">Account security</h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-xl">
          Change your password, switch to a new email, or update your mobile number. Every change requires OTP verification and signs you out of all other sessions.
        </p>
      </header>

      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        <aside>
          <nav className="flex md:flex-col gap-1 bg-white border border-slate-200 rounded-md p-1.5 shadow-card">
            <TabButton active={tab === 'password'} onClick={() => selectTab('password')} icon={<Lock className="h-4 w-4" />} label="Password" />
            <TabButton active={tab === 'email'}    onClick={() => selectTab('email')}    icon={<Mail className="h-4 w-4" />} label="Email" />
            <TabButton active={tab === 'mobile'}   onClick={() => selectTab('mobile')}   icon={<Phone className="h-4 w-4" />} label="Mobile" />
          </nav>
        </aside>

        <section>
          {tab === 'password' && <ChangePasswordCard />}
          {tab === 'email'    && <ChangeEmailCard />}
          {tab === 'mobile'   && <ChangeMobileCard />}
        </section>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 md:flex-none flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-medium transition-colors text-left',
        active ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50',
      )}
    >
      <span className={active ? 'text-brand-700' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  );
}
