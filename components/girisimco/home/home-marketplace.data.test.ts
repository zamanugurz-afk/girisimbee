import { describe, expect, it } from 'vitest';
import {
  CAREER_FLOW_OPTIONS,
  HOME_CATEGORIES,
  HOME_CATEGORIES_CATALOG,
  parseCareerFlowParam,
} from '@/components/girisimco/home/home-marketplace.data';

describe('career hub on homepage catalog', () => {
  it('keeps other gateway cards unchanged and groups jobs under Kariyer ve İş Fırsatları', () => {
    expect(HOME_CATEGORIES.map((cat) => cat.slug)).toEqual([
      'yatirim-bul',
      'ortak-bul',
      'franchise',
      'ise-al',
    ]);
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'yatirim-bul')?.label).toBe('Yatırım Arıyorum');
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'ortak-bul')?.label).toBe('Ortak Arıyorum');
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'franchise')?.label).toBe('Franchise İlanları');
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'ise-al')?.label).toBe(
      'Kariyer ve İş Fırsatları',
    );
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'ise-al')?.label).not.toContain('&');
  });

  it('exposes only İş Arıyorum and İşe Alıyorum as career chooser options', () => {
    expect(CAREER_FLOW_OPTIONS.map((item) => item.label)).toEqual([
      'İş Arıyorum',
      'İşe Alıyorum',
    ]);
    expect(CAREER_FLOW_OPTIONS[0]?.description).toBe(
      'Kendinize uygun iş fırsatlarını keşfedin.',
    );
    expect(CAREER_FLOW_OPTIONS[1]?.description).toBe(
      'Aradığınız doğru çalışanı ve yeteneği bulun.',
    );
    expect(CAREER_FLOW_OPTIONS[0]?.href).toBe('/is?flow=seek');
    expect(CAREER_FLOW_OPTIONS[1]?.href).toBe('/is?flow=hire');
  });

  it('keeps direct /is and catalog slug for the job group', () => {
    const job = HOME_CATEGORIES_CATALOG.find((cat) => cat.slug === 'ise-al');
    expect(job?.href).toBe('/is');
    expect(job?.slug).toBe('ise-al');
  });

  it('parses optional flow query without changing the unfiltered /is path', () => {
    expect(parseCareerFlowParam('seek')).toBe('seek');
    expect(parseCareerFlowParam('hire')).toBe('hire');
    expect(parseCareerFlowParam(undefined)).toBeUndefined();
    expect(parseCareerFlowParam('all')).toBeUndefined();
  });
});
