import { describe, expect, it } from 'vitest';
import {
  CAREER_FLOW_OPTIONS,
  CAREER_HUB_LANDING,
  HOME_CATEGORIES,
  HOME_CATEGORIES_CATALOG,
  HOME_GATEWAY_DEFERRED_SLUGS,
  parseCareerFlowParam,
  VENTURE_PARTNERSHIP_HUB,
  VENTURE_PARTNERSHIP_OPTIONS,
} from '@/components/girisimco/home/home-marketplace.data';

describe('career hub on homepage catalog', () => {
  it('keeps career as a homepage gateway card and hides investment from the gateway', () => {
    expect(HOME_CATEGORIES.map((cat) => cat.slug)).toEqual([
      'ise-al',
      'girisim-ortaklik',
    ]);
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'ise-al')?.label).toBe(
      'Kariyer ve İş Fırsatları',
    );
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'ise-al')?.href).toBe('/is');
    expect(HOME_CATEGORIES.find((cat) => cat.slug === 'ise-al')?.label).not.toContain('&');
    expect(HOME_CATEGORIES.map((cat) => cat.slug as string)).not.toContain('yatirim-bul');
    expect(HOME_CATEGORIES.some((cat) => cat.slug === 'dijital-ai')).toBe(false);
    expect(HOME_CATEGORIES_CATALOG.map((cat) => cat.slug as string)).not.toContain('yatirim-bul');
    expect(HOME_CATEGORIES_CATALOG.find((cat) => cat.slug === 'market')?.href).toBe(
      '/market',
    );
    expect(HOME_GATEWAY_DEFERRED_SLUGS).toEqual([
      'ortak-bul',
      'franchise',
      'market',
    ]);
    expect(HOME_CATEGORIES.map((cat) => cat.label).join(' ')).not.toContain('&');
  });

  it('groups venture ecosystem under Ortaklık ve Devir without new category IDs', () => {
    expect(VENTURE_PARTNERSHIP_HUB.href).toBe('/girisim-ortaklik');
    expect(VENTURE_PARTNERSHIP_HUB.title).toBe('Ortaklık ve Devir');
    expect(VENTURE_PARTNERSHIP_HUB.description).toBe(
      'Ortaklık ve işletme devri fırsatlarını keşfedin veya kendi fırsatınızı yayınlayın.',
    );
    expect(VENTURE_PARTNERSHIP_OPTIONS.map((item) => item.label)).toEqual([
      'Ortaklık',
      'İşletme Devri',
    ]);
    expect(VENTURE_PARTNERSHIP_OPTIONS[0]?.href).toBe('/partners');
    expect(VENTURE_PARTNERSHIP_OPTIONS[1]?.href).toBe('/isletme-devri');
    expect(VENTURE_PARTNERSHIP_OPTIONS[0]?.description).toBe(
      'Girişiminiz için aradığınız yetkin kurucu veya iş ortağını bulun.',
    );
    expect(VENTURE_PARTNERSHIP_OPTIONS[1]?.description).toBe(
      'Faal işletme devri fırsatlarını keşfedin.',
    );
  });

  it('exposes İş Arıyorum and İşe Alıyorum as /is intent cards', () => {
    expect(CAREER_HUB_LANDING.badge).toBe('Kariyer ve İş Fırsatları');
    expect(CAREER_HUB_LANDING.title).toBe('Kariyer ve İş Fırsatları');
    expect(CAREER_FLOW_OPTIONS.map((item) => item.label)).toEqual([
      'İş Arıyorum',
      'İşe Alıyorum',
    ]);
    expect(CAREER_HUB_LANDING.trust).toBe(
      'İletişim bilgileriniz gizli kalır. İlgilendiğiniz kişiyle iletişim talebi üzerinden bağlantı kurarsınız.',
    );
    expect(CAREER_FLOW_OPTIONS[0]?.description).toBe(
      'Yayındaki iş ilanlarını inceleyin, deneyiminize uygun olanı seçin ve iletişim talebiyle ilerleyin.',
    );
    expect(CAREER_FLOW_OPTIONS[1]?.description).toBe(
      'Aday profillerini inceleyin, aradığınız rolle eşleştirin ve iletişim talebi üzerinden bağlanın.',
    );
    expect(CAREER_FLOW_OPTIONS[0]?.benefits[0]?.title).toBe('Fırsatları keşfedin');
    expect(CAREER_FLOW_OPTIONS[1]?.benefits[0]?.title).toBe('Adayları inceleyin');
    expect(CAREER_FLOW_OPTIONS[0]?.benefits[2]?.title).toBe('Güvenli iletişim kurun');
    expect(CAREER_FLOW_OPTIONS[1]?.benefits[2]?.text).toBe(
      'Adayla iletişim talebi üzerinden bağlantı kurun.',
    );
    expect(CAREER_FLOW_OPTIONS[0]?.href).toBe('/is?flow=seek');
    expect(CAREER_FLOW_OPTIONS[1]?.href).toBe('/is?flow=hire');
    expect(CAREER_FLOW_OPTIONS[0]?.benefits).toHaveLength(3);
    expect(CAREER_FLOW_OPTIONS[1]?.benefits).toHaveLength(3);
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
