/**
 * Role-gated section metadata shared between the desktop profile page
 * (`app/(app)/profile/page.tsx`) and the mobile profile editor
 * (`app/m/profile/edit/page.tsx`).
 *
 * The two surfaces render the same set of sections in the same order;
 * only the layout differs (grid + left rail on desktop, stacked cards
 * on mobile). Keeping this logic in one place means a future change
 * — say, splitting "Address" into "Current" + "Permanent" — lands on
 * both screens in one edit.
 */

import {
  GraduationCap, Briefcase, Sparkles, Languages, FolderGit2,
  Link as LinkIcon, FileBadge, Award, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface SectionMeta {
  id:     string;
  label:  string;
  icon:   LucideIcon;
  tinted?: boolean; // mark instructor / admin-only sections visually
}

/**
 * Build the visible section list from the user's `max_role_level`.
 * Tier reminder (from sql/01_rbac.sql):
 *   guest 0 · student 20 · moderator 40 · faculty 60 · admin 80 · super 100
 *
 * Admin gets a trimmed-down set — they don't curate a learner profile
 * the same way; what they need is basic identity + the admin console.
 * Instructors get the full student set plus Experience / Projects /
 * Instructor-bio / KYC / Documents (KYC + Bank are required for them
 * to receive payouts).
 */
export function buildSectionList(roleLevel: number): SectionMeta[] {
  const isInstructor = roleLevel >= 60;
  const isAdmin      = roleLevel >= 80;

  if (isAdmin) {
    return [
      { id: 'basic',    label: 'Basic info', icon: Sparkles },
      { id: 'contact',  label: 'Contact',    icon: LinkIcon },
      { id: 'address',  label: 'Address',    icon: LinkIcon },
      { id: 'security', label: 'Security',   icon: ShieldCheck },
    ];
  }

  // Base set every learner sees. Profile-v4 expanded the base set to
  // include Experience, Projects, and Documents — these are useful for
  // students too (internships, portfolio projects, ID uploads), not
  // just instructors. Only Instructor-bio and KYC+Bank stay locked to
  // the instructor tier because they're payout-side concerns.
  const base: SectionMeta[] = [
    { id: 'basic',      label: 'Basic info',  icon: Sparkles },
    { id: 'contact',    label: 'Contact',     icon: LinkIcon },
    { id: 'address',    label: 'Address',     icon: LinkIcon },
    { id: 'education',  label: 'Education',   icon: GraduationCap },
    { id: 'experience', label: 'Experience',  icon: Briefcase },
    { id: 'projects',   label: 'Projects',    icon: FolderGit2 },
    { id: 'skills',     label: 'Skills',      icon: Award },
    { id: 'languages',  label: 'Languages',   icon: Languages },
    { id: 'social',     label: 'Social',      icon: LinkIcon },
    { id: 'documents',  label: 'Documents',   icon: FileBadge },
    { id: 'badges',     label: 'Badges',      icon: Award },
    { id: 'security',   label: 'Security',    icon: ShieldCheck },
  ];

  if (isInstructor) {
    // Insert Instructor bio + KYC + Bank between Documents and Badges.
    // Both are tinted so the instructor-only sections read distinctly.
    return [
      ...base.slice(0, 10), // basic … documents
      { id: 'instructor', label: 'Instructor bio', icon: GraduationCap, tinted: true },
      { id: 'kyc',        label: 'KYC + Bank',     icon: FileBadge,     tinted: true },
      base[10],  // badges
      base[11],  // security stays last
    ];
  }

  return base;
}

/** Human label for the role chip displayed near the user's name. */
export function roleLabel(level: number): string {
  if (level >= 100) return 'Super admin';
  if (level >=  80) return 'Admin';
  if (level >=  60) return 'Instructor';
  if (level >=  40) return 'Moderator';
  if (level >=  20) return 'Student';
  return 'Guest';
}

/**
 * Which section IDs have full editors implemented today.
 * `security` always stubs locally — the real editor lives at
 * `/profile/security`. Everything else has a real editor as of
 * profile-v4 (Education + Documents full schema forms).
 */
export function hasFullEditor(id: string): boolean {
  return [
    'basic',
    'contact',
    'address',
    'education',
    'experience',
    'skills',
    'languages',
    'projects',
    'social',
    'badges',
    'instructor',
    'kyc',
    'documents',
  ].includes(id);
}
