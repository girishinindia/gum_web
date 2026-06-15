'use client';

import { useCallback, useEffect, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { X, RotateCw, Loader2 } from 'lucide-react';
import type { CropperProps } from 'react-easy-crop';

/**
 * Profile-image editor modal — Phase 43.10 rewrite.
 *
 * Was: `react-filerobot-image-editor` (Scaleflex). Beautiful UI but the
 * library ships a prebuilt Konva + react-reconciler bundle that holds
 * its own snapshot of React's `__SECRET_INTERNALS_…`. Next.js's webpack
 * tree-shakes / hoists a fresh React copy and the editor's internal
 * lookup goes stale, crashing with
 *   "Cannot read properties of undefined (reading 'ReactCurrentOwner')"
 * Tried transpilePackages, version pinning across the whole tree, and a
 * `canvas: false` webpack alias — none of them stuck.
 *
 * Now: `react-easy-crop`. Single-file canvas component, no Konva, no
 * reconciler. We do crop + zoom + rotation here, and resize the output
 * via a vanilla `<canvas>` so the persisted avatar is bounded to
 * 1024×1024 JPEG @ 90% quality (same target as the old editor + the
 * Flutter side's image_cropper pipeline).
 *
 * External contract is unchanged:
 *   parent → opens modal with `file`
 *   user   → drags / zooms / rotates → clicks "Save"
 *   modal  → calls `onEditComplete(editedFile)` with a fresh File
 *   parent → uploads via the existing `updateMyProfileWithImages` path
 *
 * If the user closes without saving, `onClose()` fires with no file.
 */

// Dynamic import keeps the cropper out of the initial profile-page
// bundle (it pulls a small amount of touch-gesture / drag code).
// `ssr: false` because react-easy-crop reads `window` for pinch zoom.
// next/dynamic with ssr:false infers an empty-prop component, so TS thought
// <Cropper> took no props (the build-time "not assignable to IntrinsicAttributes"
// error). Cast back to react-easy-crop's real CropperProps so prop types hold.
const Cropper = dynamic(() => import('react-easy-crop'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-slate-500 bg-slate-100">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Loading editor…
    </div>
  ),
}) as unknown as ComponentType<Partial<CropperProps>>;

export interface ImageEditorModalProps {
  /** Source file the user just picked. Required — modal can't open without one. */
  file: File | null;
  /** Called when the user saves the edited image. Always JPEG. */
  onEditComplete: (editedFile: File) => void;
  /** Close without saving. */
  onClose: () => void;
  /**
   * Aspect ratio to lock the crop to. Default `1` (square) is right for
   * avatars. Pass another ratio for covers (e.g. 16/9). Cannot be null
   * here — react-easy-crop requires a number.
   */
  aspectRatio?: number;
  /** Optional title shown in the modal header. */
  title?: string;
  /** Max output size in pixels (longest edge). Default 1024 — matches
   *  the server-side avatar resize target. */
  outputSize?: number;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageEditorModal({
  file,
  onEditComplete,
  onClose,
  aspectRatio = 1,
  title = 'Edit photo',
  outputSize = 1024,
}: ImageEditorModalProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedArea, setCroppedArea] = useState<CroppedArea | null>(null);
  const [saving, setSaving] = useState(false);

  // Convert the picked File → ObjectURL the cropper consumes. Revoked
  // on unmount so we don't leak across opens.
  useEffect(() => {
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    // Reset transforms whenever the source changes — each open starts
    // from "no crop / no zoom / no rotation".
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedArea(null);
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

  // react-easy-crop fires `onCropComplete` with both the pixel area and
  // the percentage area; we only need the pixel one for the canvas draw.
  const onCropComplete = useCallback((_pct: CroppedArea, pixels: CroppedArea) => {
    setCroppedArea(pixels);
  }, []);

  async function handleSave() {
    if (!file || !src || !croppedArea) { onClose(); return; }
    setSaving(true);
    try {
      const blob = await renderCroppedImage(src, croppedArea, rotation, outputSize);
      if (!blob) { onClose(); return; }
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const edited = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
      onEditComplete(edited);
    } finally {
      setSaving(false);
    }
  }

  if (!file || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-cardHover overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>
        {/* Header */}
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

        {/* Cropper canvas — fills available height */}
        <div className="relative bg-slate-900" style={{ height: '60vh' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600 w-14 shrink-0">Zoom</label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-sky-600"
            />
            <span className="text-xs text-slate-500 w-10 text-right">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600 w-14 shrink-0">Rotate</label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 accent-sky-600"
            />
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="text-xs font-medium text-slate-700 hover:text-sky-700 inline-flex items-center gap-1"
              aria-label="Rotate 90°"
            >
              <RotateCw className="h-3.5 w-3.5" /> 90°
            </button>
          </div>

          {/* Action bar */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !croppedArea}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// Canvas rendering — produce the cropped + rotated + resized JPEG.
//
// Algorithm:
//   1. Load the source image as <Image>.
//   2. Compute the bounding box of the rotated image (so rotation
//      doesn't clip when the image isn't a multiple of 90°).
//   3. Draw the rotated image onto a buffer canvas.
//   4. Read out the pixel region the user cropped (in image-space).
//   5. Resample to a max edge of `outputSize` while preserving aspect.
//   6. Export as JPEG @ 0.9 — same quality target as the old editor.
// ════════════════════════════════════════════════════════════════════
async function renderCroppedImage(
  src: string,
  area: CroppedArea,
  rotationDeg: number,
  maxEdge: number,
): Promise<Blob | null> {
  const img = await loadImage(src);
  const radians = (rotationDeg * Math.PI) / 180;

  // Bounding box of the rotated image
  const { width: rotW, height: rotH } = rotatedSize(img.width, img.height, radians);

  // Buffer canvas at rotated size, draw image rotated about its center.
  const buf = document.createElement('canvas');
  buf.width = rotW;
  buf.height = rotH;
  const bctx = buf.getContext('2d');
  if (!bctx) return null;
  bctx.translate(rotW / 2, rotH / 2);
  bctx.rotate(radians);
  bctx.drawImage(img, -img.width / 2, -img.height / 2);

  // Crop region from the buffer.
  const crop = document.createElement('canvas');
  crop.width = area.width;
  crop.height = area.height;
  const cctx = crop.getContext('2d');
  if (!cctx) return null;
  cctx.drawImage(buf, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

  // Resize to maxEdge (longest side). Keeps avatars ≤ 1024×1024.
  const scale = Math.min(1, maxEdge / Math.max(area.width, area.height));
  const outW = Math.round(area.width * scale);
  const outH = Math.round(area.height * scale);

  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(crop, 0, 0, outW, outH);

  return new Promise((resolve) => {
    out.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function rotatedSize(w: number, h: number, rad: number) {
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  return { width: w * cos + h * sin, height: w * sin + h * cos };
}
