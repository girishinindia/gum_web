import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Radio, Video, User, ChevronRight, Share2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { api } from '@/lib/api';

export const revalidate = 120;

function personName(u?: { full_name?: string | null; first_name?: string | null; last_name?: string | null } | null) {
  if (!u) return '';
  return u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || '';
}
function formatDate(d?: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(d?: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default async function LiveSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await api.liveSessionById(id);
  if (!session) return notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sx: any = session;
  const host = personName(session.users);
  const status = session.session_status || '';
  const platform = sx.meeting_platform as string | undefined;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const when = session.scheduled_at;
  const isLive = status === 'live';
  const isUpcoming = when ? new Date(when) > new Date() : false;

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/live-sessions" className="hover:text-brand-700">Live Sessions</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{session.title}</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          <div>
            <Eyebrow>
              <span className="inline-flex items-center gap-1.5">
                {isLive ? <><Radio className="h-3 w-3 text-rose-500 animate-pulse" /> LIVE NOW</> : 'LIVE SESSION'}
              </span>
            </Eyebrow>
            <h1 className="mt-3 heading text-4xl sm:text-5xl text-slate-900 leading-[1.05] tracking-tight">{session.title}</h1>
            {session.description && <p className="mt-4 text-slate-600 max-w-2xl">{session.description}</p>}

            <div className="mt-6 aspect-video rounded-md overflow-hidden relative bg-gradient-to-br from-orange-600 via-brand-600 to-rose-500 text-white flex items-center justify-center">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
              <Video className="h-14 w-14 relative opacity-90" />
              {isLive && <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-rose-600"><Radio className="h-3 w-3" /> LIVE</span>}
            </div>

            {host && (
              <div className="mt-8">
                <h2 className="heading text-2xl text-slate-900">Hosted by</h2>
                <div className="mt-4 rounded-md bg-white border border-slate-200 shadow-card p-5 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-xl flex items-center justify-center shrink-0">{host.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                  <div><h3 className="heading text-lg text-slate-900">{host}</h3><p className="text-sm text-slate-600">Session host</p></div>
                </div>
              </div>
            )}
          </div>

          <Reveal>
            <div className="rounded-md bg-white border border-slate-200 shadow-cardHover p-6 lg:sticky lg:top-24 self-start">
              <div className="text-[11px] font-bold uppercase tracking-wider text-success">{isLive ? 'LIVE NOW' : isUpcoming ? 'UPCOMING' : 'SESSION'}</div>
              <div className="heading text-xl text-slate-900 mt-1">{isLive ? 'Join the session' : 'Reserve your seat'}</div>
              <div className="mt-4 space-y-2.5 text-sm">
                {when && <div className="flex items-center gap-2 text-slate-700"><Calendar className="h-4 w-4 text-brand-600" /> {formatDate(when)}</div>}
                {when && <div className="flex items-center gap-2 text-slate-700"><Clock className="h-4 w-4 text-brand-600" /> {formatTime(when)}{session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}</div>}
                {platform && <div className="flex items-center gap-2 text-slate-700 capitalize"><Video className="h-4 w-4 text-brand-600" /> {platform.replace('_', ' ')}</div>}
                {host && <div className="flex items-center gap-2 text-slate-700"><User className="h-4 w-4 text-brand-600" /> {host}</div>}
              </div>
              <div className="mt-5 space-y-2.5">
                <Button variant="primary" className="w-full rounded-full">{isLive ? 'Join now' : 'Register'}</Button>
                <Button variant="outline" className="w-full rounded-full"><Share2 className="h-4 w-4" /> Share</Button>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 text-center">
          <h3 className="heading text-lg text-slate-900">Looking for more?</h3>
          <ButtonLink href="/live-sessions" variant="outline" size="md" className="mt-3 rounded-full">Browse all live sessions</ButtonLink>
        </div>
      </div>
    </section>
  );
}
