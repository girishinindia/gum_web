import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

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

        <form className="rounded-md bg-white border border-slate-200 p-4 shadow-card space-y-3 mt-2">
          <input className="w-full px-3 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="Your name" />
          <input className="w-full px-3 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="Email" type="email" />
          <textarea rows={4} className="w-full px-3 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder="Message" />
          <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-500 text-white px-5 py-2.5 text-sm font-semibold shadow-btn active:scale-95 transition-all">
            <Send className="h-4 w-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
