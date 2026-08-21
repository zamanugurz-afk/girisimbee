import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(process.cwd(), 'features', 'business-transfer-matching');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe('Business Transfer Matching Isolation Test', () => {
  it('does not import career matching engine, career profile, or /is routes', () => {
    const files = walk(ROOT).filter(
      (file) => (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.'),
    );
    expect(files.length).toBeGreaterThan(3);

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      const imports = source
        .split('\n')
        .filter((line) => /^\s*import\s/.test(line))
        .join('\n');
      expect(imports, file).not.toMatch(/features\/matching-engine/);
      expect(imports, file).not.toMatch(/features\/career-profile/);
      expect(imports, file).not.toMatch(/['"`]\/is(?:\/|\?|['"`])/);
      expect(source, file).not.toMatch(/matching_score/);
    }
  });
});
