import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'white' | 'glass';
type Size    = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-300 ease-out ' +
  'whitespace-nowrap select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-btn hover:shadow-btnHover hover:-translate-y-0.5',
  accent:
    'bg-gradient-to-br from-accent to-accent-light text-white shadow-accent hover:shadow-btnHover hover:-translate-y-0.5',
  outline:
    'bg-white/60 border border-brand-300 text-brand-700 hover:bg-brand-500 hover:text-white hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-brand-700 hover:bg-brand-50',
  white:
    'bg-white text-brand-700 shadow-btn hover:shadow-btnHover hover:-translate-y-0.5',
  glass:
    'glass text-white hover:bg-white/70 hover:text-brand-700 hover:-translate-y-0.5',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

interface CommonProps {
  variant?:  Variant;
  size?:     Size;
  className?: string;
  children:  ReactNode;
}

type ButtonProps = CommonProps & ComponentProps<'button'>;
type LinkProps   = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'children'>;

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', size = 'md', className, children, href, ...rest }: LinkProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}
