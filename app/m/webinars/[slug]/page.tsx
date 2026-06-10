import { notFound } from 'next/navigation';
import { Calendar, Clock, Radio, User, Share2, Bell } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileDetailBar } from '@/components/mobile/MobileDetailBar';
import { Reviews } from '@/components/reviews/Reviews';
import { api } from '@/lib/api';

export const revalidate = 120;

function personName(u?: { full_name?: string | null; first_name?: string | null; last_name?: string | null } | null) {
  if (!u) return null;
  return u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || null;
}

export default async function MobileWebinarDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // holds the webinar id on mobile
  const webinar = await api.webinarById(slug);
  if (!webinar) notFound();

  const title = webinar.translated_title || webinar.title || 'Webinar';
  const desc = webinar.translated_description || '';
  const host = personName(webinar.users);
  const when = webinar.scheduled_at ? new Date(webinar.scheduled_at) : null;
  const status = webinar.webinar_status;

  return (
    <div>
      <MobilePageHeader title={title} subtitle="Webinar" action={<span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700"><Share2 className="h-4 w-4" /></span>} />

      <div className="px-3">
        <div className="relative aspect-video rounded-md overflow-hidden bg-gradient-to-br from-sky-600 via-brand-600 to-indigo-500 flex items-center justify-center">
          {webinar.translated_thumbnail || webinar.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={webinar.translated_thumbnail || webinar.thumbnail_url!} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          ) : <Radio className="h-12 w-12 text-white/80" />}
          {status === 'live' && <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-rose-600"><Radio className="h-2.5 w-2.5" /> LIVE</span>}
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Webinar{status ? ` · ${status}` : ''}</div>
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">{title}</h1>
        {desc && <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">{desc}</p>}

        <div className="mt-4 space-y-2">
          {when && (
            <div className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3 text-[12.5px] text-slate-700">
              <Calendar className="h-4 w-4 text-brand-600" />
              <span className="flex-1">{when.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-500">{when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          )}
          {webinar.duration_minutes != null && (
            <div className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3 text-[12.5px] text-slate-700"><Clock className="h-4 w-4 text-brand-600" /> {webinar.duration_minutes} minutes</div>
          )}
          {host && (
            <div className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3 text-[12.5px] text-slate-700"><User className="h-4 w-4 text-brand-600" /> Hosted by {host}</div>
          )}
        </div>
      </section>

      <section className="px-4 mt-6">
        <Reviews itemType="webinar" itemId={webinar.id} basePath="/m" noun="webinar" />
      </section>

      <MobileDetailBar
        cta={status === 'live' ? 'Join now' : 'Register'}
        CtaIcon={status === 'live' ? Radio : Bell}
        left={
          <div>
            <div className="heading text-lg text-emerald-600">{webinar.is_free ? 'Free' : 'Register'}</div>
            {when && <div className="text-[10.5px] text-slate-500">{when.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>}
          </div>
        }
      />
    </div>
  );
}
