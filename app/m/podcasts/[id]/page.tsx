import { notFound } from 'next/navigation';
import { Mic, Clock, User, PlayCircle, Share2 } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { MobileDetailBar } from '@/components/mobile/MobileDetailBar';
import { Reviews } from '@/components/reviews/Reviews';
import { api } from '@/lib/api';

export const revalidate = 300;

function personName(u?: { full_name?: string | null; first_name?: string | null; last_name?: string | null } | null) {
  if (!u) return 'Host';
  return u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Host';
}

export default async function MobilePodcastDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pod = await api.podcastById(id);
  if (!pod) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p: any = pod;
  const host = personName(pod.users);
  const mins = p.duration != null ? Math.round(Number(p.duration) / 60) : null;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <MobilePageHeader title={pod.title} subtitle="Podcast" action={<span className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700"><Share2 className="h-4 w-4" /></span>} />

      <div className="px-3">
        <div className="relative aspect-video rounded-md overflow-hidden bg-gradient-to-br from-fuchsia-700 via-brand-600 to-brand-500 flex items-center justify-center">
          {pod.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pod.thumbnail_url} alt={pod.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : <Mic className="h-12 w-12 text-white/80" />}
          <span className="absolute inset-0 flex items-center justify-center"><span className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-cardHover"><PlayCircle className="h-7 w-7 text-fuchsia-700" /></span></span>
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-600">Podcast{pod.episode_number != null ? ` · Ep. ${pod.episode_number}` : ''}</div>
        <h1 className="mt-1 heading text-2xl text-slate-900 leading-tight">{pod.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
          <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {host}</span>
          {mins != null && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {mins} min</span>}
        </div>
        {pod.short_summary && (
          <>
            <h2 className="heading text-[15px] font-bold text-slate-900 mt-5">About this episode</h2>
            <p className="mt-2 text-[12.5px] text-slate-600 leading-relaxed">{pod.short_summary}</p>
          </>
        )}
      </section>

      <section className="px-4 mt-6">
        <Reviews itemType="podcast" itemId={pod.id} basePath="/m" noun="podcast" />
      </section>

      <MobileDetailBar
        cta="Listen"
        CtaIcon={PlayCircle}
        left={
          <div>
            <div className="heading text-[15px] text-slate-900">{pod.episode_number != null ? `Episode ${pod.episode_number}` : 'Episode'}</div>
            <div className="text-[10.5px] text-slate-500">{host}{mins != null ? ` · ${mins} min` : ''}</div>
          </div>
        }
      />
    </div>
  );
}
