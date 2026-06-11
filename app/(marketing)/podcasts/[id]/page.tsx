import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Headphones, Play, Clock, Calendar, ArrowLeft, Star, Eye, Tag, Youtube, User } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reviews } from '@/components/reviews/Reviews';
import { cn } from '@/lib/cn';
import type { Metadata } from 'next';
import { siteMeta, SITE } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleLd } from '@/lib/jsonld';
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
function toTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = await api.podcastById(id).catch(() => null);
  if (!p) return { title: 'Podcast' };
  return siteMeta({ title: p.title, description: p.short_summary || p.description || 'Listen on Grow Up More.', path: `/podcasts/${id}`, image: p.thumbnail_url, type: 'article' });
}

export default async function PodcastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const podcast = await api.podcastById(id);

  if (!podcast) return notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const px: any = podcast;
  const dt = podcast.published_at ? new Date(podcast.published_at) : null;
  const poster = podcast.users ? `${podcast.users.first_name} ${podcast.users.last_name}`.trim() : '';
  const category = podcast.categories?.name ?? '';
  const subCategory = podcast.sub_categories?.name ?? '';
  const hasThumbnail = !!podcast.thumbnail_url;
  const gradientIdx = (podcast.id ?? 0) % COVER_GRADIENTS.length;
  const durationSec = (podcast as any).duration ?? px.duration_seconds ?? null;
  const youtubeUrl: string | null = px.youtube_url || null;
  const tags = toTags(px.tags);
  const rating = px.rating_average != null ? Number(px.rating_average) : null;
  const shareUrl = `${SITE.url}/podcasts/${id}`;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <section className="pt-10 sm:pt-14 pb-16">
      <JsonLd data={articleLd({ headline: podcast.title, description: podcast.short_summary, url: `/podcasts/${id}`, image: podcast.thumbnail_url, datePublished: podcast.published_at, authorName: poster })} />
      {/* Course-detail frame: max-w-7xl + [content | 380px sticky sidebar] */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/podcasts" className="hover:text-brand-700">Podcasts</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{podcast.title}</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
          {/* ════════ LEFT — episode ════════ */}
          <article className="min-w-0">
            <Eyebrow>
              <span className="inline-flex items-center gap-1.5">
                <Headphones className="h-3 w-3 text-violet-500" />
                {category || 'Podcast'}
                {subCategory ? ` · ${subCategory}` : ''}
                {durationSec ? ` · ${formatDuration(durationSec)}` : ''}
              </span>
            </Eyebrow>

            <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-[1.1] tracking-tight">
              {podcast.episode_number != null && (
                <span className="text-slate-400 font-mono text-lg mr-2">E{podcast.episode_number}</span>
              )}
              {podcast.title}
            </h1>

            {/* Cover / player area */}
            <Reveal>
              <div className="mt-8">
                {hasThumbnail ? (
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-slate-100 shadow-cardHover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={podcast.thumbnail_url!} alt={podcast.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      {youtubeUrl ? (
                        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Play episode" className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                          <Play className="h-7 w-7 text-brand-700 ml-1" />
                        </a>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="h-7 w-7 text-brand-700 ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={cn('relative aspect-[16/9] rounded-lg overflow-hidden shadow-cardHover bg-gradient-to-br', COVER_GRADIENTS[gradientIdx])}>
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_55%)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {youtubeUrl ? (
                        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Play episode" className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:scale-105 transition-transform">
                          <Play className="h-7 w-7 text-white ml-1" />
                        </a>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <Play className="h-7 w-7 text-white ml-1" />
                        </div>
                      )}
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

            {/* Reviews */}
            <div className="mt-12">
              <Reviews itemType="podcast" itemId={podcast.id} noun="podcast" />
            </div>
          </article>

          {/* ════════ RIGHT — sticky sidebar (course-detail pattern) ════════ */}
          <aside className="order-first lg:order-none lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-5">
              {/* Host */}
              <div className="flex items-center gap-3">
                {podcast.users?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={podcast.users.avatar_url} alt={poster} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-500 to-brand-500 text-white text-sm font-bold flex items-center justify-center">
                    {poster ? poster[0].toUpperCase() : 'P'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5 truncate"><User className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {poster || 'Grow Up More'}</div>
                  <div className="text-[11px] text-slate-500">Host</div>
                </div>
              </div>

              {/* Watch CTA */}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors">
                  <Youtube className="h-4 w-4" /> Watch this episode
                </a>
              )}

              {/* Facts */}
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-[12.5px] text-slate-600">
                {dt && <li className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-brand-600" /> {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</li>}
                {durationSec ? <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-brand-600" /> {formatDuration(durationSec)}</li> : null}
                {podcast.episode_number != null && <li className="flex items-center gap-2"><Headphones className="h-3.5 w-3.5 text-brand-600" /> Episode {podcast.episode_number}{podcast.season_number != null ? ` · Season ${podcast.season_number}` : ''}</li>}
                {px.view_count != null && <li className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-brand-600" /> {Number(px.view_count).toLocaleString('en-IN')} views</li>}
                {rating != null && rating > 0 && (
                  <li className="flex items-center gap-2"><Star className="h-3.5 w-3.5 fill-warn text-warn" /> <b className="text-slate-800">{rating.toFixed(1)}</b>{px.rating_count != null ? <span className="text-slate-400">({px.rating_count})</span> : null}</li>
                )}
              </ul>

              {/* Topic chips + tags */}
              {(category || subCategory || tags.length > 0) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1"><Tag className="h-3 w-3" /> Topics</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {category && <span className="rounded-full bg-violet-50 text-violet-700 text-[11.5px] font-semibold px-2.5 py-1">{category}</span>}
                    {subCategory && <span className="rounded-full bg-brand-50 text-brand-700 text-[11.5px] font-semibold px-2.5 py-1">{subCategory}</span>}
                    {tags.map((t) => <span key={t} className="rounded-full bg-slate-100 text-slate-600 text-[11.5px] font-semibold px-2.5 py-1">{t}</span>)}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Share this episode</div>
                <div className="mt-2 flex items-center gap-2">
                  <a href={`https://wa.me/?text=${encodeURIComponent(`${podcast.title} — ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.547 4.098 1.504 5.828L0 24l6.335-1.652A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.894 0-3.686-.508-5.233-1.44l-.375-.223-3.885 1.018 1.036-3.784-.245-.39A9.706 9.706 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75z"/></svg>
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(podcast.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

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
