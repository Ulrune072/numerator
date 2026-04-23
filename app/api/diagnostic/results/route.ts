// app/api/diagnostic/results/route.ts
// Receives webhook POST from Google Apps Script after form submission.
// Validates the secret, stores result in a simple JSON file (swap for
// a real DB — Prisma, Supabase, etc. — in production).

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────

export interface DiagnosticScore {
  correct: number;
  total: number;
  percent: number;
}

export interface DiagnosticResult {
  id: string;
  email: string | null;
  submittedAt: string;
  responses: Record<string, string>;
  score: DiagnosticScore | null;
  level: DiagnosticLevel;
  savedAt: string;
}

export type DiagnosticLevel = 'beginner' | 'intermediate' | 'advanced';

// ─── Helpers ──────────────────────────────────────────────────

/** Derive a learning level from the percentage score. */
function scoreToLevel(percent: number | null | undefined): DiagnosticLevel {
  if (percent == null) return 'beginner';
  if (percent >= 75)   return 'advanced';
  if (percent >= 40)   return 'intermediate';
  return 'beginner';
}

/** Simple file-based store — replace with your DB in production. */
const STORE_PATH = path.join(process.cwd(), '.diagnostic-results.json');

async function readStore(): Promise<Record<string, DiagnosticResult>> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeStore(store: Record<string, DiagnosticResult>): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate webhook secret
    const secret = process.env.DIAGNOSTIC_WEBHOOK_SECRET;
    if (!secret || body.secret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Build result record
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const result: DiagnosticResult = {
      id,
      email:       body.email ?? null,
      submittedAt: body.submittedAt ?? new Date().toISOString(),
      responses:   body.responses ?? {},
      score:       body.score ?? null,
      level:       scoreToLevel(body.score?.percent),
      savedAt:     new Date().toISOString(),
    };

    // 3. Persist
    const store = await readStore();
    const key = result.email ?? id;   // group by email if available
    store[key] = result;
    await writeStore(store);

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error('[diagnostic webhook]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ─── GET — fetch result for the current user ──────────────────
// Called by the results page. Pass ?email=... or use session.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const store = await readStore();
  const result = store[email] ?? null;

  if (!result) {
    return NextResponse.json({ result: null }, { status: 200 });
  }

  return NextResponse.json({ result });
}
