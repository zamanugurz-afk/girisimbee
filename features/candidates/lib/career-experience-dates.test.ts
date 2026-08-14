import { describe, expect, it } from 'vitest';
import {
  formatCareerPeriod,
  validateCareerPeriod,
  validateExperienceOverlaps,
  yearOptions,
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

    expect(
      formatCareerPeriod({
        startMonth: 11,
        startYear: 2025,
        endMonth: 11,
        endYear: 2025,
      }),
    ).toBe('Kasım 2025');
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

  it('lists years from newest to oldest', () => {
    const years = yearOptions(2020, 2026);
    expect(years[0]).toBe(2026);
    expect(years[years.length - 1]).toBe(2020);
    expect(years).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020]);
  });

  it('rejects overlapping experience periods and allows adjacent months', () => {
    expect(
      validateExperienceOverlaps([
        { startMonth: 1, startYear: 2026, endMonth: 6, endYear: 2026 },
        { startMonth: 2, startYear: 2026, endMonth: 5, endYear: 2026 },
      ]),
    ).toMatch(/çakışıyor/);

    expect(
      validateExperienceOverlaps([
        { startMonth: 1, startYear: 2026, endMonth: 6, endYear: 2026 },
        { startMonth: 7, startYear: 2026, endMonth: 12, endYear: 2026 },
      ]),
    ).toBeNull();
  });
});
