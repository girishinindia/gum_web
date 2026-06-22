import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * On-demand revalidation endpoint.
 *
 * gum_api calls this (server-to-server) right after an admin saves CMS /
 * people content — About, Homepage, Team, Careers, instructor activation —
 * so the public site reflects the change immediately instead of after the
 * ISR window. Every public fetch in lib/api.ts is tagged `public-content`,
 * so a single revalidateTag refreshes them all on the next page view.
 *
 * Auth: a shared secret (REVALIDATE_SECRET) sent in the JSON body, the
 * `?secret=` query param, or the `x-revalidate-secret` header. If the secret
 * env isn't set, the route is disabled (503) so it can never be triggered
 * anonymously.
 *
 * Body (all optional): { secret, reason, paths: string[] }
 */

const TAG = 'public-content';

function readSecret(req: NextRequest, body: Record<string, unknown>): string {
  const fromBody = typeof body.secret === 'string' ? body.secret : '';
  return (
    fromBody ||
    req.nextUrl.searchParams.get('secret') ||
    req.headers.get('x-revalidate-secret') ||
    ''
  );
}

export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { success: false, error: 'Revalidation is not configured' },
      { status: 503 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // Empty / non-JSON body is fine — secret may come from query or header.
  }

  if (readSecret(req, body) !== expected) {
    return NextResponse.json({ success: false, error: 'Invalid secret' }, { status: 401 });
  }

  // Invalidate every public fetch (tagged in lib/api.ts request()).
  revalidateTag(TAG);

  // Optionally revalidate explicit paths if the caller named any.
  const paths = Array.isArray(body.paths) ? (body.paths as unknown[]) : [];
  const revalidatedPaths: string[] = [];
  for (const p of paths) {
    if (typeof p === 'string' && p.startsWith('/')) {
      revalidatePath(p);
      revalidatedPaths.push(p);
    }
  }

  return NextResponse.json({
    success: true,
    revalidated: true,
    tag: TAG,
    paths: revalidatedPaths,
    reason: typeof body.reason === 'string' ? body.reason : null,
    now: Date.now(),
  });
}

// Lightweight health check (does nothing destructive, no secret required).
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Revalidate endpoint is alive. POST with { secret } to trigger.',
    configured: Boolean(process.env.REVALIDATE_SECRET),
  });
}
