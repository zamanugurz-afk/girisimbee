import 'server-only';

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DEFAULT_USER_AGENT } from './scraper-types';

const execFileAsync = promisify(execFile);

export interface FetchHtmlOptions {
  referer?: string;
  acceptLanguage?: string;
  extraHeaders?: Record<string, string>;
  /** Return empty string instead of throwing when fetch is blocked. */
  softFail?: boolean;
  /** Substring that must appear in HTML to consider the response valid. */
  successMarker?: string;
}

/** Fetch marketplace HTML on the server, with curl fallback when Node fetch is blocked. */
export async function fetchMarketplaceHtmlServer(
  url: string,
  options: FetchHtmlOptions = {},
): Promise<string> {
  const headers: Record<string, string> = {
    'User-Agent': DEFAULT_USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/json',
    'Accept-Language': options.acceptLanguage ?? 'tr-TR,tr;q=0.9,en;q=0.8',
    ...(options.referer ? { Referer: options.referer } : {}),
    ...options.extraHeaders,
  };

  const response = await fetch(url, { headers });

  if (response.ok) {
    const text = await response.text();
    if (!options.successMarker || text.includes(options.successMarker)) {
      return text;
    }
  }

  if (response.status === 403 || response.status === 429 || !response.ok) {
    try {
      const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
      const curlHeaders = Object.entries(headers).flatMap(([key, value]) => ['-H', `${key}: ${value}`]);
      const { stdout } = await execFileAsync(
        curlBin,
        ['-s', '-L', '--max-time', '25', '-A', DEFAULT_USER_AGENT, ...curlHeaders, url],
        { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 },
      );

      if (typeof stdout === 'string' && stdout.length > 0) {
        if (!options.successMarker || stdout.includes(options.successMarker)) {
          return stdout;
        }
      }
    } catch {
      // fall through
    }
  }

  if (options.softFail) return '';

  throw new Error(`Marketplace fetch failed (${response.status}) for ${url}`);
}
