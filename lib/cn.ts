import clsx, { type ClassValue } from 'clsx';

/**
 * Tailwind-friendly `className` joiner.
 * Forwards directly to clsx; alias here so the codebase reads `cn(...)`.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
