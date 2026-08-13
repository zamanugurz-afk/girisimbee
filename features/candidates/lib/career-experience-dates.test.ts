import { describe, expect, it } from 'vitest';
import {
  formatCareerPeriod,
  validateCareerPeriod,
} from './career-experience-dates';

describe('career experience dates', () => {
  it('formats Turkish month-year ranges', () => {
    expect(
      formatCareerPeriod({
        startMonth: 3,
        startYear: 2018,
        endMonth: 7,
        endYear: 2022,
      }),
    ).toBe('Mart 2018 – Temmuz 2022');

    expect(
      formatCareerPeriod({
        startMonth: 8,
        startYear: 2022,
        isCurrent: true,
      }),
    ).toBe('Ağustos 2022 – Halen');
  });

  it('validates required start/end and current-job exclusivity', () => {
    expect(validateCareerPeriod({ startMonth: 1, startYear: 2020, isCurrent: true })).toBeNull();
    expect(
      validateCareerPeriod({
        startMonth: 1,
        startYear: 2020,
        isCurrent: true,
        endMonth: 2,
        endYear: 2021,
      }),
    ).toMatch(/Halen/);
    expect(
      validateCareerPeriod({
        startMonth: 1,
        startYear: 2020,
        isCurrent: false,
      }),
    ).toMatch(/Bitiş/);
  });
});
