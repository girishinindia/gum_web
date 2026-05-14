import Link from 'next/link';
import { Search, BookOpen, CreditCard, Award, ShieldCheck, FileQuestion, MessageCircle, Mail, ChevronRight, type LucideIcon } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const TOPICS: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: BookOpen,     title: 'Courses & Learning',   desc: 'Enrolment, schedules, syllabus' },
  { Icon: CreditCard,   title: 'Payments & Refunds',   desc: 'Invoices, EMIs, coupon codes'  },
  { Icon: Award,        title: 'Certificates',         desc: 'Issuance, verification'        },
  { Icon: ShieldCheck,  title: 'Account & Security',   desc: 'Password, 2FA, delete'         },
  { Icon: FileQuestion, title: 'Placement Assistance', desc: 'Hiring partners, mock interviews' },
];

export default function MobileHelpPage() {
  return (
    <div>
      <MobilePageHeader title="Help Centre" subtitle="We reply in under 4 hours" />

      <div className="px-3">
        <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search articles…" />
        </div>
      </div>

      <ul className="mt-4 px-3 space-y-2">
        {TOPICS.map((t) => (
          <li key={t.title}>
            <Link href="#" className="flex items-center gap-3 rounded-md bg-white border border-slate-200 p-3 shadow-card active:scale-[0.98] transition-all">
              <div className="h-10 w-10 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center"><t.Icon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-900">{t.title}</div>
                <div className="text-[10.5px] text-slate-500">{t.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-3 mt-5 pb-4 grid grid-cols-2 gap-2">
        <a href="#" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 text-white px-3 py-2.5 text-[12.5px] font-bold shadow-btn active:scale-95 transition-all">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
        <Link href="/m/contact" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-500 text-white px-3 py-2.5 text-[12.5px] font-bold shadow-btn active:scale-95 transition-all">
          <Mail className="h-3.5 w-3.5" /> Email
        </Link>
      </div>
    </div>
  );
}
