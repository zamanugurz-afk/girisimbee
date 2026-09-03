import { describe, it, expect } from 'vitest';
import { BRAND_SYMBOL_SRC, BRAND_SYMBOL_DARK_SRC } from '@/components/girisimco/brand-mark.constants';
import fs from 'fs';
import path from 'path';

describe('Dark Mode Logo & Brand Asset Verification Suite', () => {
  it('verifies both light and dark brand symbol assets exist in public/brand/', () => {
    const lightPath = path.join(process.cwd(), 'public', BRAND_SYMBOL_SRC);
    const darkPath = path.join(process.cwd(), 'public', BRAND_SYMBOL_DARK_SRC);

    expect(fs.existsSync(lightPath)).toBe(true);
    expect(fs.existsSync(darkPath)).toBe(true);
  });

  it('checks that light and dark symbols have valid non-zero byte size', () => {
    const lightPath = path.join(process.cwd(), 'public', BRAND_SYMBOL_SRC);
    const darkPath = path.join(process.cwd(), 'public', BRAND_SYMBOL_DARK_SRC);

    const lightStat = fs.statSync(lightPath);
    const darkStat = fs.statSync(darkPath);

    expect(lightStat.size).toBeGreaterThan(1000);
    expect(darkStat.size).toBeGreaterThan(1000);
  });
});
