import Link from 'next/link';
import { Headphones, Play, Clock, Calendar, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';
import { api } from '@/lib/api';
import type { Podcast } from '@/lib/api';

export const revalidate = 300;

const COVER_GRADIENTS = [
  'from-brand-600 to-violet-500',
  'from-rose-600 to-amber-500',
  'from-emerald-600 to-brand-500',
  'from-violet-600 to-rose-500',
];

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export default async function PodcastsPage() {
  const podcasts = await api.podcastsList({ limit: 20 });

  return (
    <>
      <PageHero
        eyebrow="Podcasts"
        title={<>Listen &amp; learn <span className="text-gradient">on the go</span></>}
        subtitle="Bite-sized episodes on careers, tech trends and behind-the-scenes from our instructors."
      />

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {(!podcasts || podcasts.length === 0) ? (
            <Reveal>
              <div className="text-center py-16">
                <Headphones className="h-12 w-12 text-slate-300 mx-auto" />
                <h2 className="mt-4 heading text-xl text-slate-600">No episodes yet</h2>
                <p className="mt-2 text-sm text-slate-500">Check back soon — new episodes drop regularly.</p>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {podcasts.map((p: Podcast, i: number) => {
                const dt = p.published_at ? new Date(p.published_at) : null;
                const hasThumbnail = !!p.thumbnail_url;
                const poster = p.users ? `${p.users.first_name} ${p.users.last_name}`.trim() : '';
                const category = p.categories?.name ?? '';

                return (
                  <Reveal key={p.id} delay={(i % 4) * 0.06}>
                    <Link
                      href={`/podcasts/${p.id}`}
                      className="group block rounded-md bg-white border border-slate-200 shadow-card overflow-hidden hover:-translate-y-1 hover:shadow-cardHover transition-all"
                    >
                      {hasThumbnail ? (
                        <div className="relative aspect-[16/10] bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.thumbnail_url!} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <Play className="h-5 w-5 text-brand-700 ml-0.5" />
                            </div>
                          </div>
                          {category && (
                            <div className="absolute top-3 left-3 inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-violet-700 shadow-sm uppercase tracking-wider">
                              {category}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={cn('relative aspect-[16/10] bg-gradient-to-br', COVER_GRADIENTS[i % COVER_GRADIENTS.length])}>
                          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                              <Play className="h-5 w-5 text-white ml-0.5" />
                            </div>
                          </div>
                          {category && (
                            <div className="absolute top-3 left-3 inline-flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10.5px] font-bold text-violet-700 shadow-sm uppercase tracking-wider">
                              {category}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4">
                        {p.episode_number != null && (
                          <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                            Episode {p.episode_number}
                          </div>
                        )}
                        <h3 className="heading text-[15px] font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors min-h-[40px]">
                          {p.title}
                        </h3>
                        {p.short_summary && (
                          <p className="mt-1.5 text-[12px] text-slate-500 line-clamp-2">{p.short_summary}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between text-[11.5px] text-slate-500 pt-3 border-t border-slate-100">
                          {poster && <span className="truncate max-w-[60%]">{poster}</span>}
                          <span className="inline-flex items-center gap-1">
                            {p.duration ? (
                              <><Clock className="h-3 w-3" /> {formatDuration(p.duration)}</>
                            ) : dt ? (
                              <><Calendar className="h-3 w-3" /> {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</>
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
