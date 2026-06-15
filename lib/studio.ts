/**
 * Instructor Studio client (June 2026).
 *
 * Two API surfaces:
 *  • /studio/:type        — ownership-scoped CRUD for webinars, sessions,
 *                           batches, blog, podcasts, faqs, promotions
 *  • /authoring/*         — the separate instructor COURSE module (drafts,
 *                           highlights, curriculum units + uploads, capstones,
 *                           mini projects, faqs, readiness, submit)
 */

import { apiBase } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

export class StudioError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = 'StudioError'; this.status = status; }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function call<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const tok = getAccessToken();
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new StudioError('Network error. Please check your connection.', 0);
  }
  let json: any = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) {
    throw new StudioError(json?.error || json?.message || `Request failed (${res.status})`, res.status);
  }
  return (json?.data ?? json) as T;
}

/** FormData upload (file/video) with auth — no Content-Type header. */
async function upload<T>(path: string, fd: FormData, method = 'POST'): Promise<T> {
  const tok = getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: tok ? { Authorization: `Bearer ${tok}` } : undefined,
    body: fd,
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) {
    throw new StudioError(json?.error || `Upload failed (${res.status})`, res.status);
  }
  return (json?.data ?? json) as T;
}

// ── Generic studio types ────────────────────────────────────────────────
export type StudioType = 'webinars' | 'sessions' | 'batches' | 'blog' | 'podcasts' | 'faqs' | 'promotions';

export const studioList = (type: StudioType) => call<any[]>(`/studio/${type}?limit=100`);
export const studioCreate = (type: StudioType, body: any) => call<any>(`/studio/${type}`, { method: 'POST', body });
export const studioUpdate = (type: StudioType, id: number, body: any) => call<any>(`/studio/${type}/${id}`, { method: 'PATCH', body });
export const studioDelete = (type: StudioType, id: number) => call<any>(`/studio/${type}/${id}`, { method: 'DELETE' });
export const getPromotionCourses = (id: number) => call<number[]>(`/studio/promotions/${id}/courses`);
export const setPromotionCourses = (id: number, course_ids: number[]) => call<number[]>(`/studio/promotions/${id}/courses`, { method: 'POST', body: { course_ids } });
export const myPublishedCourses = () => call<{ id: number; name: string; slug?: string; price?: number | string; course_status?: string }[]>('/studio/my-courses');

// ── Authoring (instructor courses) ──────────────────────────────────────
export interface DraftCourse {
  id: number; title: string; subtitle?: string | null; short_intro?: string | null; long_intro?: string | null;
  category_id?: number | null; language_id?: number | null; level?: string | null;
  price?: number | string | null; original_price?: number | string | null; is_free?: boolean;
  thumbnail_url?: string | null; trailer_video?: string | null; has_certificate?: boolean;
  status?: string | null; rejection_reason?: string | null; verified_at?: string | null;
  canonical_course_id?: number | null; created_at?: string;
}
export interface DraftUnit {
  id: number; authoring_course_id: number; parent_unit_id?: number | null;
  unit_type: 'module' | 'chapter' | 'topic'; title: string; summary?: string | null;
  display_order?: number | null; topic_type?: string | null; is_free_preview?: boolean;
  video?: string | null; youtube_url?: string | null; video_title?: string | null;
  article_pdf?: string | null; exercise_pdf?: string | null; exercise_solution_pdf?: string | null;
  assignment_pdf?: string | null; project_pdf?: string | null; project_solution_file_url?: string | null;
}
export interface DraftHighlight { id: number; kind: string; text: string; display_order?: number | null }
export interface DraftFaq { id: number; question: string; answer: string; display_order?: number | null }
export interface DraftProject {
  id: number; title: string; description?: string | null; unit_id?: number | null;
  pdf_url?: string | null; solution_file_url?: string | null; solution_github_url?: string | null; display_order?: number | null;
}

export const listDrafts = () => call<DraftCourse[]>('/authoring/courses?limit=100');
export const getDraft = (id: number) => call<DraftCourse>(`/authoring/courses/${id}`);
export const createDraft = (body: Partial<DraftCourse>) => call<DraftCourse>('/authoring/courses', { method: 'POST', body });
export const updateDraft = (id: number, body: Partial<DraftCourse>) => call<DraftCourse>(`/authoring/courses/${id}`, { method: 'PATCH', body });
export const deleteDraft = (id: number) => call<any>(`/authoring/courses/${id}`, { method: 'DELETE' });
export const getReadiness = (id: number) => call<{ ready: boolean; problems: string[] }>(`/authoring/courses/${id}/readiness`);
export const submitDraft = (id: number) => call<DraftCourse>(`/authoring/courses/${id}/submit`, { method: 'PATCH' });
export const uploadDraftThumbnail = (id: number, file: File) => { const fd = new FormData(); fd.append('file', file, file.name); return upload<DraftCourse>(`/authoring/courses/${id}/thumbnail`, fd); };
export const uploadDraftTrailer = (id: number, file: File) => { const fd = new FormData(); fd.append('video', file, file.name); return upload<DraftCourse>(`/authoring/courses/${id}/trailer-video`, fd); };
export const removeDraftTrailer = (id: number) => call<any>(`/authoring/courses/${id}/trailer-video`, { method: 'DELETE' });
export const importStructure = (id: number, file: File) => { const fd = new FormData(); fd.append('file', file, file.name); return upload<any>(`/authoring/courses/${id}/import-structure`, fd); };

export const listHighlights = (courseId: number) => call<DraftHighlight[]>(`/authoring/highlights?authoring_course_id=${courseId}`);
export const createHighlight = (body: { authoring_course_id: number; kind: string; text: string }) => call<DraftHighlight>('/authoring/highlights', { method: 'POST', body });
export const removeHighlight = (id: number) => call<any>(`/authoring/highlights/${id}`, { method: 'DELETE' });

export const listUnits = (courseId: number) => call<DraftUnit[]>(`/authoring/units?authoring_course_id=${courseId}&limit=500`);
export const createUnit = (body: Partial<DraftUnit> & { authoring_course_id: number; unit_type: string; title: string }) => call<DraftUnit>('/authoring/units', { method: 'POST', body });
export const updateUnit = (id: number, body: Partial<DraftUnit>) => call<DraftUnit>(`/authoring/units/${id}`, { method: 'PATCH', body });
export const deleteUnit = (id: number) => call<any>(`/authoring/units/${id}`, { method: 'DELETE' });
export const uploadUnitVideo = (id: number, file: File) => { const fd = new FormData(); fd.append('video', file, file.name); return upload<DraftUnit>(`/authoring/units/${id}/video`, fd); };
export const removeUnitVideo = (id: number) => call<any>(`/authoring/units/${id}/video`, { method: 'DELETE' });
export const unitVideoPlayback = (id: number) => call<{ url?: string } | null>(`/authoring/units/${id}/video-playback`);
export type UnitFileKind = 'article' | 'exercise' | 'exercise_solution' | 'assignment' | 'project' | 'project_solution';
export const uploadUnitFile = (id: number, kind: UnitFileKind, file: File) => { const fd = new FormData(); fd.append('file', file, file.name); return upload<DraftUnit>(`/authoring/units/${id}/file?kind=${kind}`, fd); };
export const removeUnitFile = (id: number, kind: UnitFileKind) => call<any>(`/authoring/units/${id}/file?kind=${kind}`, { method: 'DELETE' });

export const listDraftFaqs = (courseId: number) => call<DraftFaq[]>(`/authoring/faqs?authoring_course_id=${courseId}`);
export const createDraftFaq = (body: { authoring_course_id: number; question: string; answer: string }) => call<DraftFaq>('/authoring/faqs', { method: 'POST', body });
export const removeDraftFaq = (id: number) => call<any>(`/authoring/faqs/${id}`, { method: 'DELETE' });

export const listCapstones = (courseId: number) => call<DraftProject[]>(`/authoring/capstone-projects?authoring_course_id=${courseId}`);
export const createCapstone = (body: { authoring_course_id: number; title: string; description?: string | null; solution_github_url?: string | null }) => call<DraftProject>('/authoring/capstone-projects', { method: 'POST', body });
export const removeCapstone = (id: number) => call<any>(`/authoring/capstone-projects/${id}`, { method: 'DELETE' });
export const uploadCapstoneFile = (id: number, kind: 'pdf' | 'solution', file: File) => { const fd = new FormData(); fd.append('file', file, file.name); return upload<DraftProject>(`/authoring/capstone-projects/${id}/file?kind=${kind}`, fd); };

export const listMiniProjects = (courseId: number) => call<DraftProject[]>(`/authoring/mini-projects?authoring_course_id=${courseId}`);
export const createMiniProject = (body: { authoring_course_id: number; unit_id?: number | null; title: string; description?: string | null; solution_github_url?: string | null }) => call<DraftProject>('/authoring/mini-projects', { method: 'POST', body });
export const removeMiniProject = (id: number) => call<any>(`/authoring/mini-projects/${id}`, { method: 'DELETE' });
export const uploadMiniProjectFile = (id: number, kind: 'pdf' | 'solution', file: File) => { const fd = new FormData(); fd.append('file', file, file.name); return upload<DraftProject>(`/authoring/mini-projects/${id}/file?kind=${kind}`, fd); };

// Reference data for forms
export const studioCategories = () => call<any[]>('/sub-categories?is_active=true&limit=200&sort=display_order&order=asc');
export const studioLanguages = () => call<any[]>('/languages?is_active=true&limit=50');
export const studioBlogCategories = () => call<any[]>('/blog-categories?is_active=true&limit=100&sort=name&order=asc');
export const studioUploadImage = (file: File) => { const fd = new FormData(); fd.append('file', file, file.name); return upload<{ url: string }>('/studio/upload-image', fd); };
