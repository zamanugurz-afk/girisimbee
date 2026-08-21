import { describe, expect, it } from 'vitest';

describe('header search logic & url routing', () => {
  it('encodes simple queries to /ara?q=...', () => {
    const query = 'kahve';
    const href = `/ara?q=${encodeURIComponent(query.trim())}`;
    expect(href).toBe('/ara?q=kahve');
  });

  it('encodes Turkish characters and multi-word queries accurately', () => {
    const query = 'işletme devri';
    const href = `/ara?q=${encodeURIComponent(query.trim())}`;
    expect(href).toBe('/ara?q=i%C5%9Fletme%20devri');
    expect(decodeURIComponent('i%C5%9Fletme%20devri')).toBe('işletme devri');
  });

  it('handles empty/whitespace queries safely without extra parameters', () => {
    const query = '   ';
    const trimmed = query.trim();
    const href = trimmed ? `/ara?q=${encodeURIComponent(trimmed)}` : '/ara';
    expect(href).toBe('/ara');
  });
});
