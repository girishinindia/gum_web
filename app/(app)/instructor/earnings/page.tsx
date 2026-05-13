import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

const BY_COURSE = [
  { name:'AI & ML Pro',           students:8420, gross:33000000, share:70, payout:1854000 },
  { name:'Generative AI Builder', students:4210, gross:18000000, share:70, payout:1009800 },
  { name:'ML System Design',      students:2120, gross:7500000,  share:70, payout: 420750 },
  { name:'Data Foundations',      students:9762, gross:24000000, share:65, payout:1252600 },
];

export default function EarningsPage() {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Eyebrow>Earnings</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">FY 2026–27</h1>
        </div>
        <Button variant="outline" className="rounded-full"><Download className="h-4 w-4" /> TDS statement</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:'Gross sales',     value:'₹82.5L' },
          { label:'Your share',      value:'₹54.5L' },
          { label:'TDS deducted',    value:'₹54,500' },
          { label:'Net payable',     value:'₹53.9L' },
        ].map((s) => (
          <div key={s.label} className="rounded-md bg-white border border-slate-200 shadow-card p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
            <div className="mt-1 heading text-2xl text-gradient">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-200">
          <h2 className="heading text-lg text-slate-900">By course</h2>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left px-5 py-3">Course</th>
              <th className="text-right px-5 py-3">Students</th>
              <th className="text-right px-5 py-3">Gross</th>
              <th className="text-right px-5 py-3">Share</th>
              <th className="text-right px-5 py-3">Your payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {BY_COURSE.map((c) => (
              <tr key={c.name} className="hover:bg-brand-50/20">
                <td className="px-5 py-3 font-semibold text-slate-900">{c.name}</td>
                <td className="px-5 py-3 text-right text-slate-700">{c.students.toLocaleString('en-IN')}</td>
                <td className="px-5 py-3 text-right text-slate-700">₹{(c.gross / 100000).toFixed(1)}L</td>
                <td className="px-5 py-3 text-right text-slate-500">{c.share}%</td>
                <td className="px-5 py-3 text-right heading text-slate-900">₹{(c.payout / 100000).toFixed(1)}L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
