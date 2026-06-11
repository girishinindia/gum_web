'use client';

/**
 * ShareBar (June 2026) — one consistent share row for every detail page.
 * Solid brand-colored buttons with FILLED white logos (proper brand glyphs,
 * not outline icons). Networks: Facebook · X · LinkedIn · WhatsApp · Telegram
 * · Email · Copy link, plus the native device share sheet when available
 * (navigator.share) — which is how Instagram sharing works: Instagram has no
 * public web share URL, so it appears in the system sheet on mobile.
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type IconProps = { className?: string };

// ── Filled brand glyphs (official paths, fill=currentColor → white) ──
const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);
const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const WhatsAppIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const TelegramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const MailIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M1.5 4.5h21A1.5 1.5 0 0124 6v12a1.5 1.5 0 01-1.5 1.5h-21A1.5 1.5 0 010 18V6a1.5 1.5 0 011.5-1.5zm10.5 8.85L22.5 6h-21l10.5 7.35zM12 15.3L1.5 8.1V18h21V8.1L12 15.3z" />
  </svg>
);
const LinkIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M13.06 8.11l1.415 1.415a7 7 0 010 9.9l-.354.353a7 7 0 01-9.9-9.9l1.415 1.415a5 5 0 107.07 7.07l.354-.353a5 5 0 000-7.07l-1.415-1.415 1.415-1.414zm9.193 7.425l-1.414-1.414a5 5 0 10-7.071-7.071l-.354.354a5 5 0 000 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 010-9.9l.354-.353a7 7 0 019.9 9.9z" />
  </svg>
);
const CheckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);
const ShareNodesIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 10-3-3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9a3 3 0 000 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 102.92-2.92z" />
  </svg>
);

interface ShareBarProps {
  /** Path or absolute URL of the page being shared. */
  url: string;
  title: string;
  className?: string;
  /** Optional small heading shown before the icons. */
  label?: string;
}

export function ShareBar({ url, title, className, label = 'Share' }: ShareBarProps) {
  const [abs, setAbs] = useState(url);
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    if (/^https?:\/\//i.test(url)) setAbs(url);
    else setAbs(`${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`);
    setCanNative(typeof navigator !== 'undefined' && !!navigator.share);
  }, [url]);

  const eUrl = encodeURIComponent(abs);
  const eTitle = encodeURIComponent(title);

  // Solid brand buttons — white filled glyphs on the official brand color.
  const networks: { label: string; href: string; Icon: React.ComponentType<IconProps>; bg: string }[] = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${eUrl}`, Icon: FacebookIcon, bg: 'bg-[#1877F2] hover:bg-[#0f6ae0]' },
    { label: 'X (Twitter)', href: `https://twitter.com/intent/tweet?text=${eTitle}&url=${eUrl}`, Icon: XIcon, bg: 'bg-black hover:bg-slate-800' },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${eUrl}`, Icon: LinkedInIcon, bg: 'bg-[#0A66C2] hover:bg-[#0857a6]' },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${abs}`)}`, Icon: WhatsAppIcon, bg: 'bg-[#25D366] hover:bg-[#1fb858]' },
    { label: 'Telegram', href: `https://t.me/share/url?url=${eUrl}&text=${eTitle}`, Icon: TelegramIcon, bg: 'bg-[#229ED9] hover:bg-[#1d8bbf]' },
    { label: 'Email', href: `mailto:?subject=${eTitle}&body=${encodeURIComponent(`${title}\n${abs}`)}`, Icon: MailIcon, bg: 'bg-amber-500 hover:bg-amber-600' },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(abs);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { window.prompt('Copy this link:', abs); }
  };

  const native = async () => {
    try { await navigator.share({ title, url: abs }); } catch { /* user dismissed */ }
  };

  const btn = 'inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md';

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">{label}</span>
      {networks.map((n) => (
        <a
          key={n.label}
          href={n.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${n.label}`}
          title={n.label}
          className={cn(btn, n.bg)}
        >
          <n.Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        title={copied ? 'Copied!' : 'Copy link (paste anywhere — Instagram, SMS…)'}
        className={cn(btn, copied ? 'bg-emerald-500 hover:bg-emerald-500' : 'bg-slate-600 hover:bg-slate-700')}
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-3.5 w-3.5" />}
      </button>
      {canNative && (
        <button
          type="button"
          onClick={native}
          aria-label="More share options (Instagram, etc.)"
          title="More options — Instagram & other installed apps"
          className={cn(btn, 'bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 hover:opacity-90')}
        >
          <ShareNodesIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
