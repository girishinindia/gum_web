import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Inline error message rendered directly under a form field. One
 * primitive for every profile form so the colour, spacing, icon and
 * a11y plumbing stay identical everywhere.
 *
 * Usage:
 *   <input
 *     aria-invalid={!!errors.email}
 *     aria-describedby={errors.email ? 'email-error' : undefined}
 *     …
 *   />
 *   <FieldError id="email-error" message={errors.email} />
 *
 * When `message` is empty / undefined the component renders nothing
 * (so callers can pass it unconditionally without an extra ternary).
 */
export function FieldError({
  id, message, className,
}: {
  id?: string;
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      className={cn(
        'mt-1 flex items-start gap-1 text-[11px] leading-snug text-rose-600',
        className,
      )}
    >
      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
