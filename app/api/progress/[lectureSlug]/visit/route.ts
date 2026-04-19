// app/api/progress/[lectureSlug]/visit/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordVisit, hasVisited } from '@/lib/services/progress';

export async function POST(
  _req: Request,
  { params }: { params: { lectureSlug: string } },
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await recordVisit(user.id, params.lectureSlug);
  return NextResponse.json({ visited: true });
}

export async function GET(
  _req: Request,
  { params }: { params: { lectureSlug: string } },
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const visited = await hasVisited(user.id, params.lectureSlug);
  return NextResponse.json({ visited });
}
