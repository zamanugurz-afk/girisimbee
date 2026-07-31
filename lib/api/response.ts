import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T): NextResponse {
  return ok(data, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function apiError(
  message: string,
  status: number,
  extras?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: message, ...extras }, { status });
}
