'use client';

import { Eyebrow } from '@/components/ui/Eyebrow';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Client-side welcome greeting that reads the logged-in user's name
 * from auth context instead of hardcoding "Anjali".
 */
export function DashboardWelcome() {
  const { user } = useAuth();
  const firstName = user?.first_name || user?.display_name?.split(' ')[0] || 'Learner';
  return <Eyebrow>Welcome back, {firstName}</Eyebrow>;
}
