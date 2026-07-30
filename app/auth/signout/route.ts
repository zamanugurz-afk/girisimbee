import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(AUTH_ROUTES.login, request.url), { status: 302 });
}

export async function GET(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(AUTH_ROUTES.login, request.url));
}
