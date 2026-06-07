import { Heart, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';

const ITEMS = [
  { id:1, name:'Cyber Security Fundamentals', price:24999, cover:'from-violet-700 to-brand-500' },
  { id:2, name:'ML System Design',            price:29999, cover:'from-emerald-700 to-brand-500' },
  { id:3, name:'Flutter Mobile Development',  price:19999, cover:'from-amber-600 to-rose-500' },
];

export default function WishlistPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <Eyebrow>Saved for later</Eyebrow>
      <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Wishlist</h1>
      <p className="mt-1 text-sm text-slate-500">{ITEMS.length} courses you bookmarked.</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ITEMS.map((c) => (
          <div key={c.id} className="rounded-md bg-white border border-slate-200 shadow-card overflow-hidden">
            <div className={`relative aspect-[16/10] bg-gradient-to-br ${c.cover}`}>
              <button aria-label="Remove" className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur text-slate-600 hover:text-rose-600 flex items-center justify-center shadow"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4">
              <h3 className="heading text-base text-slate-900">{c.name}</h3>
              <div className="mt-2 heading text-lg text-slate-900">₹{c.price.toLocaleString('en-IN')}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="primary" size="sm" className="rounded-full"><ShoppingCart className="h-3.5 w-3.5" /> Add to cart</Button>
                <Button variant="outline" size="sm" className="rounded-full"><Heart className="h-3.5 w-3.5" /> Saved</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
