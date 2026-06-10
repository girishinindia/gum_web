/**
 * Self-serve referral client over /my/referral (auth required, scoped to the
 * caller). Import only from "use client" components.
 */
import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

export interface MyReferral {
  id: number;
  referral_code: string;
  discount_percentage?: number | null;
  referrer_reward_type?: string | null;
  referrer_reward_percentage?: number | null;
  referrer_reward_amount?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
  stats: { total_referrals: number; successful_referrals: number; total_earnings: number };
}

export interface ReferralUsage {
  id: number;
  referred_user_id: number;
  referred_user_name: string;
  usage_status: string;
  discount_applied?: number | null;
  order_amount?: number | null;
  converted_at?: string | null;
  created_at?: string | null;
}

export interface ReferralReward {
  id: number;
  reward_type: string;
  reward_amount: number;
  status: string;
  credited_at?: string | null;
  created_at?: string | null;
}

async function authed<T>(path: string): Promise<T> {
  const tok = getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    cache: 'no-store',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) throw new Error(json?.error || `Request failed (${res.status})`);
  return (json?.data ?? json) as T;
}

export const fetchMyReferral = () => authed<MyReferral>('/my/referral');
export const fetchMyReferralUsages = () => authed<ReferralUsage[]>('/my/referral/usages');
export const fetchMyReferralRewards = () => authed<ReferralReward[]>('/my/referral/rewards');
