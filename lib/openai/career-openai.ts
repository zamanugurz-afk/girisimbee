import 'server-only';

/** Product default — keep in sync with the production health check. */
export const CAREER_OPENAI_MODEL = 'gpt-4o-mini-2024-07-18';

export class OpenAiUnavailableError extends Error {
  constructor(message = 'AI şu anda kullanılamıyor. Formu manuel tamamlayabilirsiniz.') {
    super(message);
    this.name = 'OpenAiUnavailableError';
  }
}

type ChatCompletionResponse = {
  error?: { message?: string; code?: string };
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
};

function readApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim() ?? '';
  if (!key) {
    throw new OpenAiUnavailableError('AI yapılandırılmamış. Formu manuel tamamlayabilirsiniz.');
  }
  return key;
}

/**
 * Server-side JSON chat completion. Never logs or returns the API key.
 */
export async function openaiJsonCompletion(input: {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  signal?: AbortSignal;
}): Promise<{ json: unknown; model: string }> {
  const key = readApiKey();

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CAREER_OPENAI_MODEL,
        temperature: input.temperature ?? 0.2,
        max_tokens: input.maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: input.system },
          { role: 'user', content: input.user },
        ],
      }),
      signal: input.signal,
    });
  } catch {
    throw new OpenAiUnavailableError();
  }

  let payload: ChatCompletionResponse;
  try {
    payload = (await res.json()) as ChatCompletionResponse;
  } catch {
    throw new OpenAiUnavailableError();
  }

  if (!res.ok) {
    throw new OpenAiUnavailableError();
  }

  const raw = payload.choices?.[0]?.message?.content?.trim() ?? '';
  if (!raw) {
    throw new OpenAiUnavailableError();
  }

  try {
    return {
      json: JSON.parse(raw) as unknown,
      model: payload.model ?? CAREER_OPENAI_MODEL,
    };
  } catch {
    throw new OpenAiUnavailableError('AI yanıtı okunamadı. Formu manuel tamamlayabilirsiniz.');
  }
}
