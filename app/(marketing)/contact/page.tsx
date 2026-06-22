import { Mail, MessageCircle } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Grow Up More team — support, sales, and partnership enquiries.',
  openGraph: { title: 'Contact Grow Up More', description: 'Reach our support, sales, and partnerships team.' },
};

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
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-4">
              {[
                { Icon: Mail,          label: 'Email us', value: 'info@growupmore.com', href: 'mailto:info@growupmore.com' },
                { Icon: MessageCircle, label: 'WhatsApp', value: '+91 9099097255',      href: 'https://wa.me/919099097255' },
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
