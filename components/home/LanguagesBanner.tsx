import { Globe } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { api } from '@/lib/api';

/**
 * Languages banner — strictly API-driven (is_active=true).
 * If the API returns nothing, the banner is not rendered.
 */
export async function LanguagesBanner() {
  const live = await api.languages();
  const items = (live ?? []).slice(0, 14);
  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative rounded-lg p-8 sm:p-10 overflow-hidden bg-gradient-to-br from-brand-500 to-accent text-white shadow-cardHover">
            <div aria-hidden className="glow bg-white/10 w-[300px] h-[300px] -top-20 -right-20" />
            <div className="relative grid sm:grid-cols-[auto_1fr] gap-6 items-center">
              <div>
                <Globe className="h-9 w-9 opacity-90" />
                <h3 className="mt-3 heading text-2xl">Learn in your language</h3>
                <p className="mt-1 text-sm text-white/85 max-w-xs">12+ regional languages — learn IT the way you think.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((l) => (
                  <span key={l.iso_code || l.name} className="glass rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-wide text-white">
                    {l.native_name || l.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
