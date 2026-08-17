import { NextRequest, NextResponse } from 'next/server';
import { isClientIpAllowlisted } from '@/lib/site-ip-allowlist';

/** Production-only OpenAI connectivity check. Never returns the API key. */
export async function GET(request: NextRequest) {
  if (!isClientIpAllowlisted(request)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }

  const key = process.env.OPENAI_API_KEY?.trim() ?? '';
  if (!key) {
    return NextResponse.json(
      { ok: false, configured: false, reason: 'OPENAI_API_KEY is missing in this environment' },
      { status: 503 },
    );
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Reply with exactly: PONG' }],
        max_tokens: 8,
        temperature: 0,
      }),
    });
    const json = (await res.json()) as {
      error?: { message?: string; code?: string };
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          http_status: res.status,
          reason: json.error?.message || json.error?.code || `HTTP ${res.status}`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      model: json.model ?? 'gpt-4o-mini',
      reply: (json.choices?.[0]?.message?.content ?? '').trim(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        reason: error instanceof Error ? error.message : 'request_failed',
      },
      { status: 502 },
    );
  }
}
