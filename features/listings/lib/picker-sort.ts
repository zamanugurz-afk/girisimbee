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

export const POPULAR_JOB_SECTORS = [
  'Bilişim / Yazılım',
  'SaaS / Yazılım',
  'Yapay zeka',
  'E-ticaret / Pazaryeri',
  'Fintech',
  'Finans / Bankacılık',
  'Sağlık',
  'Sağlık teknolojisi',
  'Üretim / Sanayi',
  'Üretim ve Sanayi',
  'Gıda / Restoran',
  'Gıda teknolojisi',
  'Perakende',
  'Perakende / Mağaza',
  'Lojistik',
  'Lojistik / Depolama',
  'Satış',
  'Çağrı merkezi',
  'Eğitim',
  'Eğitim teknolojisi',
  'Mobil uygulama',
  'Oyun',
  'Siber güvenlik',
  'Müşteri hizmetleri',
  'Turizm / Otelcilik',
  'İnsan kaynakları',
  'İnşaat / Gayrimenkul',
] as const;

export function sortSectorsPopularThenAz(items: readonly string[]): string[] {
  return sortPopularThenAz(items, POPULAR_JOB_SECTORS, { last: ['Diğer', 'Diğer / Kendim gireceğim'] });
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
 * İstanbul Anadolu / Avrupa first, then the remaining provinces in Turkish alphabetical order.
 */
export const PRIORITY_LISTING_CITIES = [
  'İstanbul Anadolu Yakası',
  'İstanbul Avrupa Yakası',
] as const;

export const PRIORITY_PROVINCE_CITIES = [
  'İstanbul',
] as const;

export function sortCitiesForPicker(items: readonly string[]): string[] {
  const hasSides = items.includes('İstanbul Anadolu Yakası')
    || items.includes('İstanbul Avrupa Yakası');
  
  if (hasSides) {
    const head: string[] = [];
    if (items.includes('İstanbul Anadolu Yakası')) head.push('İstanbul Anadolu Yakası');
    if (items.includes('İstanbul Avrupa Yakası')) head.push('İstanbul Avrupa Yakası');
    const exclude = new Set(head);
    const rest = items
      .filter((c) => !exclude.has(c))
      .slice()
      .sort((a, b) => a.localeCompare(b, 'tr-TR'));
    return [...head, ...rest];
  }

  return items.slice().sort((a, b) => a.localeCompare(b, 'tr-TR'));
}
