import Link from 'next/link';
import { Search, MessageCircle, Mail, FileQuestion, BookOpen, CreditCard, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { FAQ } from '@/components/home/FAQ';

const TOPICS = [
  { Icon: BookOpen,    title: 'Courses & Learning',     desc: 'Enrolment, schedules, syllabus, assignments' },
  { Icon: CreditCard,  title: 'Payments & Refunds',     desc: 'Invoices, EMIs, refunds, coupon codes' },
  { Icon: Award,       title: 'Certificates',           desc: 'Issuance, verification, replacements' },
  { Icon: ShieldCheck, title: 'Account & Security',     desc: 'Password, 2FA, account deletion' },
  { Icon: FileQuestion, title: 'Placement Assistance', desc: 'Hiring partners, mock interviews, resume reviews' },
  { Icon: MessageCircle, title: 'Talk to us',           desc: 'WhatsApp, email and call support' },
];

export default function HelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Help Centre"
        title={<>How can we <span className="text-gradient">help you?</span></>}
        subtitle="Search our knowledge base or contact our team — we typically reply within 4 working hours."
      />

      <section className="pb-10">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="glass rounded-full p-1.5 pl-4 flex items-center gap-2 shadow-glass">
              <Search className="h-4 w-4 text-slate-500" />
              <input type="text" placeholder="Search the help centre…" className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400 py-2.5" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map((t, i) => (
              <Reveal key={t.title} delay={(i % 3) * 0.05}>
                <Link href="#" className="group block rounded-md bg-white border border-slate-200 shadow-card p-5 hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-200 transition-all">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><t.Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 heading text-base text-slate-900 group-hover:text-brand-700 transition-colors">{t.title}</h3>
                  <p className="mt-1 text-[12px] text-slate-600">{t.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700">Browse <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" /></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FAQ />

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <h2 className="heading text-2xl sm:text-3xl text-slate-900">Still need help?</h2>
          <p className="mt-2 text-slate-600">Our team replies in under 4 hours, Mon–Sat.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-5 py-2.5 text-sm font-semibold shadow-btn hover:shadow-btnHover hover:-translate-y-0.5 transition-all"><Mail className="h-4 w-4" /> Email us</Link>
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-5 py-2.5 text-sm font-semibold shadow-btn hover:shadow-btnHover hover:-translate-y-0.5 transition-all"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  );
}
