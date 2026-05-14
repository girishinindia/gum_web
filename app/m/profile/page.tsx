import Link from 'next/link';
import {
  BookOpen, ShoppingCart, Wallet, Bell, MessageSquare, FileText, LifeBuoy, LogIn, ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const SIGNED_IN = false; // Stub — wire to real auth later

const ROWS: { Icon: LucideIcon; label: string; href: string; badge?: number }[] = [
  { Icon: BookOpen,      label: 'My Courses',   href: '/my-courses',   badge: 3 },
  { Icon: ShoppingCart,  label: 'Cart',         href: '/cart',         badge: 2 },
  { Icon: Wallet,        label: 'Wallet',       href: '/wallet'                  },
  { Icon: Bell,          label: 'Notifications',href: '/m/notifications', badge: 4 },
  { Icon: MessageSquare, label: 'Chat',         href: '/chat'                    },
  { Icon: FileText,      label: 'Resume',       href: '/resume'                  },
  { Icon: LifeBuoy,      label: 'Support',      href: '/m/help'                  },
];

export default function MobileProfilePage() {
  if (!SIGNED_IN) {
    return (
      <div>
        <MobilePageHeader title="Profile" />
        <div className="px-4 mt-6">
          <div className="rounded-md bg-gradient-to-br from-brand-500 via-brand-600 to-accent text-white p-6 text-center shadow-cardHover">
            <div className="mx-auto h-16 w-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center heading text-2xl">👋</div>
            <h2 className="mt-3 heading text-xl">Sign in to continue</h2>
            <p className="mt-1 text-[13px] opacity-90">Track your courses, wishlist and certificates in one place.</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-brand-700 px-5 py-2.5 text-sm font-bold active:scale-95 transition-all">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 text-white px-5 py-2.5 text-sm font-bold active:scale-95 transition-all">
                Create account
              </Link>
            </div>
          </div>

          <div className="mt-6 text-[12.5px] text-slate-500 text-center">
            Browse without signing in — your wishlist will be saved when you do.
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view (stub — wired when auth lands)
  return (
    <div>
      <MobilePageHeader title="Profile" />
      <div className="px-3 pt-3">
        <div className="rounded-md bg-white border border-slate-200 p-4 flex items-center gap-3 shadow-card">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-xl flex items-center justify-center">A</div>
          <div className="flex-1 min-w-0">
            <div className="heading text-base text-slate-900">Anjali Sharma</div>
            <div className="text-[11.5px] text-slate-500">anjali@example.com</div>
            <div className="inline-flex items-center gap-1 mt-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-bold">Profile 92%</div>
          </div>
        </div>

        <ul className="mt-4 rounded-md bg-white border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
          {ROWS.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="flex items-center gap-3 p-3.5 active:bg-brand-50/40">
                <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center"><r.Icon className="h-4 w-4" /></div>
                <span className="flex-1 text-[13.5px] font-medium text-slate-800">{r.label}</span>
                {r.badge != null && r.badge > 0 && (
                  <span className="rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5">{r.badge}</span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
