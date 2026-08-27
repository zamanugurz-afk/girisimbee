import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION } from './career-taxonomy';
import { suggestTools } from './career-tools';

describe('career tools catalog', () => {
  it('offers a shared list with manual fallback for both cards', () => {
    const tools = suggestTools({ sector: 'Bilişim / Yazılım', role: 'Full-stack geliştirici' });
    expect(tools).toEqual(expect.arrayContaining(['Excel', 'Git', 'Jira', MANUAL_OPTION]));
    expect(tools.at(-1)).toBe(MANUAL_OPTION);
  });

  it('adds call-center tools when the sector is Çağrı merkezi', () => {
    const tools = suggestTools({ sector: 'Çağrı merkezi', role: 'Çağrı merkezi temsilcisi' });
    expect(tools).toEqual(expect.arrayContaining(['Genesys Cloud', 'Zendesk', 'Excel', MANUAL_OPTION]));
  });

  it('suggests modern finance tools for Finance sector and roles', () => {
    const tools = suggestTools({ sector: 'Finans', role: 'Finansal analist' });
    expect(tools).toEqual(
      expect.arrayContaining(['Bloomberg Terminal', 'Matriks Finansal Terminal', 'Power BI', 'Excel', MANUAL_OPTION]),
    );
  });
});
