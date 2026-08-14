/** Display-order helpers for İş Arıyorum pickers. Stored values stay unchanged. */

function localeAz(a: string, b: string): number {
  return a.localeCompare(b, 'tr-TR');
}

export function sortPopularThenAz(
  items: readonly string[],
  popular: readonly string[],
  options?: { last?: readonly string[] },
): string[] {
  const last = new Set(options?.last ?? []);
  const seen = new Set<string>();
  const head: string[] = [];
  for (const item of popular) {
    if (items.includes(item) && !last.has(item) && !seen.has(item)) {
      head.push(item);
      seen.add(item);
    }
  }
  const rest = items
    .filter((item) => !seen.has(item) && !last.has(item))
    .slice()
    .sort(localeAz);
  const tail = (options?.last ?? []).filter((item) => items.includes(item) && !seen.has(item));
  return [...head, ...rest, ...tail];
}

/** High-demand sectors first, then A–Z. "Diğer" always last. */
export const POPULAR_JOB_SECTORS = [
  'Bilişim / Yazılım',
  'Satış',
  'Sağlık',
  'Finans / Bankacılık',
  'Eğitim',
  'Üretim / Sanayi',
  'Müşteri hizmetleri',
  'Perakende / Mağaza',
  'Turizm / Otelcilik',
  'İnsan kaynakları',
] as const;

export function sortSectorsPopularThenAz(items: readonly string[]): string[] {
  return sortPopularThenAz(items, POPULAR_JOB_SECTORS, { last: ['Diğer'] });
}

/** High-demand roles first inside a sector list, then A–Z. */
export const POPULAR_JOB_POSITIONS = [
  'Yazılım geliştirici',
  'Satış temsilcisi',
  'Satış danışmanı',
  'Hemşire',
  'Muhasebeci',
  'Eğitmen / öğretmen',
  'Müşteri temsilcisi',
  'Resepsiyonist',
  'Otel resepsiyonisti',
  'Garson',
  'Kasiyer',
  'Şoför (hafif ticari)',
  'Depo görevlisi',
  'İnsan kaynakları uzmanı',
  'Pazarlama uzmanı',
  'Banka müşteri temsilcisi',
  'Frontend geliştirici',
  'Backend geliştirici',
  'Full-stack geliştirici',
  'Çağrı merkezi temsilcisi',
  'Aşçı',
  'Servis danışmanı',
] as const;

export function sortPositionsPopularThenAz(
  items: readonly string[],
  last: readonly string[] = [],
): string[] {
  return sortPopularThenAz(items, POPULAR_JOB_POSITIONS, { last });
}

/**
 * İstanbul Anadolu / Avrupa first, then the other largest metros, then A–Z.
 * Plain "İstanbul" stays in the A–Z remainder when present.
 */
export const PRIORITY_LISTING_CITIES = [
  'İstanbul Anadolu Yakası',
  'İstanbul Avrupa Yakası',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Konya',
  'Adana',
  'Şanlıurfa',
  'Gaziantep',
] as const;

export const PRIORITY_PROVINCE_CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Konya',
  'Adana',
  'Şanlıurfa',
  'Gaziantep',
  'Kocaeli',
] as const;

export function sortCitiesForPicker(items: readonly string[]): string[] {
  const hasSides = items.includes('İstanbul Anadolu Yakası')
    || items.includes('İstanbul Avrupa Yakası');
  const popular = hasSides ? PRIORITY_LISTING_CITIES : PRIORITY_PROVINCE_CITIES;
  return sortPopularThenAz(items, popular);
}
