import { cn } from '@/lib/cn';

/**
 * Section "eyebrow" — small uppercase blue label with a dash line on the left.
 * Matches the existing growupmore.com style: "— BROWSE CATEGORIES"
 */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-brand-600 uppercase', className)}>
      <span aria-hidden className="h-px w-6 bg-brand-500" />
      {children}
    </span>
  );
}
