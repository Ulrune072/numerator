// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth';
import { listAll } from '@/lib/services/users';

export async function GET() {
  await requireAdmin();
  const users = await listAll();
  return NextResponse.json(users);
}