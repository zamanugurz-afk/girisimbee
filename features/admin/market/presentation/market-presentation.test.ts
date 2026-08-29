import { describe, expect, it } from 'vitest';
import { CREATE_LISTING_VENTURE_COPY } from '@/components/girisimco/listing/create-listing-career.data';
import { ADS_ROUTES, MARKET_AD_PRICE_LABEL } from '@/features/ads/constants/ad-inquiry.constants';
import { toPublicMarketItem } from '@/features/admin/market/lib/public-market-item';
import {
  getMockHomeMarketAds,
  getMockPublishedMarketItems,
  MOCK_MARKET_ITEMS,
} from '@/features/admin/market/mock/market.mock';
import {
  isMarketSafePublicHref,
  MARKET_ADVERTISE_AVAILABLE_LABEL,
  MARKET_ADVERTISE_CTA_LABEL,
  MARKET_ADVERTISE_TITLE,
  MARKET_BRAND_NAME,
  MARKET_EMPTY_BACK_CTA,
  MARKET_EMPTY_TITLE,
  MARKET_HOME_CTA_HREF,
  MARKET_HOME_CTA_LABEL,
  MARKET_HOME_SUBTITLE,
} from '@/features/admin/market/presentation/market-copy';
import { NAV_LINKS, getFooterLinks } from '@/features/shared/constants/navigation';
import { CREATE_LISTING_PICKER_ORDER } from '@/components/girisimco/listing/create-listing-career.data';
import { HOME_CATEGORIES } from '@/components/girisimco/home/home-marketplace.data';

describe('Girişimbee MARKET presentation', () => {
  it('keeps Fırsatlar → MARKET routes isolated from Digital & AI and create listing', () => {
    expect(NAV_LINKS.find((link) => link.label === 'Fırsatlar')?.href).toBe('/market');
    expect(NAV_LINKS.find((link) => link.label === 'Çözümler')?.href).toBe('/dijital-ai');
    expect(getFooterLinks().Fırsatlar?.map((link) => [link.label, link.href])).toEqual([
      ['Girişimbee MARKET', '/market'],
    ]);
    expect(getFooterLinks().Çözümler?.map((link) => [link.label, link.href])).toEqual([
      ['Dijital ve AI Çözümleri', '/dijital-ai'],
    ]);
    expect(MARKET_HOME_CTA_HREF).toBe('/market');
    expect(MARKET_HOME_CTA_LABEL).toBe('Tüm fırsatlar');
    expect(MARKET_HOME_SUBTITLE).toBe('Seçili fırsat ve işbirlikleri');
    expect(MARKET_BRAND_NAME).toBe('Girişimbee MARKET');
    expect(CREATE_LISTING_PICKER_ORDER).toEqual([]);
    expect(CREATE_LISTING_VENTURE_COPY.options.map((item) => item.label)).not.toContain(
      'Girişimbee MARKET',
    );
    expect(CREATE_LISTING_VENTURE_COPY.options.map((item) => item.label)).not.toContain(
      'Dijital & AI Çözümleri',
    );
  });

  it('keeps seed MARKET cards and the advertise slot without investment discovery', () => {
    const home = getMockHomeMarketAds();
    expect(home).toHaveLength(4);
    expect(home.map((item) => item.title)).toEqual([
      'Seed turu arayan SaaS girişimi',
      'Teknoloji ortaklığı — ürün geliştirme',
      'Ulusal franchise genişleme paketi',
      'Erken aşama fintech büyüme turu',
    ]);
    expect(home.map((item) => item.ctaLabel)).toEqual([
      'Fırsatı incele',
      'Detaylara bak',
      'Bayiliği incele',
      'Fırsatı incele',
    ]);
    expect(home.every((item) => item.status === 'published')).toBe(true);
    expect(JSON.stringify(home)).not.toMatch(/\/invest|Yatırım Arıyorum|createdBy":"[^n]/);
    expect(MARKET_ADVERTISE_AVAILABLE_LABEL).toBe('Bu alan müsait');
    expect(MARKET_ADVERTISE_TITLE).toBe('Buraya reklam verin');
    expect(MARKET_ADVERTISE_CTA_LABEL).toBe('Hemen başla');
    expect(ADS_ROUTES.public).toBe('/reklam');
    expect(ADS_ROUTES.market).toBe('/market');
    expect(MARKET_AD_PRICE_LABEL).toBe('5.000 TL');
  });

  it('uses a discover empty state instead of create-listing', () => {
    expect(MARKET_EMPTY_TITLE).toBe('Şu anda gösterilecek fırsat bulunmuyor.');
    expect(MARKET_EMPTY_BACK_CTA.href).toBe('/');
    expect(MARKET_EMPTY_BACK_CTA.href).not.toBe('/ilan/olustur');
    expect(isMarketSafePublicHref('/ilan/olustur')).toBe(false);
  });

  it('strips owner identity and investment destinations from the public MARKET item', () => {
    const source = {
      ...MOCK_MARKET_ITEMS[0]!,
      createdBy: 'user-secret-id',
      linkUrl: '/invest',
    };
    const publicItem = toPublicMarketItem(source);
    expect(publicItem.createdBy).toBeNull();
    expect(publicItem.linkUrl).toBeNull();
    expect(publicItem.title).toBe(source.title);
    expect(JSON.stringify(publicItem)).not.toContain('user-secret-id');
    expect(JSON.stringify(publicItem)).not.toMatch(/0555|@|whatsapp|customFields/i);
    expect(isMarketSafePublicHref('/partners')).toBe(true);
    expect(isMarketSafePublicHref('/franchise/buy')).toBe(true);
    expect(isMarketSafePublicHref('/invest')).toBe(false);
    expect(isMarketSafePublicHref('/dashboard/eslesmeler')).toBe(false);
    expect(isMarketSafePublicHref('/dashboard/ortaklik-eslesmeleri')).toBe(false);
  });

  it('keeps published catalog cards on /market/[id] and hides drafts', () => {
    const published = getMockPublishedMarketItems();
    expect(published.every((item) => item.status === 'published')).toBe(true);
    expect(published.some((item) => item.id === 'mock-ad-draft')).toBe(false);
    expect(published.map((item) => `/market/${item.id}`).every(isMarketSafePublicHref)).toBe(true);
  });

  it('does not surface Yatırım Arıyorum, career matching, or Digital & AI under MARKET', () => {
    const labels = [
      ...NAV_LINKS.map((link) => link.label),
      ...Object.values(getFooterLinks()).flat().map((link) => link.label),
      ...HOME_CATEGORIES.map((item) => item.label),
      MARKET_BRAND_NAME,
      MARKET_HOME_SUBTITLE,
    ].join(' ');
    expect(labels).not.toContain('Yatırım Arıyorum');
    expect(getFooterLinks().Fırsatlar?.some((link) => link.href === '/dijital-ai')).toBe(false);
    expect(HOME_CATEGORIES.map((item) => item.label).join(' ')).not.toContain('MARKET');
    expect(isMarketSafePublicHref('/api/career')).toBe(false);
    expect(isMarketSafePublicHref('/api/partnership')).toBe(false);
  });
});
