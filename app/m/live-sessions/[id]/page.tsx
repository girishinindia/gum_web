import { notFound } from 'next/navigation';
import { Calendar, Clock, Radio, User, Video } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileShareButton } from '@/components/mobile/MobileShareButton';
import { MobileDetailBar } from '@/components/mobile/MobileDetailBar';
import { Reviews } from '@/components/reviews/Reviews';
import { api } from '@/lib/api';

export const revalidate = 120;

function personName(u?: { full_name?: string | null; first_name?: string | null; last_name?: string | null } | null) {
  if (!u) return null;
  return u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || null;
}

export default async function MobileLiveSessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await api.liveSessionById(id);
  if (!s) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sx: any = s;
  const host = personName(s.users);
  const when = s.scheduled_at ? new Date(s.scheduled_at) : null;
  const status = s.session_status;
  const platform = sx.meeting_platform;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const isLive = status === 'live';

  return (
    <div>
      <MobilePageHeader title={s.title} subtitle="Live session" action={<MobileShareButton title={s.title} />} />

      <div className="px-3">
        <div className="relative aspect-video rounded-md overflow-hidden bg-gradient-to-br from-orange-600 via-brand-600 to-rose-500 flex items-center justify-center">
          <Video className="h-12 w-12 text-white/80" />
          {isLive && <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 text-[9.5px] font-bold text-rose-600"><Radio className="h-2.5 w-2.5" /> LIVE</span>}
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Live Session{status ? ` · ${status}` : ''}</div>
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">{s.title}</h1>
        {s.description && <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">{s.description}</p>}

        <div className="mt-4 space-y-2">
          {when && (
            <div className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3 text-[12.5px] text-slate-700">
              <Calendar className="h-4 w-4 text-brand-600" />
              <span className="flex-1">{when.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-500">{when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
          )}
          {s.duration_minutes != null && <div className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3 text-[12.5px] text-slate-700"><Clock className="h-4 w-4 text-brand-600" /> {s.duration_minutes} minutes</div>}
          {host && <div className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3 text-[12.5px] text-slate-700"><User className="h-4 w-4 text-brand-600" /> {host}</div>}
          {platform && <div className="flex items-center gap-2.5 rounded-md bg-white border border-slate-200 p-3 text-[12.5px] text-slate-700 capitalize"><Video className="h-4 w-4 text-brand-600" /> {String(platform).replace('_', ' ')}</div>}
        </div>
      </section>

      <section className="px-4 mt-6">
        <Reviews itemType="live_session" itemId={s.id} basePath="/m" noun="live session" />
      </section>

      <MobileDetailBar
        cta={isLive ? 'Join now' : 'Register'}
        CtaIcon={isLive ? Radio : Calendar}
        left={
          <div>
            <div className="heading text-[15px] text-slate-900">{isLive ? 'Live now' : 'Upcoming'}</div>
            {when && <div className="text-[10.5px] text-slate-500">{when.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>}
          </div>
        }
      />
    </div>
  );
}
