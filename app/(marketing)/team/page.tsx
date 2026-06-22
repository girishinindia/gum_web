import { Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { api, type TeamMember } from '@/lib/api';

export const metadata = {
  title: 'Our Team',
  description: 'Meet the team behind Grow Up More — the developers, designers, and engineers building the platform.',
};

export const revalidate = 300;

const ACCENTS = [
  'from-brand-500 to-brand-700',
  'from-rose-500 to-amber-500',
  'from-emerald-500 to-brand-500',
  'from-violet-500 to-brand-500',
  'from-sky-500 to-indigo-500',
  'from-amber-500 to-orange-600',
];

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function Socials({ m }: { m: TeamMember }) {
  const links = [
    { url: m.linkedin_url, Icon: Linkedin },
    { url: m.twitter_url, Icon: Twitter },
    { url: m.instagram_url, Icon: Instagram },
    { url: m.facebook_url, Icon: Facebook },
  ].filter((l) => l.url);
  if (links.length === 0) return null;
  return (
    <div className="mt-3 flex items-center justify-center gap-1.5">
      {links.map(({ url, Icon }, i) => (
        <a key={i} href={url as string} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 flex items-center justify-center transition-colors">
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}

function LeadCard({ m, index }: { m: TeamMember; index: number }) {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card p-6 text-center hover:-translate-y-1 hover:shadow-cardHover transition-all">
      {m.image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={m.image_url} alt={m.name} className="mx-auto h-24 w-24 rounded-full object-cover shadow-btn" />
      ) : (
        <div className={`mx-auto h-24 w-24 rounded-full bg-gradient-to-br ${ACCENTS[index % ACCENTS.length]} text-white heading text-3xl flex items-center justify-center shadow-btn`}>{initials(m.name)}</div>
      )}
      <h3 className="mt-4 heading text-base text-slate-900">{m.name}</h3>
      {m.role && <p className="text-[12px] text-brand-700 font-semibold mt-0.5">{m.role}</p>}
      {m.bio && <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">{m.bio}</p>}
      <Socials m={m} />
    </div>
  );
}

function TeamCard({ m, index }: { m: TeamMember; index: number }) {
  return (
    <div className="rounded-md bg-white border border-slate-200 shadow-card p-4 text-center">
      {m.image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={m.image_url} alt={m.name} className="mx-auto h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${ACCENTS[index % ACCENTS.length]} text-white heading text-xl flex items-center justify-center`}>{initials(m.name)}</div>
      )}
      <h4 className="mt-2 text-xs font-semibold text-slate-900 leading-tight">{m.name}</h4>
      {m.role && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{m.role}</p>}
    </div>
  );
}

export default async function TeamPage() {
  const members = (await api.team()) || [];
  const leadership = members.filter((m) => m.section === 'leadership');
  const team = members.filter((m) => m.section !== 'leadership');

  return (
    <>
      <PageHero
        eyebrow="The Team"
        title={<>People behind the <span className="text-gradient">platform</span></>}
        subtitle="A small, opinionated team of developers, designers and engineers building the platform."
      />

      {leadership.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <Eyebrow>Leadership</Eyebrow>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
              {leadership.map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 0.06}>
                  <LeadCard m={m} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <Eyebrow>Mentors &amp; Operations</Eyebrow>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {team.map((m, i) => (
                <Reveal key={m.id} delay={(i % 6) * 0.04}>
                  <TeamCard m={m} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
