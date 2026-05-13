import { Camera, Save, Linkedin, Github, Twitter, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

const SECTIONS = [
  { id:'basic',     label:'Basic info' },
  { id:'contact',   label:'Contact' },
  { id:'address',   label:'Address' },
  { id:'education', label:'Education' },
  { id:'experience',label:'Experience' },
  { id:'skills',    label:'Skills' },
  { id:'projects',  label:'Projects' },
  { id:'social',    label:'Social' },
  { id:'languages', label:'Languages' },
  { id:'security',  label:'Security' },
];

export default function ProfilePage() {
  return (
    <div className="max-w-6xl">
      <Eyebrow>Your profile</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Anjali Sharma</h1>

      <div className="mt-6 grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Section nav */}
        <aside className="rounded-md bg-white border border-slate-200 shadow-card p-2 lg:sticky lg:top-24 self-start">
          {SECTIONS.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={`block px-3 py-2 rounded-sm text-sm transition-colors ${i === 0 ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-brand-50/50'}`}>{s.label}</a>
          ))}
        </aside>

        <div className="space-y-5">
          {/* Avatar card */}
          <div className="rounded-md bg-white border border-slate-200 shadow-card p-6 flex items-center gap-5">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-accent text-white heading text-3xl flex items-center justify-center shadow-cardHover">A</div>
              <button aria-label="Change photo" className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-brand-700 hover:bg-brand-50"><Camera className="h-4 w-4" /></button>
            </div>
            <div className="flex-1">
              <h2 className="heading text-xl text-slate-900">Anjali Sharma</h2>
              <p className="text-sm text-slate-500">Data Analyst @ Flipkart · Bengaluru</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-success/10 text-success rounded-full px-2.5 py-1 text-[11px] font-semibold">Profile 92% complete</div>
            </div>
          </div>

          {/* Basic info */}
          <div id="basic" className="rounded-md bg-white border border-slate-200 shadow-card p-6">
            <h2 className="heading text-lg text-slate-900">Basic info</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {['Full name','Headline','Date of birth','Gender','Email','Mobile'].map((f) => (
                <div key={f}>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">{f}</label>
                  <input className="w-full px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder={f} />
                </div>
              ))}
            </div>
            <Button variant="primary" className="mt-5 rounded-full"><Save className="h-4 w-4" /> Save changes</Button>
          </div>

          {/* Social */}
          <div id="social" className="rounded-md bg-white border border-slate-200 shadow-card p-6">
            <h2 className="heading text-lg text-slate-900">Social profiles</h2>
            <div className="mt-4 space-y-2.5">
              {[
                { Icon: Linkedin, label:'LinkedIn',   placeholder:'linkedin.com/in/…' },
                { Icon: Github,   label:'GitHub',     placeholder:'github.com/…' },
                { Icon: Twitter,  label:'X / Twitter', placeholder:'x.com/…' },
                { Icon: Globe,    label:'Portfolio',  placeholder:'yourdomain.com' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><s.Icon className="h-4 w-4" /></div>
                  <input className="flex-1 px-3.5 py-2.5 rounded-sm border border-slate-200 text-sm" placeholder={s.placeholder} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
