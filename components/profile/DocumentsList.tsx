'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Trash2, Pencil, Save, Loader2, AlertCircle, X, FileText, ExternalLink,
  Clock, CheckCircle2, XCircle, FileSearch, RefreshCw,
} from 'lucide-react';
import {
  addDocument, updateDocument, deleteDocument,
  listDocumentTypes, listMasterDocuments,
  type UserDocument, type DocumentType, type MasterDocument,
  type DocumentVerificationStatus,
} from '@/lib/users/client';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FieldError } from '@/components/ui/FieldError';
import {
  validateRequired, validateDocumentNumber, validateDate,
  validateDateRange, validateFile,
} from '@/lib/auth/validation';
import { cn } from '@/lib/cn';

/**
 * Documents list + inline expander form.
 *
 * Shape per row (self-service writable fields):
 *   document_type_id, document_number, file (multipart upload),
 *   issue_date, expiry_date
 *
 * Server-only (admin-managed, displayed read-only):
 *   verification_status, rejection_reason, admin_notes, verified_at
 *
 * The file accepts both images (server pipelines them through Bunny as
 * webp) and PDFs (stored raw). Verification status renders as a coloured
 * badge so the user can see when admin action is pending or complete.
 */

export function DocumentsList({
  rows, onAdded, onUpdated, onRemoved,
}: {
  rows:      UserDocument[];
  onAdded:   (row: UserDocument) => void;
  onUpdated: (row: UserDocument) => void;
  onRemoved: (id: number) => void;
}) {
  const [mode, setMode] = useState<{ kind: 'idle' } | { kind: 'add' } | { kind: 'edit'; row: UserDocument }>({ kind: 'idle' });
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listDocumentTypes()
      .then((rs) => { if (!cancelled) setTypes(rs); })
      .catch((e) => { if (!cancelled) console.error('[DocumentsList] listDocumentTypes', e); })
      .finally(() => { if (!cancelled) setLoadingTypes(false); });
    return () => { cancelled = true; };
  }, []);

  const typeById = useMemo(() => {
    const m = new Map<number, DocumentType>();
    for (const t of types) m.set(t.id, t);
    return m;
  }, [types]);

  async function handleSave(
    payload: Parameters<typeof addDocument>[0],
    file: File | null,
    editingId: number | null,
  ) {
    setError(null);
    try {
      if (editingId == null) {
        const created = await addDocument(payload, file);
        onAdded(created);
      } else {
        const updated = await updateDocument(editingId, payload, file);
        onUpdated(updated);
      }
      setMode({ kind: 'idle' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteDocument(id);
      onRemoved(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove.');
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {rows.length === 0 && mode.kind === 'idle' && (
        <div className="text-sm text-slate-500 mb-3">No documents uploaded yet. Click <b>Add</b> to start.</div>
      )}

      <ul className="space-y-2">
        {rows.map((r) => {
          const typeName = r.document_type?.name
            || (r.document_type_id ? typeById.get(r.document_type_id)?.name : null)
            || `Type #${r.document_type_id}`;
          // The specific document name (e.g. "Aadhaar Card") is the
          // primary headline; the type ("Identity") becomes a sub-label.
          const docName = r.document?.name ?? null;
          const editing = mode.kind === 'edit' && mode.row.id === r.id;
          return (
            <li key={r.id} className="rounded-md border border-slate-200 bg-slate-50/60">
              <div className="flex items-start gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {docName ?? typeName}
                    </div>
                    {docName && (
                      <span className="text-[11px] text-slate-500 truncate">· {typeName}</span>
                    )}
                    <VerificationBadge status={r.verification_status} />
                  </div>
                  <div className="text-[12.5px] text-slate-600 truncate mt-0.5">
                    {r.document_number ? `No. ${r.document_number}` : 'No reference number'}
                    {r.issue_date ? ` · issued ${formatDate(r.issue_date)}` : ''}
                    {r.expiry_date ? ` · expires ${formatDate(r.expiry_date)}` : ''}
                  </div>
                  {r.file && (
                    <a href={r.file} target="_blank" rel="noreferrer noopener"
                       className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-brand-700 hover:underline">
                      <ExternalLink className="h-3 w-3" /> View file
                    </a>
                  )}
                  {r.rejection_reason && (
                    <div className="mt-1 text-[11.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-1 inline-block">
                      Reason: {r.rejection_reason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setMode(editing ? { kind: 'idle' } : { kind: 'edit', row: r })}
                    className="text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-md p-1.5"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => r.id && void handleDelete(r.id)}
                    className="text-rose-500 hover:bg-rose-50 rounded-md p-1.5"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {editing && (
                <div className="border-t border-slate-200 bg-white p-3 rounded-b-md">
                  <DocumentForm
                    initial={mode.row}
                    types={types}
                    loadingTypes={loadingTypes}
                    onCancel={() => setMode({ kind: 'idle' })}
                    onSave={(payload, file) => handleSave(payload, file, mode.row.id ?? null)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3">
        {mode.kind === 'add' ? (
          <div className="rounded-md border border-brand-200 bg-brand-50/40 p-3">
            <DocumentForm
              initial={null}
              types={types}
              loadingTypes={loadingTypes}
              onCancel={() => setMode({ kind: 'idle' })}
              onSave={(payload, file) => handleSave(payload, file, null)}
            />
          </div>
        ) : mode.kind === 'idle' && (
          <button
            type="button"
            onClick={() => setMode({ kind: 'add' })}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[12.5px] font-bold shadow-btn"
          >
            <Plus className="h-3.5 w-3.5" /> Add document
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DocumentForm

function DocumentForm({
  initial, types, loadingTypes, onCancel, onSave,
}: {
  initial: UserDocument | null;
  types: DocumentType[];
  loadingTypes: boolean;
  onCancel: () => void;
  onSave: (
    payload: Parameters<typeof addDocument>[0],
    file: File | null,
  ) => Promise<void>;
}) {
  const [docTypeId,  setDocTypeId]  = useState<string>(initial?.document_type_id ? String(initial.document_type_id) : '');
  const [docId,      setDocId]      = useState<string>(initial?.document_id ? String(initial.document_id) : '');
  const [docNumber,  setDocNumber]  = useState(initial?.document_number ?? '');
  const [issueDate,  setIssueDate]  = useState(initial?.issue_date ?? '');
  const [expiryDate, setExpiryDate] = useState(initial?.expiry_date ?? '');
  const [file,       setFile]       = useState<File | null>(null);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  // ── Master documents cascade — load specific documents for the
  //    selected type. Re-runs whenever docTypeId changes.
  const fetcher = useCallback(async () => {
    if (!docTypeId) return [];
    return listMasterDocuments(Number(docTypeId));
  }, [docTypeId]);
  const [docs, setDocs] = useState<MasterDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!docTypeId) { setDocs([]); return; }
    setLoadingDocs(true);
    fetcher()
      .then((rs) => { if (!cancelled) setDocs(rs); })
      .catch((e) => {
        if (!cancelled) { console.error('[DocumentForm] listMasterDocuments', e); setDocs([]); }
      })
      .finally(() => { if (!cancelled) setLoadingDocs(false); });
    return () => { cancelled = true; };
  }, [fetcher, docTypeId]);

  // Resolve the selected master document name so we can route the
  // document_number validation (PAN regex / Aadhaar 12-digit / etc).
  const selectedDocName = useMemo(
    () => docs.find((d) => String(d.id) === docId)?.name ?? null,
    [docs, docId],
  );

  function runValidation(): Record<string, string | undefined> {
    const errs: Record<string, string | undefined> = {};
    const t = validateRequired(docTypeId, 'Document type');
    if (!t.ok) errs.docTypeId = t.msg;
    const d = validateRequired(docId, 'Document');
    if (!d.ok) errs.docId = d.msg;
    const dn = validateDocumentNumber(docNumber, selectedDocName);
    if (!dn.ok) errs.docNumber = dn.msg;
    const isd = validateDate(issueDate, { label: 'Issue date', notFuture: true });
    if (!isd.ok) errs.issueDate = isd.msg;
    // Expiry can be in the future (most documents) but not before issue.
    const exd = validateDate(expiryDate, { label: 'Expiry date' });
    if (!exd.ok) errs.expiryDate = exd.msg;
    if (issueDate && expiryDate) {
      const range = validateDateRange(issueDate, expiryDate, { startLabel: 'Issue date', endLabel: 'Expiry date' });
      if (!range.ok) errs.expiryDate = range.msg;
    }
    const f = validateFile(file, { maxMB: 10, accept: ['image/', 'application/pdf'] });
    if (!f.ok) errs.file = f.msg;
    // Create-only: require a file.
    if (initial == null && !file) errs.file = errs.file ?? 'Please attach a file (image or PDF).';
    return errs;
  }

  function blurValidate() {
    setFieldErrors(runValidation());
  }

  async function commit() {
    const errs = runValidation();
    setFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setError(null);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSave({
        document_type_id: Number(docTypeId),
        document_id:      Number(docId),
        document_number:  docNumber || null,
        issue_date:       issueDate || null,
        expiry_date:      expiryDate || null,
      }, file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-[12.5px] text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <Group title="Identity">
        <Grid>
          <Field label="Document type" required>
            <SearchableSelect<DocumentType>
              value={docTypeId}
              onChange={(v) => { setDocTypeId(v); setDocId(''); setFieldErrors((p) => ({ ...p, docTypeId: undefined, docId: undefined, docNumber: undefined })); }}
              options={types}
              getValue={(t) => String(t.id)}
              getLabel={(t) => t.name}
              placeholder={loadingTypes ? 'Loading…' : 'Select type (e.g. Identity, Address)'}
              searchPlaceholder="Search document types…"
              disabled={loadingTypes}
              loading={loadingTypes}
            />
            <FieldError message={fieldErrors.docTypeId} />
          </Field>
          <Field label="Document" required>
            <SearchableSelect<MasterDocument>
              value={docId}
              onChange={(v) => { setDocId(v); setFieldErrors((p) => ({ ...p, docId: undefined, docNumber: undefined })); }}
              options={docs}
              getValue={(d) => String(d.id)}
              getLabel={(d) => d.name}
              placeholder={
                !docTypeId
                  ? 'Pick a type first'
                  : loadingDocs
                  ? 'Loading documents…'
                  : docs.length === 0
                  ? 'No documents in this type'
                  : 'Select document (e.g. Aadhaar, PAN)'
              }
              searchPlaceholder="Search documents…"
              disabled={!docTypeId || loadingDocs}
              loading={loadingDocs}
              emptyText="No matching documents"
            />
            <FieldError message={fieldErrors.docId} />
          </Field>
          <Field label="Document number">
            <input
              className={cn(inputCls, fieldErrors.docNumber && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              placeholder={
                selectedDocName?.toLowerCase().includes('aadhaar') ? '12 digits, e.g. 1234 5678 9012'
                : selectedDocName?.toLowerCase().includes('pan') ? 'e.g. ABCDE1234F'
                : selectedDocName?.toLowerCase().includes('passport') ? 'e.g. A1234567'
                : 'Reference number'
              }
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              onBlur={blurValidate}
              maxLength={200}
              aria-invalid={!!fieldErrors.docNumber}
            />
            <FieldError message={fieldErrors.docNumber} />
          </Field>
        </Grid>
      </Group>

      <Group title="Validity">
        <Grid>
          <Field label="Issue date">
            <input
              type="date"
              className={cn(inputCls, fieldErrors.issueDate && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              value={issueDate ?? ''}
              onChange={(e) => setIssueDate(e.target.value)}
              onBlur={blurValidate}
              max={new Date().toISOString().slice(0, 10)}
              aria-invalid={!!fieldErrors.issueDate}
            />
            <FieldError message={fieldErrors.issueDate} />
          </Field>
          <Field label="Expiry date">
            <input
              type="date"
              className={cn(inputCls, fieldErrors.expiryDate && 'border-rose-300 focus:ring-rose-200 focus:border-rose-400')}
              value={expiryDate ?? ''}
              onChange={(e) => setExpiryDate(e.target.value)}
              onBlur={blurValidate}
              min={issueDate || undefined}
              aria-invalid={!!fieldErrors.expiryDate}
            />
            <FieldError message={fieldErrors.expiryDate} />
          </Field>
        </Grid>
      </Group>

      <Group title={initial ? 'Replace file (optional)' : 'File'}>
        <FileField file={file} existingUrl={initial?.file ?? null} onFile={(f) => { setFile(f); setFieldErrors((p) => ({ ...p, file: undefined })); }} />
        <FieldError message={fieldErrors.file} />
      </Group>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-full"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void commit()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white px-4 py-2 text-[12.5px] font-bold shadow-btn disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {initial ? 'Save changes' : 'Upload document'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Bits

function VerificationBadge({ status }: { status?: DocumentVerificationStatus }) {
  const s = status ?? 'pending';
  const map: Record<DocumentVerificationStatus, { label: string; cls: string; Icon: typeof Clock }> = {
    pending:      { label: 'Pending',      cls: 'bg-slate-100 text-slate-700 border-slate-200',    Icon: Clock },
    under_review: { label: 'Under review', cls: 'bg-sky-50 text-sky-700 border-sky-200',           Icon: FileSearch },
    verified:     { label: 'Verified',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    rejected:     { label: 'Rejected',     cls: 'bg-rose-50 text-rose-700 border-rose-200',        Icon: XCircle },
    expired:      { label: 'Expired',      cls: 'bg-amber-50 text-amber-700 border-amber-200',     Icon: Clock },
    reupload:     { label: 'Re-upload',    cls: 'bg-purple-50 text-purple-700 border-purple-200',  Icon: RefreshCw },
  };
  const m = map[s];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-bold', m.cls)}>
      <m.Icon className="h-2.5 w-2.5" /> {m.label}
    </span>
  );
}

function FileField({
  file, existingUrl, onFile,
}: {
  file: File | null;
  existingUrl: string | null;
  onFile: (f: File | null) => void;
}) {
  const showExisting = !!existingUrl && !file;
  return (
    <div>
      {showExisting && (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12.5px]">
          <FileText className="h-3.5 w-3.5 text-slate-500" />
          <a href={existingUrl} target="_blank" rel="noreferrer noopener" className="flex-1 text-brand-700 hover:underline truncate">
            View current file
          </a>
        </div>
      )}
      {file ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="flex-1 text-emerald-700 truncate">{file.name}</span>
          <button type="button" onClick={() => onFile(null)} className="text-rose-500 hover:bg-rose-100 rounded-md p-1" aria-label="Remove">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-200 hover:border-brand-300 bg-white px-3 py-4 text-[12.5px] text-slate-500 cursor-pointer">
          <FileText className="h-4 w-4 text-slate-400" />
          {showExisting ? 'Replace with a new file (image or PDF)' : 'Click to attach file (image or PDF)'}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
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
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11.5px] font-semibold text-slate-700 mb-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </div>
      {children}
    </label>
  );
}
function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(m[3], 10)} ${months[parseInt(m[2], 10) - 1]} ${m[1]}`;
}
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 placeholder:text-slate-400';
