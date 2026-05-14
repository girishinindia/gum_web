import Link from 'next/link';
import { Heart, ShoppingCart, BookOpen, X } from 'lucide-react';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const ITEMS = [
  { id:1, slug:'cyber-security-101',    name:'Cyber Security Fundamentals', price:24999, cover:'from-violet-700 to-brand-500' },
  { id:2, slug:'ml-system-design',      name:'ML System Design',            price:29999, cover:'from-emerald-700 to-brand-500' },
  { id:3, slug:'flutter-mobile-dev',    name:'Flutter Mobile Development',  price:19999, cover:'from-amber-600 to-rose-500' },
];

export default function MobileWishlistPage() {
  if (ITEMS.length === 0) {
    return (
      <div>
        <MobilePageHeader title="Wishlist" />
        <div className="px-6 mt-12 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
            <Heart className="h-10 w-10" />
          </div>
          <h2 className="mt-4 heading text-lg text-slate-900">Save courses for later</h2>
          <p className="mt-1 text-[12.5px] text-slate-500">Tap the heart on any course to save it here.</p>
          <Link href="/m/courses" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white px-5 py-2.5 text-sm font-semibold active:scale-95 transition-all">
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MobilePageHeader title="Wishlist" subtitle={`${ITEMS.length} saved`} />
      <ul className="px-3 pt-2 space-y-3 pb-4">
        {ITEMS.map((c) => (
          <li key={c.id}>
            <div className="flex gap-3 p-3 rounded-md bg-white border border-slate-200 shadow-card">
              <Link href={`/m/courses/${c.slug}`} className={`relative h-20 w-20 rounded-md bg-gradient-to-br ${c.cover} shrink-0 flex items-center justify-center text-white`}>
                <BookOpen className="h-6 w-6 opacity-90" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/m/courses/${c.slug}`}>
                  <h3 className="heading text-[13.5px] text-slate-900 line-clamp-2 leading-tight">{c.name}</h3>
                </Link>
                <div className="mt-1 heading text-sm text-slate-900">₹{c.price.toLocaleString('en-IN')}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button className="inline-flex items-center gap-1 rounded-full bg-brand-500 text-white text-[11px] font-semibold px-3 py-1 active:scale-95 transition-all">
                    <ShoppingCart className="h-3 w-3" /> Add
                  </button>
                  <button aria-label="Remove" className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-all">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
