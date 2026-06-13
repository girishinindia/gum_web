'use client';

/**
 * Instructor bank accounts (June 2026). Was a static mockup — now live on the
 * existing self-scoped API: GET /bank-accounts/me, POST /bank-accounts,
 * PATCH /bank-accounts/:id/primary, DELETE /bank-accounts/:id.
 */

import { useCallback, useEffect, useState } from 'react';
import { Plus, ShieldCheck, AlertCircle, Building2, Trash2, Star } from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchMyBankAccounts, createBankAccount, setPrimaryBankAccount, deleteBankAccount, type MyBankAccount } from '@/lib/commerce';

const inputClass = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400';

export default function BankAccountsPage() {
  const { signedIn } = useAuth();
  const [accounts, setAccounts] = useState<MyBankAccount[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bank, setBank] = useState('');
  const [branch, setBranch] = useState('');
  const [type, setType] = useState<'savings' | 'current'>('savings');

  const load = useCallback(() => {
    fetchMyBankAccounts().then(setAccounts).catch(() => setAccounts([]));
  }, []);
  useEffect(() => { if (signedIn) load(); }, [signedIn, load]);

  async function add() {
    if (!holder.trim() || !number.trim() || !ifsc.trim()) { setMsg({ ok: false, text: 'Holder name, account number and IFSC are required.' }); return; }
    setBusy(true); setMsg(null);
    try {
      await createBankAccount({
        account_holder_name: holder.trim(),
        account_number: number.trim(),
        ifsc_code: ifsc.trim().toUpperCase(),
        bank_name: bank.trim() || null,
        branch_name: branch.trim() || null,
        account_type: type,
        is_primary: (accounts?.length ?? 0) === 0,
      } as Partial<MyBankAccount>);
      setMsg({ ok: true, text: 'Bank account added.' });
      setHolder(''); setNumber(''); setIfsc(''); setBank(''); setBranch('');
      setFormOpen(false);
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not add the account.' });
    }
    setBusy(false);
  }

  async function makePrimary(id: number) {
    try { await setPrimaryBankAccount(id); load(); } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }); }
  }
  async function remove(id: number) {
    try { await deleteBankAccount(id); load(); } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed' }); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Eyebrow>Bank accounts</Eyebrow>
          <h1 className="mt-3 heading text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight">Bank accounts</h1>
          <p className="mt-1 text-sm text-slate-500">Payouts are settled to your primary account.</p>
        </div>
        <button onClick={() => setFormOpen(v => !v)} className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> {formOpen ? 'Close' : 'Add account'}
        </button>
      </div>

      {msg && <p className={`mt-3 text-[12.5px] ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>}

      {formOpen && (
        <div className="mt-5 rounded-md bg-white border border-slate-200 shadow-card p-5">
          <h2 className="heading text-lg text-slate-900">New bank account</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <input value={holder} onChange={e => setHolder(e.target.value)} placeholder="Account holder name *" className={inputClass} />
            <input value={number} onChange={e => setNumber(e.target.value.replace(/\D/g, ''))} placeholder="Account number *" className={inputClass} />
            <input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="IFSC code * (e.g. HDFC0001234)" className={inputClass} />
            <select value={type} onChange={e => setType(e.target.value as 'savings' | 'current')} className={inputClass}>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
            </select>
            <input value={bank} onChange={e => setBank(e.target.value)} placeholder="Bank name" className={inputClass} />
            <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Branch" className={inputClass} />
          </div>
          <button onClick={add} disabled={busy} className="mt-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save account'}</button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {accounts == null ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-md bg-white border border-slate-200 animate-pulse" />)
        ) : accounts.length === 0 ? (
          <div className="rounded-md bg-white border border-slate-200 p-10 text-center">
            <Building2 className="h-8 w-8 mx-auto text-slate-300" />
            <p className="mt-3 heading text-lg text-slate-800">No bank accounts yet</p>
            <p className="mt-1 text-sm text-slate-500">Add one to receive payouts.</p>
          </div>
        ) : (
          accounts.map((a) => (
            <div key={a.id} className={cn('rounded-md bg-white border shadow-card p-4 flex items-center gap-4', a.is_primary ? 'border-brand-300 ring-1 ring-brand-100' : 'border-slate-200')}>
              <div className="h-11 w-11 rounded-md bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 flex items-center justify-center shrink-0"><Building2 className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {a.bank_name || 'Bank account'} ····{String(a.account_number || '').slice(-4)}
                  {a.is_primary && <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-brand-600 text-white text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5"><Star className="h-2.5 w-2.5" /> Primary</span>}
                </div>
                <div className="text-[11.5px] text-slate-500">{a.account_holder_name} · {a.ifsc_code}{a.branch_name ? ` · ${a.branch_name}` : ''} · {a.account_type || 'savings'}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {a.is_verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600"><AlertCircle className="h-3.5 w-3.5" /> Unverified</span>
                )}
                {!a.is_primary && (
                  <button onClick={() => makePrimary(a.id)} className="rounded-full border border-slate-200 hover:border-brand-300 text-slate-600 text-[11.5px] font-semibold px-3 py-1.5 transition-colors">Make primary</button>
                )}
                <button onClick={() => remove(a.id)} aria-label="Delete account" className="h-8 w-8 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
