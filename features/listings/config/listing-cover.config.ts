/**
 * Default listing card covers when the listing has no uploaded images.
 * Static AI-generated photos per listing type (no runtime AI cost).
 * İş Arıyorum covers also vary by sector / role.
 */
import type { ListingCardGroup } from '@/features/listings/utils/listing-card-display';

const COVER_BY_TYPE_SLUG: Record<string, string> = {
  'yatirim-ariyorum': '/covers/yatirim-ariyorum.jpg',
  'yatirim-yapiyorum': '/covers/yatirim-yapiyorum.jpg',
  'is-ariyorum': '/covers/is-ariyorum.jpg',
  'ise-aliyorum': '/covers/ise-aliyorum.jpg',
  'ortak-ariyorum': '/covers/ortak-ariyorum.jpg',
  'franchise-ilan-ver': '/covers/franchise.jpg',
  'bayilik-al': '/covers/franchise.jpg',
  'bayilik-ver': '/covers/franchise.jpg',
};

const COVER_BY_GROUP: Record<ListingCardGroup, string> = {
  yatirim: '/covers/yatirim-ariyorum.jpg',
  is: '/covers/ise-aliyorum.jpg',
  ortaklik: '/covers/ortak-ariyorum.jpg',
  franchise: '/covers/franchise.jpg',
  genel: '/covers/default.jpg',
  dijital: '/covers/default.jpg',
};

export const DEFAULT_LISTING_COVER = '/covers/default.jpg';

export type CareerCoverTheme =
  | 'saglik'
  | 'yazilim'
  | 'satis'
  | 'finans'
  | 'egitim'
  | 'uretim'
  | 'genel';

const CAREER_COVER_BY_THEME: Record<CareerCoverTheme, string> = {
  saglik: '/covers/career-saglik.jpg',
  yazilim: '/covers/career-yazilim.jpg',
  satis: '/covers/career-satis.jpg',
  finans: '/covers/career-finans.jpg',
  egitim: '/covers/career-egitim.jpg',
  uretim: '/covers/career-uretim.jpg',
  genel: '/covers/is-ariyorum.jpg',
};

export function resolveCareerCoverRole(
  desiredRole?: string | null,
  desiredRoleOther?: string | null,
): string | null {
  const role = (desiredRole ?? '').trim();
  const other = (desiredRoleOther ?? '').trim();
  if (role === 'Diğer' || role === 'Diğer / Kendim gireceğim') {
    return other || role;
  }
  return role || other || null;
}

export function resolveCareerCoverTheme(
  sector?: string | null,
  role?: string | null,
): CareerCoverTheme {
  const hay = `${sector ?? ''} ${role ?? ''}`.toLocaleLowerCase('tr-TR');
  if (/sağlık|hemşire|doktor|klinik|hasta|medikal|eczane/.test(hay)) return 'saglik';
  if (/yazılım|bilişim|geliştirici|devops|frontend|backend|full-stack|veri|yapay zeka|data|qa /.test(hay)) {
    return 'yazilim';
  }
  if (/eğitim|öğretmen|akademisyen|eğitmen/.test(hay)) return 'egitim';
  if (/finans|banka|kredi|muhasebe|mali/.test(hay)) return 'finans';
  if (/üretim|sanayi|inşaat|otomotiv|enerji|lojistik|depo|sevkiyat/.test(hay)) return 'uretim';
  if (/satış|sigorta|müşteri|ticaret|perakende|pazarlama/.test(hay)) return 'satis';
  return 'genel';
}

/** Resolve fallback cover from listing type slug or card group. */
export function resolveDefaultListingCover(opts: {
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
  sector?: string | null;
  role?: string | null;
}): string {
  if (opts.listingTypeSlug === 'is-ariyorum') {
    return CAREER_COVER_BY_THEME[resolveCareerCoverTheme(opts.sector, opts.role)];
  }
  if (opts.listingTypeSlug && COVER_BY_TYPE_SLUG[opts.listingTypeSlug]) {
    return COVER_BY_TYPE_SLUG[opts.listingTypeSlug];
  }
  if (opts.group && COVER_BY_GROUP[opts.group]) {
    return COVER_BY_GROUP[opts.group];
  }
  return DEFAULT_LISTING_COVER;
}

/** Prefer uploaded cover; otherwise category/type/profession standard cover. */
export function resolveListingCoverUrl(opts: {
  uploadedUrl?: string | null;
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
  sector?: string | null;
  role?: string | null;
}): string {
  const uploaded = opts.uploadedUrl?.trim();
  if (uploaded) return uploaded;
  return resolveDefaultListingCover(opts);
}
