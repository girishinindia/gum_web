import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { ContactForm } from '@/components/contact/ContactForm';

export default function MobileContactPage() {
  const CHANNELS = [
    { Icon: Mail,          label: 'Email',    value: 'hello@growupmore.com',  href: 'mailto:hello@growupmore.com' },
    { Icon: Phone,         label: 'Call',     value: '+91 90000 00000',       href: 'tel:+919000000000'         },
    { Icon: MessageCircle, label: 'WhatsApp', value: 'Chat (fastest)',        href: '#'                          },
    { Icon: MapPin,        label: 'Office',   value: 'Bengaluru — 560034',     href: '#'                          },
  ];

  return (
    <div>
      <MobilePageHeader title="Contact" subtitle="Reply within 4 working hours" />
      <div className="px-3 pt-2 space-y-3 pb-4">
        {CHANNELS.map((c) => (
          <a key={c.label} href={c.href} className="flex items-center gap-3 rounded-md bg-white border border-slate-200 p-3 shadow-card active:scale-[0.98] transition-all">
            <div className="h-10 w-10 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center"><c.Icon className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500">{c.label}</div>
              <div className="text-[13px] font-semibold text-slate-900 truncate">{c.value}</div>
            </div>
          </a>
        ))}

        <div className="mt-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
