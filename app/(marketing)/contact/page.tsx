import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={<>Got a question? <span className="text-gradient">Reach out.</span></>}
        subtitle="We typically reply within 4 working hours (Mon–Sat, 10am–7pm IST)."
      />

      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_360px] gap-8">
          <Reveal>
            <form className="rounded-md bg-white border border-slate-200 shadow-card p-6 sm:p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Full name</label>
                  <input className="w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" className="w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" placeholder="you@example.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Phone (WhatsApp)</label>
                  <input type="tel" className="w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" placeholder="+91 …" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Topic</label>
                  <select className="w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400">
                    <option>General enquiry</option>
                    <option>Course information</option>
                    <option>Placement assistance</option>
                    <option>Bulk / corporate enrolment</option>
                    <option>Partnership</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">Message</label>
                <textarea rows={6} className="w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400" placeholder="Tell us a bit about what you need…" />
              </div>
              <Button variant="primary" className="rounded-full"><Send className="h-4 w-4" /> Send message</Button>
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-4">
              {[
                { Icon: Mail,          label: 'Email us',      value: 'hello@growupmore.com',  href: 'mailto:hello@growupmore.com' },
                { Icon: Phone,         label: 'Call us',       value: '+91 90000 00000',       href: 'tel:+919000000000' },
                { Icon: MessageCircle, label: 'WhatsApp',      value: 'Chat now (fastest)',    href: '#' },
                { Icon: MapPin,        label: 'Office',        value: '4th floor, Tower B, Bengaluru — 560034', href: '#' },
              ].map((c) => (
                <a key={c.label} href={c.href} className="block rounded-md bg-white border border-slate-200 shadow-card p-4 hover:border-brand-300 hover:shadow-cardHover transition-all">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700"><c.Icon className="h-4 w-4" /></div>
                    <div>
                      <div className="text-[12px] uppercase tracking-wider text-slate-500">{c.label}</div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5">{c.value}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
