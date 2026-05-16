'use client';

import { useCallback, useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import {
  updateMyProfile, listCountries, listStates, listCities,
  type UserProfile, type Country, type State, type City,
} from '@/lib/users/client';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FieldError } from '@/components/ui/FieldError';
import { validateMaxLen, validatePostalCode } from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Address card — two stacked forms (Current + Permanent), both writing
 * to `/user-profiles/me`. Country / state / city are cascading
 * `<SearchableSelect>` dropdowns populated from the public lookup
 * endpoints (`/countries`, `/states?country_id=X`, `/cities?state_id=X`).
 *
 * Wire format
 *   • Form state holds FK IDs as strings ("" = nothing selected). This
 *     matches the SearchableSelect contract (which always speaks string).
 *   • Save converts back to `number | null` and posts to the matching
 *     server columns (`current_country_id`, `current_state_id`,
 *     `current_city_id`, etc). Phase28 audit caught that the previous
 *     wiring used text names which the server silently dropped.
 *   • The visible postal-code regex is country-aware — we look up the
 *     selected country's name to decide whether to enforce the Indian
 *     PIN regex.
 *
 * Cascade rules
 *   • Picking a country clears its state + city.
 *   • Picking a state clears its city.
 *   • "Same as current" copies all six IDs verbatim.
 */
export function AddressFields({
  profile, onSaved,
}: { profile: UserProfile | null; onSaved: (next: UserProfile) => void }) {
  // ── Current address state — IDs stored as strings to play nice with
  //    SearchableSelect's value contract. Empty string = nothing chosen.
  const [c1, setC1] = useState(profile?.current_address_line1 ?? '');
  const [c2, setC2] = useState(profile?.current_address_line2 ?? '');
  const [cCountryId, setCCountryId] = useState(profile?.current_country_id ? String(profile.current_country_id) : '');
  const [cStateId,   setCStateId]   = useState(profile?.current_state_id   ? String(profile.current_state_id)   : '');
  const [cCityId,    setCCityId]    = useState(profile?.current_city_id    ? String(profile.current_city_id)    : '');
  const [cZip,       setCZip]       = useState(profile?.current_postal_code ?? '');
  // ── Permanent address state ──────────────────────────────────────────
  const [p1, setP1] = useState(profile?.permanent_address_line1 ?? '');
  const [p2, setP2] = useState(profile?.permanent_address_line2 ?? '');
  const [pCountryId, setPCountryId] = useState(profile?.permanent_country_id ? String(profile.permanent_country_id) : '');
  const [pStateId,   setPStateId]   = useState(profile?.permanent_state_id   ? String(profile.permanent_state_id)   : '');
  const [pCityId,    setPCityId]    = useState(profile?.permanent_city_id    ? String(profile.permanent_city_id)    : '');
  const [pZip,       setPZip]       = useState(profile?.permanent_postal_code ?? '');

  // ── Master country list — loaded once, used by both cascades + PIN
  //    validator (to detect India and apply the Indian PIN regex).
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  // Re-hydrate when the parent reloads the profile (e.g. after save).
  useEffect(() => {
    if (!profile) return;
    setC1(profile.current_address_line1 ?? '');
    setC2(profile.current_address_line2 ?? '');
    setCCountryId(profile.current_country_id ? String(profile.current_country_id) : '');
    setCStateId(profile.current_state_id ? String(profile.current_state_id) : '');
    setCCityId(profile.current_city_id ? String(profile.current_city_id) : '');
    setCZip(profile.current_postal_code ?? '');
    setP1(profile.permanent_address_line1 ?? '');
    setP2(profile.permanent_address_line2 ?? '');
    setPCountryId(profile.permanent_country_id ? String(profile.permanent_country_id) : '');
    setPStateId(profile.permanent_state_id ? String(profile.permanent_state_id) : '');
    setPCityId(profile.permanent_city_id ? String(profile.permanent_city_id) : '');
    setPZip(profile.permanent_postal_code ?? '');
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listCountries();
        if (!cancelled) setCountries(list);
      } catch (e) {
        if (!cancelled) console.error('[AddressFields] listCountries failed', e);
      } finally {
        if (!cancelled) setLoadingCountries(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function sameAsCurrent() {
    setP1(c1); setP2(c2);
    setPCountryId(cCountryId); setPStateId(cStateId); setPCityId(cCityId);
    setPZip(cZip);
  }

  // Look up the selected country's name (for postal-code regex routing).
  const cCountryName = countries.find((c) => String(c.id) === cCountryId)?.name ?? null;
  const pCountryName = countries.find((c) => String(c.id) === pCountryId)?.name ?? null;

  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    const lineCap = (v: string, key: string, label: string) => {
      const r = validateMaxLen(v, 255, label);
      if (!r.ok) errs[key] = r.msg;
    };
    lineCap(c1, 'c1', 'Address line 1');
    lineCap(c2, 'c2', 'Address line 2');
    lineCap(p1, 'p1', 'Address line 1');
    lineCap(p2, 'p2', 'Address line 2');
    const cZipR = validatePostalCode(cZip, cCountryName);
    if (!cZipR.ok) errs.cZip = cZipR.msg;
    const pZipR = validatePostalCode(pZip, pCountryName);
    if (!pZipR.ok) errs.pZip = pZipR.msg;
    return errs;
  }

  function blurValidate() {
    setFieldErrors(runValidation());
  }

  async function save() {
    const errs = runValidation();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const toId = (v: string): number | null => v ? Number(v) : null;
      const next = await updateMyProfile({
        current_address_line1: c1 || null,
        current_address_line2: c2 || null,
        current_city_id:       toId(cCityId),
        current_state_id:      toId(cStateId),
        current_country_id:    toId(cCountryId),
        current_postal_code:   cZip || null,
        permanent_address_line1: p1 || null,
        permanent_address_line2: p2 || null,
        permanent_city_id:     toId(pCityId),
        permanent_state_id:    toId(pStateId),
        permanent_country_id:  toId(pCountryId),
        permanent_postal_code: pZip || null,
      });
      onSaved(next);
      setSaved(true); setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <Alert kind="err">{error}</Alert>}
      {saved && <Alert kind="ok">Address saved.</Alert>}

      <Section title="Current address">
        <Grid>
          <Field label="Address line 1">
            <input
              value={c1}
              onChange={(e) => setC1(e.target.value)}
              onBlur={blurValidate}
              maxLength={255}
              aria-invalid={!!fieldErrors.c1}
              className={cn(inputCls, fieldErrors.c1 && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="Flat / house no, street"
            />
            <FieldError message={fieldErrors.c1} />
          </Field>
          <Field label="Address line 2">
            <input
              value={c2}
              onChange={(e) => setC2(e.target.value)}
              onBlur={blurValidate}
              maxLength={255}
              aria-invalid={!!fieldErrors.c2}
              className={cn(inputCls, fieldErrors.c2 && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder="Area / landmark (optional)"
            />
            <FieldError message={fieldErrors.c2} />
          </Field>

          <CountrySelect
            label="Country"
            countries={countries}
            loading={loadingCountries}
            valueId={cCountryId}
            onChange={(id) => { setCCountryId(id); setCStateId(''); setCCityId(''); }}
          />
          <StateSelect
            label="State"
            countryId={cCountryId}
            valueId={cStateId}
            onChange={(id) => { setCStateId(id); setCCityId(''); }}
          />
          <CitySelect
            label="City"
            stateId={cStateId}
            valueId={cCityId}
            onChange={setCCityId}
          />
          <Field label="Postal code">
            <input
              value={cZip}
              onChange={(e) => setCZip(e.target.value)}
              onBlur={blurValidate}
              maxLength={20}
              aria-invalid={!!fieldErrors.cZip}
              className={cn(inputCls, fieldErrors.cZip && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              inputMode="numeric"
              placeholder={(cCountryName ?? '').toLowerCase() === 'india' ? '6-digit PIN' : 'Postal / ZIP code'}
            />
            <FieldError message={fieldErrors.cZip} />
          </Field>
        </Grid>
      </Section>

      <div className="my-4 flex items-center gap-2">
        <button type="button" onClick={sameAsCurrent} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-[12px] font-semibold">
          <Copy className="h-3.5 w-3.5" /> Same as current address
        </button>
      </div>

      <Section title="Permanent address">
        <Grid>
          <Field label="Address line 1">
            <input
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              onBlur={blurValidate}
              maxLength={255}
              aria-invalid={!!fieldErrors.p1}
              className={cn(inputCls, fieldErrors.p1 && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            />
            <FieldError message={fieldErrors.p1} />
          </Field>
          <Field label="Address line 2">
            <input
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              onBlur={blurValidate}
              maxLength={255}
              aria-invalid={!!fieldErrors.p2}
              className={cn(inputCls, fieldErrors.p2 && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
            />
            <FieldError message={fieldErrors.p2} />
          </Field>

          <CountrySelect
            label="Country"
            countries={countries}
            loading={loadingCountries}
            valueId={pCountryId}
            onChange={(id) => { setPCountryId(id); setPStateId(''); setPCityId(''); }}
          />
          <StateSelect
            label="State"
            countryId={pCountryId}
            valueId={pStateId}
            onChange={(id) => { setPStateId(id); setPCityId(''); }}
          />
          <CitySelect
            label="City"
            stateId={pStateId}
            valueId={pCityId}
            onChange={setPCityId}
          />
          <Field label="Postal code">
            <input
              value={pZip}
              onChange={(e) => setPZip(e.target.value)}
              onBlur={blurValidate}
              maxLength={20}
              aria-invalid={!!fieldErrors.pZip}
              className={cn(inputCls, fieldErrors.pZip && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              inputMode="numeric"
              placeholder={(pCountryName ?? '').toLowerCase() === 'india' ? '6-digit PIN' : 'Postal / ZIP code'}
            />
            <FieldError message={fieldErrors.pZip} />
          </Field>
        </Grid>
      </Section>

      <div className="mt-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[13px] font-bold shadow-btn disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? 'Saved' : 'Save addresses'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Cascade sub-components — every one stores IDs as strings ("" = empty)
// and bubbles `getValue = String(row.id)` up to its `onChange`.
// ─────────────────────────────────────────────────────────────────────

function CountrySelect({
  label, countries, loading, valueId, onChange,
}: {
  label: string;
  countries: Country[];
  loading: boolean;
  valueId: string;
  onChange: (id: string) => void;
}) {
  return (
    <Field label={label}>
      <SearchableSelect<Country>
        value={valueId}
        onChange={onChange}
        options={countries}
        getValue={(c) => String(c.id)}
        getLabel={(c) => c.name}
        getSublabel={(c) => c.iso2 || null}
        placeholder={loading ? 'Loading countries…' : 'Select country'}
        searchPlaceholder="Search countries…"
        disabled={loading}
        loading={loading}
      />
    </Field>
  );
}

function StateSelect({
  label, countryId, valueId, onChange,
}: {
  label: string;
  countryId: string;
  valueId: string;
  onChange: (id: string) => void;
}) {
  const { items, loading } = useChildList<State>(
    useCallback(async () => {
      if (!countryId) return [];
      return listStates(Number(countryId));
    }, [countryId]),
    [countryId],
  );

  const disabled = !countryId;
  const placeholder = disabled
    ? 'Pick a country first'
    : loading
    ? 'Loading states…'
    : items.length === 0
    ? 'No states available'
    : 'Select state';

  return (
    <Field label={label}>
      <SearchableSelect<State>
        value={valueId}
        onChange={onChange}
        options={items}
        getValue={(s) => String(s.id)}
        getLabel={(s) => s.name}
        getSublabel={(s) => s.state_code || null}
        placeholder={placeholder}
        searchPlaceholder="Search states…"
        disabled={disabled || loading}
        loading={loading}
      />
    </Field>
  );
}

function CitySelect({
  label, stateId, valueId, onChange,
}: {
  label: string;
  stateId: string;
  valueId: string;
  onChange: (id: string) => void;
}) {
  const { items, loading } = useChildList<City>(
    useCallback(async () => {
      if (!stateId) return [];
      return listCities(Number(stateId));
    }, [stateId]),
    [stateId],
  );

  const disabled = !stateId;
  const placeholder = disabled
    ? 'Pick a state first'
    : loading
    ? 'Loading cities…'
    : items.length === 0
    ? 'No cities available'
    : 'Select city';

  return (
    <Field label={label}>
      <SearchableSelect<City>
        value={valueId}
        onChange={onChange}
        options={items}
        getValue={(c) => String(c.id)}
        getLabel={(c) => c.name}
        placeholder={placeholder}
        searchPlaceholder={`Search ${items.length} cities…`}
        disabled={disabled || loading}
        loading={loading}
        emptyText="No matching cities"
      />
    </Field>
  );
}

// Shared hook — re-fetches when the deps change. Caches nothing (the
// list endpoints are cheap and the user rarely changes country mid-form).
function useChildList<T>(fetcher: () => Promise<T[]>, deps: unknown[]) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((rows) => { if (!cancelled) setItems(rows); })
      .catch((e) => {
        if (!cancelled) {
          console.error('[AddressFields] cascade fetch failed', e);
          setItems([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { items, loading };
}

// ─────────────────────────────────────────────────────────────────────
// Layout helpers — kept local since AddressFields is the only consumer.
// ─────────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">{title}</div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] font-semibold text-slate-700 mb-1">{label}</div>
      {children}
    </label>
  );
}
function Alert({ kind, children }: { kind: 'ok' | 'err'; children: React.ReactNode }) {
  const cls = kind === 'ok'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-rose-50 border-rose-200 text-rose-700';
  const Icon = kind === 'ok' ? CheckCircle2 : AlertCircle;
  return (
    <div className={cn('mb-3 flex items-start gap-2 rounded-md border px-3 py-2 text-[12.5px]', cls)}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" /> <span>{children}</span>
    </div>
  );
}
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
