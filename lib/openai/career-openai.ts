import 'server-only';

/** Product default — keep in sync with the production health check. */
export const CAREER_OPENAI_MODEL = 'gpt-4o-mini-2024-07-18';
export const CAREER_GEMINI_MODEL = 'gemini-1.5-flash';

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

/**
 * Server-side JSON chat completion. Supports OpenAI and Google Gemini with failover.
 * Never logs or returns API keys.
 */
export async function openaiJsonCompletion(input: {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
  signal?: AbortSignal;
}): Promise<{ json: unknown; model: string }> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim() ?? '';
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim() ?? '';

  if (openAiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
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

      if (res.ok) {
        const payload = (await res.json()) as ChatCompletionResponse;
        const raw = payload.choices?.[0]?.message?.content?.trim() ?? '';
        if (raw) {
          return {
            json: JSON.parse(raw) as unknown,
            model: payload.model ?? CAREER_OPENAI_MODEL,
          };
        }
      }
    } catch {
      // If OpenAI failed, try Gemini if key exists
    }
  }

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${CAREER_GEMINI_MODEL}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: input.system }] },
          contents: [{ role: 'user', parts: [{ text: input.user }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: input.temperature ?? 0.1,
            maxOutputTokens: input.maxTokens,
          },
        }),
        signal: input.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
        if (raw) {
          return {
            json: JSON.parse(raw) as unknown,
            model: CAREER_GEMINI_MODEL,
          };
        }
      }
    } catch {
      // Gemini failed
    }
  }

  throw new OpenAiUnavailableError();
}
