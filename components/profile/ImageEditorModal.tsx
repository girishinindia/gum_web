'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * Profile-image editor modal.
 *
 * Wraps `react-filerobot-image-editor` (Scaleflex) — a full Photoshop-lite
 * editor with native UI for:
 *   • Crop  (with locked 1:1 aspect ratio for avatars)
 *   • Rotate / flip horizontal / flip vertical
 *   • Resize the final output
 *   • Finetune  (brightness, contrast, hue, saturation, value, warmth, blur)
 *   • Filters   (Instagram-style presets — Vintage, Lomo, Mono, etc.)
 *
 * Why dynamic import: the editor pulls in Konva + canvas helpers (~250 KB
 * gzipped). Loading it lazily means it doesn't bloat the initial profile
 * page bundle — it only downloads when the user actually clicks
 * "change photo". The Suspense fallback shows a small spinner.
 *
 * Why this is a separate component: both `IdentityCard` (desktop) and
 * `IdentityStrip` (mobile) need the same flow, and `ProfilePage` for
 * future use cases (cover image, document scan crop, etc).
 *
 * Lifecycle:
 *   parent → opens modal with `file`
 *   user   → edits + clicks "Save" in the editor toolbar
 *   editor → onSave callback fires with `{ imageBase64, fullName, mimeType }`
 *   modal  → converts back to File and calls `onEditComplete(editedFile)`
 *   parent → closes modal + uploads the file
 *
 * If the user closes without saving, `onClose()` fires with no file.
 */

// `react-filerobot-image-editor` uses `window` and `document` extensively,
// so it cannot be SSR'd. `dynamic` with `ssr: false` keeps it client-only.
const FilerobotImageEditor = dynamic(
  () => import('react-filerobot-image-editor').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading editor…
      </div>
    ),
  },
);

// Note: the package exports `TABS` and `TOOLS` as runtime objects too, but
// we type-only import to avoid pulling them into the initial bundle.
type SavedImageData = {
  imageBase64?: string;
  fullName?: string;
  mimeType?: string;
  extension?: string;
};

export interface ImageEditorModalProps {
  /** Source file the user just picked. Required — modal can't open without one. */
  file: File | null;
  /** Called when the user saves the edited image. Always JPEG with locked square aspect. */
  onEditComplete: (editedFile: File) => void;
  /** Close without saving. */
  onClose: () => void;
  /**
   * Aspect ratio to lock the crop to. Default `1` (square) is right for
   * avatars. Pass `null` to leave free-form, or another ratio for covers.
   */
  aspectRatio?: number | null;
  /** Optional title shown in the modal header. */
  title?: string;
}

export function ImageEditorModal({
  file,
  onEditComplete,
  onClose,
  aspectRatio = 1,
  title = 'Edit photo',
}: ImageEditorModalProps) {
  const [src, setSrc] = useState<string | null>(null);

  // Convert the picked File → ObjectURL the editor can consume. Revoked on
  // unmount so we don't leak memory across opens.
  useEffect(() => {
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ESC to dismiss — standard modal expectation.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!file || !src) return null;

  /**
   * Filerobot's save callback. The library returns a base64 dataURL; we
   * convert it back to a real File so the existing
   * `updateMyProfileWithImages` upload path keeps working unchanged.
   */
  function handleSave(saved: SavedImageData) {
    if (!saved.imageBase64) { onClose(); return; }
    const [header, b64] = saved.imageBase64.split(',');
    const mimeMatch = /:(.*?);/.exec(header || '');
    const mime = saved.mimeType ?? mimeMatch?.[1] ?? 'image/jpeg';
    const binary = atob(b64 || '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Use the original picked name's stem so the server log shows a
    // meaningful filename; force .jpg extension since we always export
    // JPEG (smaller file, no transparency needed for avatars).
    const baseName = (saved.fullName ?? file!.name).replace(/\.[^.]+$/, '');
    const ext = saved.extension ?? 'jpg';
    const editedFile = new File([bytes], `${baseName}.${ext}`, { type: mime });
    onEditComplete(editedFile);
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full h-full max-w-6xl max-h-[92vh] bg-white rounded-md shadow-cardHover overflow-hidden flex flex-col">
        {/* Header — title + close. The editor's own toolbar has Save/Cancel
            inside, so we only need the close affordance for users who
            opened the modal by mistake. */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
          <h2 className="heading text-base text-slate-900 flex-1 truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Editor body — flex-1 so it fills the modal height. The library
            renders its full toolbar (Finetune, Filters, Resize, Adjust,
            Watermark, Annotate) and its own Save button along the top. */}
        <div className="flex-1 min-h-0">
          <FilerobotImageEditor
            source={src}
            onSave={handleSave as never}
            onClose={onClose}
            // Required by FilerobotImageEditorConfig type. `previewPixelRatio`
            // controls the on-screen render resolution; `savingPixelRatio`
            // controls the exported file resolution. We use the device pixel
            // ratio for preview (sharp on Retina) and cap saving at 2 to keep
            // avatar files small.
            previewPixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
            savingPixelRatio={2}
            // Keep the avatar workflow on rails — 1:1 crop is forced by
            // default. Caller can override via `aspectRatio` (e.g. set to
            // 16/9 for cover images, or null for free-form).
            Crop={
              aspectRatio == null
                ? undefined
                : { ratio: aspectRatio, autoResize: false, presetsItems: [], presetsFolders: [] }
            }
            // Tabs in the toolbar — order matters; first one is auto-selected.
            // We list Finetune first so the user lands on brightness/contrast
            // sliders, the most common "fix this dark photo" use case.
            tabsIds={['Finetune', 'Filters', 'Adjust', 'Resize', 'Watermark', 'Annotate'] as never}
            defaultTabId={'Finetune' as never}
            defaultToolId={'Brightness' as never}
            // Save settings — JPEG @ 90% quality is the sweet spot for
            // avatars (visibly identical to PNG, ~5× smaller). Filename is
            // overridden in `handleSave` anyway.
            defaultSavedImageType="jpeg"
            defaultSavedImageQuality={0.9}
            forceToPngInEllipticalCrop={false}
            // UI polish — slightly tighter density inside the modal and
            // hide the "Open from URL" button (we always start from a
            // user-picked File).
            useBackendTranslations={false}
            avoidChangesNotSavedAlertOnLeave={true}
          />
        </div>
      </div>
    </div>
  );
}
