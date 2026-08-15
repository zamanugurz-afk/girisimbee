import 'server-only';

import {
  verdictFromModerationPayload,
  type ImageModerationVerdict,
} from '@/lib/openai/image-moderation-verdict';

export type { ImageModerationVerdict };
export { verdictFromModerationPayload };

export async function moderateImageDataUrl(dataUrl: string): Promise<ImageModerationVerdict> {
  const key = process.env.OPENAI_API_KEY?.trim() ?? '';
  if (!key) return { allowed: true, unavailable: true };

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: [{ type: 'image_url', image_url: { url: dataUrl } }],
      }),
    });
    if (!res.ok) return { allowed: true, unavailable: true };
    return verdictFromModerationPayload(await res.json());
  } catch {
    return { allowed: true, unavailable: true };
  }
}
