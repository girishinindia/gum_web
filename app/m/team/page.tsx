import { Linkedin } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';
import { api } from '@/lib/api';

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

export default async function MobileTeamPage() {
  const members = ((await api.team()) || []).sort((a, b) =>
    a.section === b.section
      ? a.display_order - b.display_order
      : (a.section === 'leadership' ? -1 : 1)
  );
  return (
    <div>
      <MobilePageHeader title="Team" subtitle="People behind the platform" />
      {members.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">Team details coming soon.</div>
      ) : (
        <div className="px-3 pt-2 grid grid-cols-2 gap-3 pb-4">
          {members.map((m, i) => (
            <div key={m.id} className="rounded-md bg-white border border-slate-200 shadow-card p-3 text-center">
              {m.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={m.image_url} alt={m.name} className="mx-auto h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${ACCENTS[i % ACCENTS.length]} text-white heading text-xl flex items-center justify-center`}>{initials(m.name)}</div>
              )}
              <h3 className="mt-2 heading text-[13px] font-bold text-slate-900">{m.name}</h3>
              {m.role && <p className="text-[10.5px] text-brand-700 font-semibold">{m.role}</p>}
              {m.linkedin_url && (
                <div className="mt-2 flex justify-center">
                  <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><Linkedin className="h-3.5 w-3.5" /></a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
