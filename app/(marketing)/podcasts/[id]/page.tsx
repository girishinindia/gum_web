import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Headphones, Play, Clock, Calendar, Share2, ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';
import { api } from '@/lib/api';

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

export default async function PodcastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const podcast = await api.podcastById(id);

  if (!podcast) return notFound();

  const dt = podcast.published_at ? new Date(podcast.published_at) : null;
  const poster = podcast.users ? `${podcast.users.first_name} ${podcast.users.last_name}`.trim() : '';
  const category = podcast.categories?.name ?? '';
  const subCategory = podcast.sub_categories?.name ?? '';
  const hasThumbnail = !!podcast.thumbnail_url;
  const gradientIdx = (podcast.id ?? 0) % COVER_GRADIENTS.length;

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/podcasts" className="hover:text-brand-700">Podcasts</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{podcast.title}</span>
        </div>

        <article className="mt-6">
          {/* Eyebrow meta */}
          <Eyebrow>
            <span className="inline-flex items-center gap-1.5">
              <Headphones className="h-3 w-3 text-violet-500" />
              {category || 'Podcast'}
              {subCategory ? ` · ${subCategory}` : ''}
              {podcast.duration ? ` · ${formatDuration(podcast.duration)}` : ''}
            </span>
          </Eyebrow>

          {/* Title */}
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-[1.1] tracking-tight">
            {podcast.episode_number != null && (
              <span className="text-slate-400 font-mono text-lg mr-2">E{podcast.episode_number}</span>
            )}
            {podcast.title}
          </h1>

          {/* Poster & date */}
          <div className="mt-5 flex items-center gap-3">
            {podcast.users?.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={podcast.users.avatar_url} alt={poster} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-brand-500 text-white text-sm font-bold flex items-center justify-center">
                {poster ? poster[0].toUpperCase() : 'P'}
              </div>
            )}
            <div className="flex-1">
              {poster && <div className="text-sm font-semibold text-slate-900">{poster}</div>}
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                {dt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {podcast.duration && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(podcast.duration)}
                  </span>
                )}
              </div>
            </div>
            <button className="h-9 w-9 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 flex items-center justify-center">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Cover / player area */}
          <Reveal>
            <div className="mt-8">
              {hasThumbnail ? (
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 shadow-cardHover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={podcast.thumbnail_url!} alt={podcast.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                      <Play className="h-7 w-7 text-brand-700 ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={cn('relative aspect-[16/9] rounded-lg overflow-hidden shadow-cardHover bg-gradient-to-br', COVER_GRADIENTS[gradientIdx])}>
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                      <Play className="h-7 w-7 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <Headphones className="h-8 w-8 opacity-60" />
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Short summary */}
          {podcast.short_summary && (
            <p className="mt-6 text-lg text-slate-700 font-medium leading-relaxed">
              {podcast.short_summary}
            </p>
          )}

          {/* Full description */}
          {podcast.description && (
            <div className="mt-6 prose prose-slate max-w-none text-[16px] leading-[1.8] text-slate-700">
              <p>{podcast.description}</p>
            </div>
          )}

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {category && (
              <span className="inline-flex items-center bg-violet-50 text-violet-700 rounded-full px-3 py-1 text-xs font-semibold">
                {category}
              </span>
            )}
            {subCategory && (
              <span className="inline-flex items-center bg-brand-50 text-brand-700 rounded-full px-3 py-1 text-xs font-semibold">
                {subCategory}
              </span>
            )}
            {podcast.season_number != null && (
              <span className="inline-flex items-center bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-semibold">
                Season {podcast.season_number}
              </span>
            )}
          </div>
        </article>

        {/* Back to all episodes */}
        <div className="mt-14 text-center">
          <ButtonLink href="/podcasts" variant="outline" size="md" className="rounded-full">
            <ArrowLeft className="h-4 w-4" /> All episodes
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
