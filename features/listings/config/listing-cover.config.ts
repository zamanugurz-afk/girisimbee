/**
 * Default listing card covers when the listing has no uploaded images.
 * Static AI-generated photos per listing type (no runtime AI cost).
 * İş Arıyorum covers vary by sector / role and optional private gender.
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
  | 'sigorta'
  | 'saglik'
  | 'yazilim'
  | 'satis'
  | 'finans'
  | 'egitim'
  | 'uretim'
  | 'genel';

export type CareerCoverGender = 'erkek' | 'kadin';

const CAREER_SCENE_COVER_BY_THEME: Record<CareerCoverTheme, string> = {
  sigorta: '/covers/career-satis.jpg',
  saglik: '/covers/career-saglik.jpg',
  yazilim: '/covers/career-yazilim.jpg',
  satis: '/covers/career-satis.jpg',
  finans: '/covers/career-finans.jpg',
  egitim: '/covers/career-egitim.jpg',
  uretim: '/covers/career-uretim.jpg',
  genel: '/covers/is-ariyorum.jpg',
};

const CAREER_PERSON_COVERS: Record<CareerCoverGender, Partial<Record<CareerCoverTheme, string>>> = {
  erkek: {
    sigorta: '/covers/career-erkek-sigorta.jpg',
    saglik: '/covers/career-erkek-saglik.jpg',
    yazilim: '/covers/career-erkek-yazilim.jpg',
    satis: '/covers/career-erkek-satis.jpg',
    finans: '/covers/career-erkek-finans.jpg',
    egitim: '/covers/career-erkek-egitim.jpg',
    genel: '/covers/career-erkek-genel.jpg',
  },
  kadin: {
    sigorta: '/covers/career-kadin-sigorta.jpg',
    saglik: '/covers/career-kadin-saglik.jpg',
    yazilim: '/covers/career-kadin-yazilim.jpg',
    satis: '/covers/career-kadin-satis.jpg',
    finans: '/covers/career-kadin-finans.jpg',
    egitim: '/covers/career-kadin-egitim.jpg',
    genel: '/covers/career-kadin-genel.jpg',
  },
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

export function resolveCareerCoverGender(value?: string | null): CareerCoverGender | null {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('tr-TR');
  if (normalized === 'erkek') return 'erkek';
  if (normalized === 'kadın' || normalized === 'kadin') return 'kadin';
  return null;
}

export function resolveCareerCoverTheme(
  sector?: string | null,
  role?: string | null,
): CareerCoverTheme {
  const hay = `${sector ?? ''} ${role ?? ''}`.toLocaleLowerCase('tr-TR');
  if (/sigorta|poliçe|hasar|broker|underwriter|segem/.test(hay)) return 'sigorta';
  if (/sağlık|hemşire|doktor|klinik|hasta|medikal|eczane|fizyo|ebe|ambulans|veteriner/.test(hay)) {
    return 'saglik';
  }
  if (/yazılım|bilişim|geliştirici|devops|frontend|backend|full-stack|veri|yapay zeka|data|qa |sistem yöneticisi|prompt/.test(hay)) {
    return 'yazilim';
  }
  if (/eğitim|öğretmen|akademisyen|eğitmen|okul/.test(hay)) return 'egitim';
  if (/kredi uzman|bankacı|banka|finans|muhasebe|mali müşavir|kredi|hazine|uyum|iç kontrol/.test(hay)) {
    return 'finans';
  }
  if (/servis danışman|resepsiyon|ön büro|host|hostes|otel|turizm|garson|aşçı|barista|animatör|kat görev/.test(hay)) {
    return 'satis';
  }
  if (/üretim|sanayi|inşaat|otomotiv|enerji|lojistik|depo|sevkiyat|şoför|forklift|şantiye|tarım|ziraat/.test(hay)) {
    return 'uretim';
  }
  if (/satış|müşteri|ticaret|perakende|pazarlama|çağrı|kasiyer|mağaza|gayrimenkul danışman/.test(hay)) {
    return 'satis';
  }
  return 'genel';
}

function resolveCareerCoverPath(opts: {
  sector?: string | null;
  role?: string | null;
  gender?: string | null;
}): string {
  const theme = resolveCareerCoverTheme(opts.sector, opts.role);
  const gender = resolveCareerCoverGender(opts.gender);
  if (gender) {
    return CAREER_PERSON_COVERS[gender][theme]
      ?? CAREER_PERSON_COVERS[gender].genel
      ?? CAREER_SCENE_COVER_BY_THEME[theme];
  }
  return CAREER_SCENE_COVER_BY_THEME[theme];
}

/** Resolve fallback cover from listing type slug or card group. */
export function resolveDefaultListingCover(opts: {
  listingTypeSlug?: string | null;
  group?: ListingCardGroup | null;
  sector?: string | null;
  role?: string | null;
  gender?: string | null;
}): string {
  if (opts.listingTypeSlug === 'is-ariyorum' || opts.listingTypeSlug === 'is-bul') {
    return resolveCareerCoverPath(opts);
  }
  if (opts.listingTypeSlug === 'ise-aliyorum' || opts.listingTypeSlug === 'ise-al') {
    return resolveCareerCoverPath({ ...opts, gender: null });
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
  gender?: string | null;
}): string {
  const uploaded = opts.uploadedUrl?.trim();
  if (uploaded) return uploaded;
  return resolveDefaultListingCover(opts);
}
