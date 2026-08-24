/**
 * Central career taxonomy for İş Arıyorum (Kariyer Kartı).
 * Stored values stay as Turkish display strings in customFields (no DB enum).
 */

import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { sortPositionsPopularThenAz } from '@/features/listings/lib/picker-sort';
import {
  resolvePositionBundle,
  type RoleFamily,
} from '@/features/candidates/taxonomy/career-position-catalog';
import {
  adjacentFamilyBundles,
  buildOccupationalContext,
  occupationalSkillThemes,
  rankOccupationalOptions,
  type OccupationalProfileInput,
} from '@/features/candidates/taxonomy/occupational-context';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';

export const MANUAL_OPTION = 'Diğer / Kendim gireceğim' as const;
export const MANUAL_OPTION_SHORT = 'Diğer' as const;

export function isManualCareerOption(value: unknown): boolean {
  const v = String(value ?? '').trim();
  return v === MANUAL_OPTION || v === MANUAL_OPTION_SHORT;
}

/** Internal experience-level values (do not rename — legacy listings store these). */
export const EXPERIENCE_LEVEL_VALUES = [
  'Stajyer',
  'Yeni Mezun',
  'Giriş Seviyesi',
  'Junior',
  'Mid',
  'Senior',
  'Uzman',
  'Takım Lideri',
  'Orta Düzey Yönetici',
  'Yönetici',
  'Direktör',
] as const;

export type ExperienceLevelValue = (typeof EXPERIENCE_LEVEL_VALUES)[number];

/** Turkish UI labels for experience levels (internal values unchanged). */
export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  Stajyer: 'Stajyer',
  'Yeni Mezun': 'Yeni Mezun',
  'Giriş Seviyesi': 'Giriş Seviyesi',
  Junior: 'Başlangıç Seviyesi',
  Mid: 'Orta Seviye',
  Senior: 'Kıdemli',
  Uzman: 'Uzman',
  'Takım Lideri': 'Takım Lideri / Şef',
  'Orta Düzey Yönetici': 'Orta Düzey Yönetici',
  Yönetici: 'Yönetici',
  Direktör: 'Üst Düzey Yönetici',
};

export function getExperienceLevelLabel(value: string | null | undefined): string {
  if (!value) return '';
  return EXPERIENCE_LEVEL_LABELS[value] ?? value;
}

export const CAREER_LANGUAGE_OPTIONS = [
  'İngilizce',
  'Almanca',
  'Fransızca',
  'Arapça',
  'İspanyolca',
  'İtalyanca',
  'Rusça',
  'Çince',
  'Japonca',
  'Korece',
  'Portekizce',
  'Farsça',
  'Türkçe',
  MANUAL_OPTION_SHORT,
] as const;

/** UI Turkish; CEFR-ish mapping kept as comment for future i18n. */
export const CAREER_LANGUAGE_LEVEL_OPTIONS = [
  'Başlangıç', // A1
  'Temel', // A2
  'Orta', // B1
  'İyi', // B2
  'İleri', // C1
  'Ana Dil', // C2 / native
] as const;

export const EDUCATION_FIELD_OPTIONS = [
  'Bilgisayar Mühendisliği',
  'Yazılım Mühendisliği',
  'Elektrik-Elektronik Mühendisliği',
  'Endüstri Mühendisliği',
  'Makine Mühendisliği',
  'İnşaat Mühendisliği',
  'İşletme',
  'İktisat',
  'Kamu Yönetimi',
  'Uluslararası İlişkiler',
  'Hukuk',
  'Psikoloji',
  'Sosyoloji',
  'İletişim',
  'Halkla İlişkiler',
  'Pazarlama',
  'Muhasebe',
  'Finans',
  'Bankacılık ve Sigortacılık',
  'Sermaye Piyasası ve Borsa',
  'Sermaye Piyasaları',
  'İnsan Kaynakları',
  'Hemşirelik',
  'Tıp',
  'Eczacılık',
  'Diş Hekimliği',
  'Fizyoterapi ve Rehabilitasyon',
  'Öğretmenlik / Eğitim Bilimleri',
  'İngilizce Öğretmenliği',
  'Matematik',
  'İstatistik',
  'Mimarlık',
  'İç Mimarlık',
  'Grafik Tasarım',
  'Görsel İletişim Tasarımı',
  'Turizm ve Otelcilik',
  'Lojistik',
  'Uluslararası Ticaret',
  'Gıda Mühendisliği',
  'Kimya',
  'Biyoloji',
  'Veterinerlik',
  'Tarım',
  MANUAL_OPTION,
] as const;

/** University / MYO majors — hidden for İlköğretim and Lise. */
export function needsEducationField(educationLevel?: string | null): boolean {
  const hay = (educationLevel ?? '').trim().toLocaleLowerCase('tr-TR');
  if (!hay) return false;
  if (hay === 'ilköğretim' || hay === 'ilkogretim' || hay === 'lise') return false;
  return true;
}

type SectorKey = (typeof JOB_SECTOR_OPTIONS)[number];

const SECTOR_POSITIONS: Partial<Record<SectorKey, readonly string[]>> = {
  'Bilişim / Yazılım': [
    'Yazılım geliştirici',
    'Frontend geliştirici',
    'Backend geliştirici',
    'Full-stack geliştirici',
    'Mobil uygulama geliştirici',
    'DevOps / Cloud mühendisi',
    'QA / Test uzmanı',
    'Ürün yöneticisi',
    'Product designer / UX',
    'UI/UX tasarımcı',
    'İş analisti',
    'Business analyst',
    'Proje yöneticisi',
    'Sistem yöneticisi',
    'Teknik destek uzmanı',
    'Bilgisayar teknik servis',
    'Scrum Master',
    'CTO / Teknik lider',
  ],
  'Yapay zeka / Veri': [
    'Yapay zeka / ML mühendisi',
    'Veri analisti',
    'Data engineer',
    'Veri bilimci',
    'MLOps uzmanı',
    'İş zekâsı uzmanı',
    'Prompt mühendisi',
  ],
  'E-ticaret / Pazaryeri': [
    'E-ticaret müdürü',
    'E-ticaret uzmanı',
    'Pazaryeri operasyon uzmanı',
    'Kategori yöneticisi',
    'Dijital pazarlama uzmanı',
    'Müşteri başarı uzmanı',
    'Operasyon uzmanı',
    'Ürün yöneticisi',
    'Satış temsilcisi',
    'Lojistik uzmanı',
  ],
  'Finans / Bankacılık': [
    'Finans müdürü',
    'Banka müşteri temsilcisi',
    'Bankacı / banka personeli',
    'Portföy yöneticisi',
    'Şube müdürü',
    'Bölge müdürü',
    'Satış müdürü',
    'Kredi uzmanı',
    'Finans uzmanı',
    'Risk analisti',
    'Hazine uzmanı',
    'Muhasebeci',
    'Mali müşavir yardımcısı',
    'Yatırım danışmanı',
    'Çağrı merkezi operasyon müdürü',
    'Çağrı merkezi müdürü',
    'Operasyon uzmanı',
    'İç kontrol uzmanı',
    'Uyum (compliance) uzmanı',
    'Ofis yöneticisi',
  ],
  Sigorta: [
    'Sigorta müdürü',
    'Sigorta satış uzmanı',
    'Sigorta teknik uzmanı',
    'Hasar uzmanı',
    'Broker',
    'Acente temsilcisi',
    'Underwriter',
    'Poliçe operasyon uzmanı',
    'Müşteri temsilcisi',
    'Saha satış uzmanı',
    'Portföy yöneticisi',
    'Risk değerlendirme uzmanı',
  ],
  'Üretim / Sanayi': [
    'Fabrika müdürü',
    'Üretim müdürü',
    'Üretim işçisi',
    'Fabrika işçisi',
    'Makine operatörü',
    'Kalite kontrol uzmanı',
    'Üretim planlama uzmanı',
    'Bakım teknisyeni',
    'Mühendis (endüstri)',
    'Mühendis (makine)',
    'Mühendis (elektrik)',
    'Vardiya amiri',
    'Depo görevlisi',
    'İş sağlığı ve güvenliği uzmanı',
    'İş sağlığı ve güvenliği (İSG) uzmanı',
    'Kalite kontrol ve güvence uzmanı',
    'Endüstri mühendisi',
    'Makine mühendisi',
    'Ar-Ge / Tasarım mühendisi',
  ],
  'İnşaat / Gayrimenkul': [
    'Proje müdürü',
    'Şantiye şefi',
    'İnşaat işçisi',
    'Mühendis (inşaat)',
    'Mimar',
    'İç mimar',
    'Gayrimenkul danışmanı',
    'Gayrimenkul danışmanı / Değerleme uzmanı',
    'Proje yöneticisi',
    'Teknisyen',
    'Elektrikçi',
    'Tesisatçı',
  ],
  'Lojistik / Depolama': [
    'Lojistik müdürü',
    'Depo müdürü',
    'Operasyon uzmanı',
    'Lojistik planlama uzmanı',
    'Lojistik uzmanı',
    'Tedarik zinciri uzmanı',
    'Tedarik zinciri müdürü / Uzmanı',
    'Depo sorumlusu',
    'Depo görevlisi',
    'Forklift operatörü',
    'Sevkiyat sorumlusu',
    'Sevkiyat ve dağıtım sorumlusu',
    'Kurye / motokurye',
    'Şoför (kamyon / TIR)',
    'Şoför (hafif ticari)',
  ],
  'Perakende / Mağaza': [
    'Bölge müdürü',
    'Mağaza müdürü',
    'Mağaza müdür yardımcısı',
    'Satış danışmanı',
    'Kasiyer',
    'Market personeli',
    'Vitrin sorumlusu',
    'Görsel düzenleme / Vitrin sorumlusu',
    'Depo görevlisi',
    'Müşteri temsilcisi',
  ],
  'Gıda / Restoran': [
    'Restoran müdürü',
    'Şef / mutfak şefi',
    'Aşçı',
    'Aşçı yardımcısı',
    'Garson',
    'Barista',
    'Servis elemanı',
    'Komi',
    'Mutfak personeli',
    'Gıda mühendisi',
    'Barmen / Barmaid',
  ],
  'Turizm / Otelcilik': [
    'Otel müdürü',
    'Ön büro müdürü',
    'Ön büro sorumlusu',
    'Otel resepsiyonisti',
    'Resepsiyonist',
    'Host / hostes',
    'Kat görevlisi',
    'Turizm danışmanı',
    'Rezervasyon uzmanı',
    'Animatör',
  ],
  Sağlık: [
    'Hastane yöneticisi',
    'Klinik sorumlusu',
    'Doktor',
    'Hemşire',
    'Ebe',
    'Sağlık teknikeri',
    'Hasta kabul görevlisi',
    'Hasta bakıcı',
    'Medikal satış temsilcisi',
    'Eczane teknisyeni',
    'Diş teknisyeni',
    'Fizyoterapist',
    'Laboratuvar teknikeri',
    'Ambulans görevlisi',
    'Veteriner teknisyeni',
  ],
  Eğitim: [
    'Okul müdürü',
    'Eğitim koordinatörü',
    'Eğitmen / öğretmen',
    'Akademisyen',
    'Rehber öğretmen',
    'Özel ders öğretmeni',
    'Kurumsal eğitmen',
    'Eğitim danışmanı',
    'İdari personel',
  ],
  'Pazarlama / Reklam': [
    'Pazarlama müdürü',
    'Pazarlama uzmanı',
    'Dijital pazarlama uzmanı',
    'Sosyal medya uzmanı',
    'Marka yöneticisi',
    'İçerik uzmanı',
    'Medya planlama uzmanı',
    'Grafik tasarımcı',
    'Reklam hesap yöneticisi',
    'SEO / SEM uzmanı',
  ],
  'İnsan kaynakları': [
    'İnsan kaynakları müdürü',
    'İK yöneticisi',
    'İnsan kaynakları uzmanı',
    'İşe alım uzmanı',
    'Bordro uzmanı',
    'İK iş ortağı',
    'Eğitim ve gelişim uzmanı',
    'Organizasyonel gelişim uzmanı',
  ],
  'Müşteri hizmetleri': [
    'Müşteri hizmetleri müdürü',
    'Müşteri ilişkileri yöneticisi',
    'Müşteri ilişkileri uzmanı',
    'Müşteri deneyimi yöneticisi',
    'Müşteri temsilcisi',
    'Çağrı merkezi temsilcisi',
    'Çağrı merkezi satış temsilcisi',
    'Müşteri başarı uzmanı',
    'Destek uzmanı',
    'Şikayet yönetimi uzmanı',
  ],
  Satış: [
    'Satış müdürü',
    'Bölge satış müdürü',
    'Saha satış uzmanı',
    'Satış temsilcisi',
    'Satış danışmanı',
    'Key account manager',
    'Hesap yöneticisi',
    'İç satış uzmanı',
    'İş geliştirme uzmanı',
    'Medikal satış temsilcisi',
  ],
  Hukuk: [
    'Hukuk müşaviri',
    'Avukat',
    'Hukuk asistanı',
    'Sözleşme uzmanı',
    'Uyuşmazlık çözüm uzmanı',
    'Şirket avukatı',
  ],
  'Kamu / Belediye': [
    'Müdür',
    'Memur',
    'Uzman',
    'Büro personeli',
    'Proje uzmanı',
    'Vatandaş ilişkileri personeli',
    'İdari işler sorumlusu',
  ],
  Enerji: [
    'Enerji mühendisi',
    'Teknisyen',
    'Proje mühendisi',
    'Saha operasyon uzmanı',
    'Bakım teknisyeni',
    'Satış mühendisi',
  ],
  Otomotiv: [
    'Otomotiv mühendisi',
    'Otomotiv tasarım mühendisi',
    'Servis müdürü',
    'Otomotiv teknisyeni',
    'Servis danışmanı',
    'Satış danışmanı',
    'Yedek parça sorumlusu',
    'Boya / kaporta ustası',
    'Oto yıkama personeli',
  ],
  Tarım: [
    'Çiftçi / tarım işçisi',
    'Ziraat mühendisi',
    'Tarım danışmanı',
    'Sera sorumlusu',
    'Üretim sorumlusu',
    'Veteriner teknisyeni',
  ],
  'Medya / İçerik': [
    'Yayın yönetmeni',
    'İçerik editörü',
    'Sosyal medya uzmanı',
    'Video editörü',
    'Muhabir',
    'Grafik tasarımcı',
    'Topluluk yöneticisi',
  ],
  Danışmanlık: [
    'Yönetim danışmanı',
    'İş analisti',
    'Proje yöneticisi',
    'Strateji danışmanı',
    'Süreç iyileştirme uzmanı',
    'Finansal danışman',
  ],
  'Muhasebe / Mali müşavirlik': [
    'Muhasebe müdürü',
    'Muhasebeci',
    'Mali müşavir yardımcısı',
    'Bordro uzmanı',
    'Finans uzmanı',
    'İç kontrol uzmanı',
    'Büro personeli',
  ],
  'Çağrı merkezi': [
    'Çağrı merkezi müdürü',
    'Çağrı merkezi operasyon müdürü',
    'Çağrı merkezi satış müdürü',
    'Çağrı merkezi takım lideri',
    'Çağrı merkezi süpervizörü',
    'Çağrı merkezi temsilcisi',
    'Çağrı merkezi satış temsilcisi',
    'Müşteri temsilcisi',
    'Destek uzmanı',
    'Şikayet yönetimi uzmanı',
    'Operasyon uzmanı',
    'Teknik destek uzmanı',
    'Müşteri başarı uzmanı',
  ],
  'Tekstil / Hazır giyim': [
    'Üretim işçisi',
    'Makine operatörü',
    'Kalite kontrol uzmanı',
    'Üretim planlama uzmanı',
    'Satış temsilcisi',
    'Depo görevlisi',
  ],
  'Kargo / Kurye': [
    'Kurye / motokurye',
    'Şoför (hafif ticari)',
    'Depo görevlisi',
    'Operasyon uzmanı',
    'Sevkiyat sorumlusu',
  ],
  Havacılık: [
    'Host / hostes',
    'Operasyon uzmanı',
    'Müşteri temsilcisi',
  ],
  'Eczane / İlaç': [
    'Eczane teknisyeni',
    'Medikal satış temsilcisi',
    'Müşteri temsilcisi',
    'Depo görevlisi',
    'Satış temsilcisi',
  ],
  Telekomünikasyon: [
    'Satış temsilcisi',
    'Saha satış uzmanı',
    'Teknik destek uzmanı',
    'Müşteri temsilcisi',
    'Çağrı merkezi temsilcisi',
  ],
  Güvenlik: [
    'Güvenlik görevlisi',
    'Operasyon uzmanı',
    'Vardiya amiri',
    'İdari işler sorumlusu',
  ],
  'Temizlik / Tesis yönetimi': [
    'Temizlik görevlisi',
    'Kat görevlisi',
    'Tesisatçı',
    'Elektrikçi',
    'İdari işler sorumlusu',
  ],
  'Güzellik / Kişisel bakım': [
    'Berber / kuaför',
    'Satış danışmanı',
    'Müşteri temsilcisi',
    'Kasiyer',
  ],
  'Spor / Fitness': [
    'Eğitmen / öğretmen',
    'Kurumsal eğitmen',
    'Satış danışmanı',
    'Resepsiyonist',
  ],
  'Sosyal hizmet / STK': [
    'Uzman',
    'Proje uzmanı',
    'İdari personel',
    'Sosyal medya uzmanı',
  ],
  'İthalat / İhracat': [
    'Operasyon uzmanı',
    'Lojistik uzmanı',
    'Satış temsilcisi',
    'Büro personeli',
    'Tedarik zinciri uzmanı',
  ],
  'Mühendislik / Teknik': [
    'Mühendis (makine)',
    'Mühendis (elektrik)',
    'Mühendis (endüstri)',
    'Mühendis (inşaat)',
    'Teknisyen',
    'Proje mühendisi',
    'Kalite kontrol uzmanı',
  ],
  'Organizasyon / Etkinlik': [
    'Proje yöneticisi',
    'İdari personel',
    'Satış temsilcisi',
    'Grafik tasarımcı',
    'Sosyal medya uzmanı',
  ],
  'Oyun / E-spor': [
    'Yazılım geliştirici',
    'Grafik tasarımcı',
    'Topluluk yöneticisi',
    'İçerik uzmanı',
    'Müşteri temsilcisi',
  ],
  'Savunma sanayi': [
    'Mühendis (makine)',
    'Mühendis (elektrik)',
    'Proje mühendisi',
    'Kalite kontrol uzmanı',
    'Teknisyen',
  ],
  'Kimya / Plastik': [
    'Kalite kontrol uzmanı',
    'Üretim işçisi',
    'Makine operatörü',
    'Gıda mühendisi',
    'İş sağlığı ve güvenliği uzmanı',
  ],
  Madencilik: [
    'Mühendis (endüstri)',
    'Teknisyen',
    'İş sağlığı ve güvenliği uzmanı',
    'Operasyon uzmanı',
    'Şoför (kamyon / TIR)',
  ],
  'Halkla ilişkiler': [
    'Sosyal medya uzmanı',
    'İçerik uzmanı',
    'Pazarlama uzmanı',
    'Grafik tasarımcı',
    'Topluluk yöneticisi',
  ],
  'İdari işler / Ofis': [
    'Büro personeli',
    'Sekreter',
    'Ofis yöneticisi',
    'İdari personel',
    'Çaycı / ofis destek',
    'Muhasebeci',
  ],
  'Holding / Yönetim': [
    'Şube müdürü',
    'Bölge müdürü',
    'Satış müdürü',
    'İK yöneticisi',
    'Ofis yöneticisi',
    'Proje yöneticisi',
    'İnsan kaynakları uzmanı',
    'Finans uzmanı',
    'İdari personel',
  ],
  'Ar-Ge': [
    'Mühendis (endüstri)',
    'Mühendis (makine)',
    'Kalite kontrol uzmanı',
    'Yazılım geliştirici',
    'Veri analisti',
  ],
  'Oto servis / Yetkili servis': [
    'Servis danışmanı',
    'Otomotiv teknisyeni',
    'Bakım teknisyeni',
    'Tamirci / teknik servis',
    'Oto yıkama personeli',
    'Kasiyer',
  ],
  'Elektrik-elektronik': [
    'Mühendis (elektrik)',
    'Elektrik teknisyeni',
    'Elektrikçi',
    'Teknisyen',
    'Kalite kontrol uzmanı',
  ],
  'Demir-çelik / Metal': [
    'Çelik işçisi',
    'Kaynakçı',
    'Torna / freze operatörü',
    'Üretim işçisi',
    'Teknisyen',
  ],
  'Kağıt / Ambalaj': [
    'Üretim işçisi',
    'Makine operatörü',
    'Kalite kontrol uzmanı',
    'Depo görevlisi',
    'Operasyon uzmanı',
  ],
  Mobilya: [
    'Mobilya ustası',
    'Marangoz',
    'Üretim işçisi',
    'Satış danışmanı',
    'Depo görevlisi',
  ],
  'İklimlendirme / Tesisat': [
    'Tesisatçı',
    'Teknisyen',
    'Bakım teknisyeni',
    'Elektrikçi',
    'Mühendis (makine)',
  ],
  'Ulaşım / Şoförlük': [
    'Şoför (hafif ticari)',
    'Şoför (kamyon / TIR)',
    'Şoför (otobüs / minibüs)',
    'Personel servis şoförü',
    'Kurye / motokurye',
  ],
  'Denizcilik / Liman': [
    'Operasyon uzmanı',
    'Lojistik uzmanı',
    'Teknisyen',
    'Depo görevlisi',
    'Şoför (kamyon / TIR)',
  ],
  Gümrük: [
    'Operasyon uzmanı',
    'Lojistik uzmanı',
    'Büro personeli',
    'İdari personel',
  ],
  'Veteriner / Pet': [
    'Veteriner teknisyeni',
    'Satış danışmanı',
    'Müşteri temsilcisi',
    'Kasiyer',
  ],
  'Kreş / Çocuk bakımı': [
    'Eğitmen / öğretmen',
    'İdari personel',
    'Hasta bakıcı',
    'Resepsiyonist',
  ],
  'Çevre / Geri dönüşüm': [
    'İş sağlığı ve güvenliği uzmanı',
    'Operasyon uzmanı',
    'Teknisyen',
    'Şoför (kamyon / TIR)',
  ],
  'Fotoğraf / Prodüksiyon': [
    'Video editörü',
    'Grafik tasarımcı',
    'İçerik uzmanı',
    'Sosyal medya uzmanı',
  ],
  Diğer: [],
};

const POSITIONS_FOR_SECTOR_CACHE = new Map<string, string[]>();
let allTaxonomyPositionsCache: string[] | null = null;
let sectorsByPositionLower: Map<string, string[]> | null = null;

/** Flatten unique positions across sectors (plus legacy JOB_POSITION_OPTIONS consumers). */
export function getAllTaxonomyPositions(): string[] {
  if (allTaxonomyPositionsCache) return allTaxonomyPositionsCache;
  const set = new Set<string>();
  for (const list of Object.values(SECTOR_POSITIONS)) {
    for (const p of list ?? []) set.add(suggestTitleCaseTr(p));
  }
  set.add(MANUAL_OPTION);
  allTaxonomyPositionsCache = sortPositionsPopularThenAz(Array.from(set), [MANUAL_OPTION]);
  return allTaxonomyPositionsCache;
}

function normalizeSectorKey(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

export function getPositionsForSector(sector: string | null | undefined): string[] {
  const key = (sector ?? '').trim();
  const cached = POSITIONS_FOR_SECTOR_CACHE.get(key);
  if (cached) return cached;
  let result: string[];
  if (!key) {
    result = getAllTaxonomyPositions();
  } else {
    let list = SECTOR_POSITIONS[key as SectorKey];
    if (!list) {
      const lowerKey = key.toLocaleLowerCase('tr-TR');
      const normKey = normalizeSectorKey(key);
      const foundEntry = Object.entries(SECTOR_POSITIONS).find(
        ([s]) => {
          const sLower = s.toLocaleLowerCase('tr-TR');
          const sNorm = normalizeSectorKey(s);
          return (
            sLower === lowerKey ||
            sNorm === normKey ||
            sLower.startsWith(lowerKey) ||
            lowerKey.startsWith(sLower) ||
            sNorm.includes(normKey) ||
            normKey.includes(sNorm)
          );
        },
      );
      if (foundEntry) {
        list = foundEntry[1];
      }
    }
    result =
      !list || list.length === 0
        ? [MANUAL_OPTION]
        : sortPositionsPopularThenAz(
            [...(list ?? []).map(suggestTitleCaseTr), MANUAL_OPTION],
            [MANUAL_OPTION],
          );
  }
  POSITIONS_FOR_SECTOR_CACHE.set(key, result);
  return result;
}

function getSectorsByPositionIndex(): Map<string, string[]> {
  if (sectorsByPositionLower) return sectorsByPositionLower;
  const index = new Map<string, string[]>();
  for (const [sector, list] of Object.entries(SECTOR_POSITIONS)) {
    for (const title of list ?? []) {
      const key = title.toLocaleLowerCase('tr-TR');
      const bucket = index.get(key);
      if (bucket) bucket.push(sector);
      else index.set(key, [sector]);
    }
  }
  sectorsByPositionLower = index;
  return index;
}

export function getSectorsForPosition(role: string | null | undefined): string[] {
  const needle = (role ?? '').trim().toLocaleLowerCase('tr-TR');
  if (!needle || isManualCareerOption(needle)) return [];
  const direct = getSectorsByPositionIndex().get(needle);
  if (direct && direct.length > 0) return direct;

  // Substring or alias match
  for (const [posKey, sectors] of getSectorsByPositionIndex().entries()) {
    if (needle.includes(posKey) || posKey.includes(needle)) {
      return sectors;
    }
  }
  return [];
}

const PROFESSIONAL_SKILLS_BY_THEME: Record<string, readonly string[]> = {
  satış: [
    'Müşteri kazanımı',
    'Satış yönetimi',
    'Portföy yönetimi',
    'Saha satış',
    'B2B satış',
    'B2C satış',
    'Key Account Management',
    'İhtiyaç analizi',
    'Müzakere',
    'Hedef yönetimi',
    'Satış sonrası takip',
  ],
  sağlık: [
    'Hasta ilişkileri',
    'Klinik süreçleri',
    'Hasta kabul',
    'Medikal operasyon',
    'Tedavi planlama desteği',
    'Sterilizasyon ve hijyen',
    'Acil müdahale desteği',
    'Hasta kayıt yönetimi',
  ],
  finans: [
    'Kredi analizi',
    'Portföy yönetimi',
    'Finansal analiz',
    'Risk yönetimi',
    'Nakit akışı yönetimi',
    'Bütçe planlama',
    'Raporlama',
    'Uyum / compliance',
  ],
  sigorta: [
    'Poliçe yönetimi',
    'Hasar süreçleri',
    'Risk değerlendirme',
    'Teklif hazırlama',
    'Müşteri portföyü yönetimi',
    'Yenileme yönetimi',
  ],
  yazılım: [
    'Yazılım geliştirme',
    'Kod incelemesi',
    'Agile / Scrum',
    'Sistem tasarımı',
    'API tasarımı',
    'Test otomasyonu',
    'Ürün odaklı düşünme',
    'Dokümantasyon',
  ],
  lojistik: [
    'Depo yönetimi',
    'Sevkiyat planlama',
    'Stok kontrolü',
    'Rota optimizasyonu',
    'Tedarik zinciri koordinasyonu',
    'Operasyon takibi',
  ],
  eğitim: [
    'Müfredat planlama',
    'Sınıf yönetimi',
    'Öğrenci gelişim takibi',
    'Eğitim içerik hazırlama',
    'Ölçme ve değerlendirme',
    'Veli iletişimi',
  ],
  ik: [
    'İşe alım',
    'Mülakat',
    'Bordro süreçleri',
    'Performans yönetimi',
    'Çalışan ilişkileri',
    'Eğitim ve gelişim',
  ],
  pazarlama: [
    'Kampanya yönetimi',
    'Marka yönetimi',
    'İçerik stratejisi',
    'Performans pazarlama',
    'Pazar araştırması',
    'Sosyal medya yönetimi',
  ],
  genel: [
    'İletişim',
    'Problem çözme',
    'Organizasyon',
    'Takım çalışması',
    'Zaman yönetimi',
    'Raporlama',
    'Müşteri odaklılık',
    'Süreç iyileştirme',
    'Proje sorumluluğu',
    'Liderlik',
    'Gönüllü ekip liderliği',
    'Sunum becerileri',
  ],
};

const TECHNICAL_SKILLS_BY_THEME: Record<string, readonly string[]> = {
  satış: ['CRM', 'Salesforce', 'HubSpot', 'SAP', 'Excel', 'Power BI', 'Outlook'],
  muhasebe: ['Logo', 'Mikro', 'Luca', 'Excel', 'SAP', 'e-Fatura', 'Logo Tiger'],
  yazılım: [
    'JavaScript',
    'TypeScript',
    'Python',
    'React',
    'Node.js',
    'SQL',
    'PostgreSQL',
    'Git',
    'Docker',
    'AWS',
  ],
  veri: ['Python', 'SQL', 'Power BI', 'Tableau', 'Excel', 'Pandas', 'Spark'],
  sağlık: ['HIS / Hastane bilgi sistemi', 'PACS', 'Excel', 'Tıbbi cihaz yazılımları'],
  lojistik: ['WMS', 'SAP', 'Excel', 'Barkod sistemleri', 'TMS'],
  pazarlama: ['Google Ads', 'Meta Ads', 'Google Analytics', 'Excel', 'Canva', 'HubSpot'],
  genel: ['Excel', 'Word', 'PowerPoint', 'Outlook', 'Teams', 'Google Workspace'],
};

type PositionBundle = {
  responsibilities: readonly string[];
  achievements: readonly string[];
  professionalSkills: readonly string[];
  technicalSkills: readonly string[];
};

/** Position-first catalogs. Missing roles fall back to sector/theme templates. */
const POSITION_BUNDLES: Record<string, PositionBundle> = {
  Hemşire: {
    responsibilities: [
      'Hasta bakım planının uygulanması',
      'Vital bulguların ölçümü ve kaydı',
      'İlaçların hekim orderına göre uygulanması',
      'Hasta ve yakınlarına bakım eğitimi',
      'Nöbet teslimi ve hemşirelik kaydı',
      'Servis hijyen ve izolasyon kurallarına uyum',
    ],
    achievements: [
      'Hasta bakım kalitesinin artırılması',
      'İlaç hata oranının düşürülmesi',
      'Servis teslim süreçlerinin hızlandırılması',
      'Hasta yakını memnuniyetinin yükseltilmesi',
    ],
    professionalSkills: [
      'Hasta bakımı',
      'İlaç uygulama',
      'Vital takip',
      'Hemşirelik süreci',
      'Hasta eğitimi',
      'Sterilizasyon ve hijyen',
    ],
    technicalSkills: [
      'HIS / Hemşirelik modülü',
      'Vital monitör',
      'İlaç takip sistemi',
      'Excel',
    ],
  },
  Doktor: {
    responsibilities: [
      'Hasta muayenesi ve klinik değerlendirme',
      'Tanı koyma ve tedavi planı oluşturma',
      'Reçete ve tıbbi order yazımı',
      'Konsültasyon ve sevk kararları',
      'Tıbbi belgeleme ve epikriz',
      'Vaka tartışması ve klinik karar desteği',
    ],
    achievements: [
      'Tanı ve tedavi süreçlerinin hızlandırılması',
      'Klinik sonuçların iyileştirilmesi',
      'Gereksiz sevk oranının azaltılması',
      'Multidisipliner vaka yönetiminin güçlendirilmesi',
    ],
    professionalSkills: [
      'Klinik değerlendirme',
      'Tanı',
      'Tedavi planlama',
      'Tıbbi karar verme',
      'Hasta bilgilendirme',
      'Klinik belgeleme',
    ],
    technicalSkills: [
      'HIS / Hekim paneli',
      'PACS',
      'Laboratuvar sonuç sistemleri',
      'E-reçete',
    ],
  },
  Ebe: {
    responsibilities: [
      'Doğum öncesi izlem ve danışmanlık',
      'Doğum sürecinde anne desteği',
      'Yenidoğan ilk bakımının yapılması',
      'Lohusa izlemi ve emzirme desteği',
    ],
    achievements: [
      'Anne memnuniyetinin artırılması',
      'Doğum hazırlık eğitiminin yaygınlaştırılması',
      'Emzirme başarısının yükseltilmesi',
    ],
    professionalSkills: [
      'Doğum desteği',
      'Anne-bebek bakımı',
      'Emzirme danışmanlığı',
      'Prenatal izlem',
    ],
    technicalSkills: ['Doğumhane kayıt sistemi', 'HIS', 'Excel'],
  },
  'Sağlık teknikeri': {
    responsibilities: [
      'Tıbbi cihaz ve birim operasyon desteği',
      'Tetkik / işlem hazırlığı',
      'Hasta güvenliği kontrolleri',
      'Birim kayıtlarının tutulması',
    ],
    achievements: [
      'İşlem bekleme süresinin kısaltılması',
      'Cihaz kullanım verimliliğinin artırılması',
    ],
    professionalSkills: ['Klinik teknik destek', 'Hasta güvenliği', 'Cihaz kullanımı'],
    technicalSkills: ['Tıbbi cihaz yazılımları', 'HIS', 'Excel'],
  },
  'Hasta kabul görevlisi': {
    responsibilities: [
      'Hasta kayıt ve kabul işlemleri',
      'Randevu ve yönlendirme',
      'Sigorta / evrak kontrolü',
      'Hasta yakını bilgilendirme',
    ],
    achievements: [
      'Kabul bekleme süresinin kısaltılması',
      'Kayıt hata oranının düşürülmesi',
    ],
    professionalSkills: ['Hasta kabul', 'Hasta kayıt yönetimi', 'İletişim'],
    technicalSkills: ['HIS / Hasta kabul', 'Excel', 'Outlook'],
  },
  'Hasta bakıcı': {
    responsibilities: [
      'Günlük hasta bakım desteği',
      'Hijyen ve mobilizasyon yardımı',
      'Beslenme ve temel ihtiyaç desteği',
      'Hemşire ile bakım koordinasyonu',
    ],
    achievements: [
      'Hasta konforunun artırılması',
      'Bakım şikayetlerinin azaltılması',
    ],
    professionalSkills: ['Hasta bakımı', 'Hijyen', 'Hasta ilişkileri'],
    technicalSkills: ['HIS temel kayıt', 'Excel'],
  },
  'Medikal satış temsilcisi': {
    responsibilities: [
      'Hekim ve kurum ziyaretlerinin planlanması',
      'Ürün tanıtımı ve numune yönetimi',
      'Sipariş ve teslimat takibi',
      'Saha raporlama',
    ],
    achievements: [
      'Hedef kurum portföyünün büyütülmesi',
      'Ürün satış hacminin artırılması',
    ],
    professionalSkills: ['Medikal satış', 'Saha satış', 'İhtiyaç analizi', 'Müzakere'],
    technicalSkills: ['CRM', 'Excel', 'PowerPoint'],
  },
  'Klinik sorumlusu': {
    responsibilities: [
      'Klinik günlük operasyonun yönetimi',
      'Personel vardiya ve iş dağılımı',
      'Hasta akışı ve randevu planlama',
      'Kalite ve hijyen denetimleri',
    ],
    achievements: [
      'Klinik doluluk ve akışın iyileştirilmesi',
      'Ekip koordinasyonunun güçlendirilmesi',
    ],
    professionalSkills: ['Klinik operasyon', 'Ekip koordinasyonu', 'Süreç yönetimi'],
    technicalSkills: ['HIS', 'Excel', 'Randevu sistemi'],
  },
  'Hastane yöneticisi': {
    responsibilities: [
      'Hastane operasyon ve bütçe takibi',
      'Birimler arası koordinasyon',
      'Kalite ve mevzuat uyumu',
      'Yönetim raporlaması',
    ],
    achievements: [
      'Operasyonel maliyetlerin iyileştirilmesi',
      'Hasta memnuniyet skorunun yükseltilmesi',
    ],
    professionalSkills: ['Sağlık yönetimi', 'Bütçe planlama', 'Liderlik', 'Raporlama'],
    technicalSkills: ['HIS yönetim paneli', 'Excel', 'Power BI'],
  },
  'Eczane teknisyeni': {
    responsibilities: [
      'Reçete hazırlama desteği',
      'İlaç stok ve sayım işlemleri',
      'Hasta ilaç danışmanlığı desteği',
      'Eczane kayıtlarının tutulması',
    ],
    achievements: [
      'Stok sayım doğruluğunun artırılması',
      'Reçete hazırlama süresinin kısaltılması',
    ],
    professionalSkills: ['İlaç hazırlama', 'Stok kontrolü', 'Hasta danışmanlığı'],
    technicalSkills: ['Eczane otomasyonu', 'Excel'],
  },
  'Diş teknisyeni': {
    responsibilities: [
      'Protez ve restorasyon üretimi',
      'Ölçü ve model hazırlığı',
      'Klinik ile teknik koordinasyon',
      'Kalite kontrol',
    ],
    achievements: [
      'Teslim süresinin kısaltılması',
      'Yeniden üretim oranının düşürülmesi',
    ],
    professionalSkills: ['Protez üretimi', 'Ölçü alma desteği', 'Kalite kontrol'],
    technicalSkills: ['CAD/CAM diş yazılımı', 'Excel'],
  },
  Fizyoterapist: {
    responsibilities: [
      'Hasta değerlendirme ve tedavi planı',
      'Egzersiz ve rehabilitasyon uygulaması',
      'İlerleme kaydı ve raporlama',
      'Hasta ev programı eğitimi',
    ],
    achievements: [
      'Fonksiyonel iyileşme sürelerinin kısaltılması',
      'Hasta uyumunun artırılması',
    ],
    professionalSkills: ['Rehabilitasyon', 'Hasta değerlendirme', 'Egzersiz planlama'],
    technicalSkills: ['Rehabilitasyon yazılımı', 'HIS', 'Excel'],
  },
  'Laboratuvar teknikeri': {
    responsibilities: [
      'Numune kabul ve hazırlık',
      'Analizlerin çalışılması',
      'Kalite kontrol ve cihaz bakımı',
      'Sonuç kayıt ve bildirim',
    ],
    achievements: [
      'Sonuç teslim süresinin kısaltılması',
      'Analiz hata oranının düşürülmesi',
    ],
    professionalSkills: ['Laboratuvar analizi', 'Kalite kontrol', 'Numune yönetimi'],
    technicalSkills: ['LIS', 'HIS', 'Excel'],
  },
  'Ambulans görevlisi': {
    responsibilities: [
      'Acil çağrıya intikal',
      'Olay yerinde ilk müdahale',
      'Hasta nakil ve teslim',
      'Vaka formu doldurma',
    ],
    achievements: [
      'Müdahale süresinin kısaltılması',
      'Nakil güvenliğinin artırılması',
    ],
    professionalSkills: ['Acil müdahale', 'Hasta nakli', 'İlk yardım'],
    technicalSkills: ['Ambulans kayıt sistemi', 'HIS'],
  },
  'Veteriner teknisyeni': {
    responsibilities: [
      'Hayvan kabul ve muayene desteği',
      'Aşı ve tedavi uygulaması desteği',
      'Klinik hijyen ve malzeme hazırlığı',
      'Sahip bilgilendirme',
    ],
    achievements: [
      'Klinik randevu akışının hızlandırılması',
      'Aşı takip düzeninin iyileştirilmesi',
    ],
    professionalSkills: ['Veteriner klinik desteği', 'Hayvan bakımı', 'Hijyen'],
    technicalSkills: ['Veteriner klinik yazılımı', 'Excel'],
  },
  'Yazılım geliştirici': {
    responsibilities: [
      'Yazılım özelliklerinin geliştirilmesi',
      'Kod incelemesi ve kalite kontrolü',
      'Hata ayıklama ve performans iyileştirme',
      'Teknik dokümantasyon',
      'Sprint planlama ve tahminleme',
    ],
    achievements: [
      'Özellik yayını ile ölçülebilir etki',
      'Performans / yük iyileştirmesi',
      'Teknik borç azaltımı',
      'Ekip içi kod kalitesinin yükseltilmesi',
    ],
    professionalSkills: [
      'Yazılım geliştirme',
      'Kod incelemesi',
      'Sistem tasarımı',
      'API tasarımı',
      'Agile / Scrum',
    ],
    technicalSkills: [
      'JavaScript',
      'TypeScript',
      'Python',
      'React',
      'Node.js',
      'SQL',
      'Git',
    ],
  },
  'Frontend geliştirici': {
    responsibilities: [
      'Kullanıcı arayüzü geliştirme',
      'Bileşen ve stil sisteminin uygulanması',
      'Erişilebilirlik ve tarayıcı uyumu',
      'Arayüz performans iyileştirme',
    ],
    achievements: [
      'Sayfa yükleme süresinin kısaltılması',
      'Arayüz hata oranının düşürülmesi',
    ],
    professionalSkills: ['Arayüz geliştirme', 'Bileşen tasarımı', 'Kullanıcı odaklı düşünme'],
    technicalSkills: ['JavaScript', 'TypeScript', 'React', 'CSS', 'Git'],
  },
  'Backend geliştirici': {
    responsibilities: [
      'API ve servis geliştirme',
      'Veri modeli ve sorgu iyileştirme',
      'Kimlik doğrulama ve yetkilendirme',
      'Servis izleme ve hata ayıklama',
    ],
    achievements: [
      'API yanıt süresinin iyileştirilmesi',
      'Servis hata oranının düşürülmesi',
    ],
    professionalSkills: ['API tasarımı', 'Sistem tasarımı', 'Kod incelemesi'],
    technicalSkills: ['Node.js', 'Python', 'SQL', 'PostgreSQL', 'Git', 'Docker'],
  },
  'Full-stack geliştirici': {
    responsibilities: [
      'Uçtan uca özellik geliştirme',
      'API tasarımı',
      'Kod incelemesi ve kalite kontrolü',
      'Yazılım özelliklerinin geliştirilmesi',
      'Paydaşlarla teknik iletişim',
    ],
    achievements: [
      'Özellik yayını ile ölçülebilir etki',
      'Otomasyon ile manuel iş yükünün azaltılması',
      'Teslim süresinin kısaltılması',
    ],
    professionalSkills: [
      'Yazılım geliştirme',
      'API tasarımı',
      'Agile / Scrum',
      'Ürün odaklı düşünme',
    ],
    technicalSkills: ['TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker'],
  },
  'Sigorta satış uzmanı': {
    responsibilities: [
      'Müşteri portföyü yönetimi',
      'Yeni müşteri kazanımı',
      'Teklif ve poliçe süreçlerinin takibi',
      'Yenileme ve çapraz satış süreçleri',
      'Müşteri ihtiyaç analizi',
    ],
    achievements: [
      'Satış hedeflerinin üzerinde performans',
      'Yenileme oranının artırılması',
      'Yeni müşteri kazanımında artış',
    ],
    professionalSkills: [
      'Poliçe yönetimi',
      'Müşteri kazanımı',
      'İhtiyaç analizi',
      'Müzakere',
    ],
    technicalSkills: ['CRM', 'Excel', 'Sigorta poliçe yazılımı'],
  },
  'Saha satış uzmanı': {
    responsibilities: [
      'Saha ziyaretlerinin planlanması',
      'Yeni müşteri kazanımı',
      'Satış hedeflerinin gerçekleştirilmesi',
      'Teklif ve sözleşme süreçlerinin takibi',
    ],
    achievements: [
      'Satış hedeflerinin üzerinde performans',
      'Bölgesel satış hacminin artırılması',
      'Yeni müşteri kazanımında artış',
    ],
    professionalSkills: ['Saha satış', 'Müşteri kazanımı', 'Hedef yönetimi', 'Müzakere'],
    technicalSkills: ['CRM', 'Excel', 'Outlook'],
  },
  'Satış temsilcisi': {
    responsibilities: [
      'Müşteri portföyü yönetimi',
      'Yeni müşteri kazanımı',
      'Satış hedeflerinin gerçekleştirilmesi',
      'Müşteri ihtiyaç analizi',
    ],
    achievements: [
      'Satış hedeflerinin üzerinde performans',
      'Müşteri portföyünün büyütülmesi',
    ],
    professionalSkills: ['Satış yönetimi', 'Müşteri kazanımı', 'İhtiyaç analizi', 'Müzakere'],
    technicalSkills: ['CRM', 'Salesforce', 'Excel'],
  },
};

const LEADERSHIP_SKILLS = [
  'Takım çalışması',
  'Organizasyon',
  'Proje sorumluluğu',
  'Liderlik',
  'Gönüllü ekip liderliği',
] as const;

function themeKeysFor(sector: string, role: string): string[] {
  const hay = `${sector} ${role}`.toLocaleLowerCase('tr-TR');
  const keys: string[] = ['genel'];
  if (/satış|key account|ticaret/.test(hay)) keys.push('satış');
  if (/sağlık|hemşire|doktor|klinik|hasta|medikal|eczane/.test(hay)) keys.push('sağlık');
  if (/finans|banka|kredi|muhasebe|mali/.test(hay)) keys.push('finans', 'muhasebe');
  if (/sigorta|poliçe|hasar|broker|segem/.test(hay)) keys.push('sigorta');
  if (/yazılım|bilişim|geliştirici|devops|frontend|backend|full-stack|qa|ürün yöneticisi/.test(hay)) {
    keys.push('yazılım');
  }
  if (/veri|yapay zeka|\bdata\b|\bml\b/.test(hay)) keys.push('veri', 'yazılım');
  if (/çağrı merkezi|müşteri temsil|destek uzman/.test(hay)) keys.push('satış');
  if (/lojistik|depo|sevkiyat|forklift|kurye/.test(hay)) keys.push('lojistik');
  if (/eğitim|öğretmen|akademisyen|eğitmen/.test(hay)) keys.push('eğitim');
  if (/insan kaynak|işe alım|\bik\b|\bhr\b/.test(hay)) keys.push('ik');
  if (/pazarlama|reklam|sosyal medya|marka|seo/.test(hay)) keys.push('pazarlama');
  return Array.from(new Set(keys));
}

function uniqPreserve(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function normalizeRoleKey(role: string): string {
  return role.trim().toLocaleLowerCase('tr-TR');
}

export function getPositionBundle(role: string | null | undefined): PositionBundle | undefined {
  if (!role) return undefined;
  const trimmed = role.trim();
  if (POSITION_BUNDLES[trimmed]) return POSITION_BUNDLES[trimmed];
  const needle = normalizeRoleKey(trimmed);
  for (const [key, bundle] of Object.entries(POSITION_BUNDLES)) {
    if (normalizeRoleKey(key) === needle) return bundle;
  }
  return resolvePositionBundle(trimmed);
}

function withManualOption(values: string[]): string[] {
  return [...uniqPreserve(values.filter((v) => v !== MANUAL_OPTION)), MANUAL_OPTION];
}

const THEME_TO_PROFESSIONAL: Record<string, string> = {
  satis: 'satış',
  saglik: 'sağlık',
  finans: 'finans',
  muhasebe: 'finans',
  yazilim: 'yazılım',
  veri: 'yazılım',
  lojistik: 'lojistik',
  egitim: 'eğitim',
  ik: 'ik',
  pazarlama: 'pazarlama',
};

const THEME_TO_TECHNICAL: Record<string, string> = {
  satis: 'satış',
  saglik: 'sağlık',
  finans: 'muhasebe',
  muhasebe: 'muhasebe',
  yazilim: 'yazılım',
  veri: 'veri',
  lojistik: 'lojistik',
  pazarlama: 'pazarlama',
};

export function suggestProfessionalSkills(input: OccupationalProfileInput): string[] {
  const context = buildOccupationalContext(input);
  const bundle = getPositionBundle(context.role);
  const pool: Array<{ value: string; source: 'bundle' | 'adjacent' | 'theme' | 'office' | 'existing' }> = [];

  for (const value of bundle?.professionalSkills ?? []) {
    pool.push({ value, source: 'bundle' });
  }
  if (context.adjacentStrength > 0) {
    for (const adjacent of adjacentFamilyBundles(context)) {
      const values = [...(adjacent?.professionalSkills ?? [])];
      const limited = context.adjacentStrength === 1 ? values.slice(0, 2) : values;
      for (const value of limited) {
        pool.push({ value, source: 'adjacent' });
      }
    }
  }
  if (!bundle) {
    const themes = occupationalSkillThemes(context);
    for (const theme of themes) {
      const key = THEME_TO_PROFESSIONAL[theme] ?? theme;
      for (const value of PROFESSIONAL_SKILLS_BY_THEME[key] ?? []) {
        pool.push({ value, source: 'theme' });
      }
    }
    if (themes.length === 0) {
      for (const value of PROFESSIONAL_SKILLS_BY_THEME.genel ?? []) {
        pool.push({ value, source: 'theme' });
      }
    }
  } else {
    for (const value of ['İletişim', 'Problem çözme', 'Organizasyon', 'Takım çalışması']) {
      pool.push({ value, source: 'theme' });
    }
  }

  const leadershipSource =
    context.family === null && context.levelSeniority >= 2 ? 'bundle' : 'theme';
  for (const value of LEADERSHIP_SKILLS) {
    pool.push({ value, source: leadershipSource });
  }
  for (const value of context.existingProfessional) {
    pool.push({ value, source: 'existing' });
  }

  return withManualOption(rankOccupationalOptions(pool, context, 'professional'));
}

export function suggestTechnicalSkills(input: OccupationalProfileInput): string[] {
  const context = buildOccupationalContext(input);
  const bundle = getPositionBundle(context.role);
  const pool: Array<{ value: string; source: 'bundle' | 'adjacent' | 'theme' | 'office' | 'existing' }> = [];

  for (const value of bundle?.technicalSkills ?? []) {
    pool.push({ value, source: 'bundle' });
  }
  if (context.adjacentStrength > 0) {
    for (const adjacent of adjacentFamilyBundles(context)) {
      const values = [...(adjacent?.technicalSkills ?? [])];
      const limited = context.adjacentStrength === 1 ? values.slice(0, 1) : values;
      for (const value of limited) {
        pool.push({ value, source: 'adjacent' });
      }
    }
  }
  if (!bundle) {
    const themes = occupationalSkillThemes(context);
    for (const theme of themes) {
      const key = THEME_TO_TECHNICAL[theme] ?? theme;
      for (const value of TECHNICAL_SKILLS_BY_THEME[key] ?? []) {
        pool.push({ value, source: 'theme' });
      }
    }
    if (themes.length === 0) {
      for (const value of TECHNICAL_SKILLS_BY_THEME.genel ?? []) {
        pool.push({ value, source: 'office' });
      }
    }
  }
  for (const value of context.existingTechnical) {
    pool.push({ value, source: 'existing' });
  }

  const ranked = rankOccupationalOptions(pool, context, 'technical');
  return withManualOption(ranked.length > 0 ? ranked : [...(bundle?.technicalSkills ?? [])]);
}

const RESPONSIBILITY_TEMPLATES: Record<string, readonly string[]> = {
  satış: [
    'Müşteri portföyü yönetimi',
    'Yeni müşteri kazanımı',
    'Satış hedeflerinin gerçekleştirilmesi',
    'Teklif ve sözleşme süreçlerinin takibi',
    'Müşteri ihtiyaç analizi',
    'Satış sonrası müşteri yönetimi',
    'Saha ziyaretlerinin planlanması',
    'Raporlama ve hedef takibi',
  ],
  sigorta: [
    'Müşteri portföyü yönetimi',
    'Yeni müşteri kazanımı',
    'Satış hedeflerinin gerçekleştirilmesi',
    'Teklif ve poliçe süreçlerinin takibi',
    'Müşteri ihtiyaç analizi',
    'Satış sonrası müşteri yönetimi',
    'Yenileme ve çapraz satış süreçleri',
  ],
  sağlık: [
    'Hasta kabul ve yönlendirme süreçleri',
    'Klinik / birim operasyon desteği',
    'Hasta ve hasta yakını bilgilendirme',
    'Kayıt ve randevu takibi',
    'Tedavi / bakım süreçlerinde ekip koordinasyonu',
    'Hijyen ve güvenlik kurallarına uyum',
  ],
  yazılım: [
    'Yazılım özelliklerinin geliştirilmesi',
    'Kod incelemesi ve kalite kontrolü',
    'Hata ayıklama ve performans iyileştirme',
    'Teknik dokümantasyon',
    'Sprint planlama ve tahminleme',
    'Paydaşlarla teknik iletişim',
  ],
  finans: [
    'Kredi / finansal dosya incelemesi',
    'Müşteri portföyü takibi',
    'Risk ve uyum kontrolleri',
    'Raporlama ve analiz',
    'Operasyonel süreçlerin yürütülmesi',
    'Şube / birim hedeflerine katkı',
  ],
  lojistik: [
    'Sevkiyat ve depo süreçlerinin takibi',
    'Stok ve envanter kontrolü',
    'Operasyon planlama',
    'Tedarikçi / taşıyıcı koordinasyonu',
    'Termin ve kalite takibi',
  ],
  eğitim: [
    'Ders / eğitim içeriklerinin hazırlanması',
    'Öğrenci gelişiminin takibi',
    'Ölçme ve değerlendirme',
    'Veli / paydaş iletişimi',
    'Eğitim programı koordinasyonu',
  ],
  yonetim: [
    'Departman hedefleri, bütçe ve KPI planlarının yönetilmesi',
    'Ekip performans takibi, koçluk ve gelişim süreçlerinin yürütülmesi',
    'Operasyonel verimlilik ve süreç optimizasyonu',
    'Üst yönetim ve paydaşlara periyodik raporlama',
    'Kritik eskalasyon ve kriz anlarında çözüm yönetimi',
    'Hizmet kalitesi ve kurumsal standartlara uyum denetimi',
  ],
  genel: [
    'Günlük operasyonların yürütülmesi',
    'Ekip içi koordinasyon',
    'Süreç takibi ve raporlama',
    'Müşteri / paydaş iletişimi',
    'Kalite ve süreklilik kontrolü',
    'Proje veya görev sorumluluğu',
  ],
};

const ACHIEVEMENT_TEMPLATES: Record<string, readonly string[]> = {
  satış: [
    'Satış hedeflerinin üzerinde performans',
    'Yeni müşteri kazanımında artış',
    'Bölgesel satış hacminin artırılması',
    'Ekip performansının artırılması',
    'Müşteri portföyünün büyütülmesi',
    'Operasyonel verimlilik artışı',
  ],
  yonetim: [
    'Ekip KPI ve operasyonel hedeflerinin %100+ aşılması',
    'Operasyonel maliyetlerin düşürülmesi ve verimlilik artışı',
    'Müşteri memnuniyet skorlarının hedeflerin üzerine çıkarılması',
    'Personel bağlılığının artırılması ve devir oranının düşürülmesi',
    'Süreç iyileştirme ve otomasyon projelerinin başarıyla tamamlanması',
  ],
  genel: [
    'Operasyonel verimlilik artışı',
    'Süreç iyileştirme katkısı',
    'Müşteri memnuniyetinin artırılması',
    'Proje tesliminin zamanında tamamlanması',
    'Ekip içi bilgi paylaşımı ve mentörlük',
    'Kalite / hata oranında iyileşme',
  ],
  yazılım: [
    'Özellik yayını ile ölçülebilir etki',
    'Performans / yük iyileştirmesi',
    'Teknik borç azaltımı',
    'Otomasyon ile manuel iş yükünün azaltılması',
    'Ekip içi kod kalitesinin yükseltilmesi',
  ],
  sağlık: [
    'Hasta memnuniyetinin artırılması',
    'Süreç bekleme sürelerinde iyileşme',
    'Klinik operasyon verimliliğinin artırılması',
    'Ekip koordinasyonunun güçlendirilmesi',
  ],
};

function templateTheme(sector: string, role: string): string {
  const normalizedRole = (role || '').toLocaleLowerCase('tr-TR');
  if (/müdür|yönetici|direktör|lider|lead|koordinatör|başkan|süpervizör|supervisor|manager|şef/.test(normalizedRole)) {
    return 'yonetim';
  }
  const keys = themeKeysFor(sector, role);
  if (keys.includes('sigorta')) return 'sigorta';
  if (keys.includes('satış')) return 'satış';
  if (keys.includes('sağlık')) return 'sağlık';
  if (keys.includes('yazılım')) return 'yazılım';
  if (keys.includes('finans')) return 'finans';
  if (keys.includes('lojistik')) return 'lojistik';
  if (keys.includes('eğitim')) return 'eğitim';
  return 'genel';
}

export function suggestResponsibilities(input: OccupationalProfileInput): string[] {
  const context = buildOccupationalContext(input);
  const bundle = getPositionBundle(context.role);
  if (bundle) {
    return withManualOption([...bundle.responsibilities]);
  }
  const theme = templateTheme(context.sector, context.role);
  const base = [
    ...(RESPONSIBILITY_TEMPLATES[theme] ?? []),
    ...RESPONSIBILITY_TEMPLATES.genel,
  ];
  return withManualOption(base);
}

export function suggestAchievements(input: OccupationalProfileInput): string[] {
  const context = buildOccupationalContext(input);
  const bundle = getPositionBundle(context.role);
  if (bundle) {
    return withManualOption([...bundle.achievements]);
  }
  const theme = templateTheme(context.sector, context.role);
  const keyed = theme === 'satış' || theme === 'yazılım' || theme === 'sağlık' ? theme : 'genel';
  const base = [
    ...(ACHIEVEMENT_TEMPLATES[keyed] ?? []),
    ...ACHIEVEMENT_TEMPLATES.genel,
  ];
  return withManualOption(base);
}

export const CERTIFICATE_OPTIONS = [
  // Finans / Sigorta
  'SEGEM',
  'SPL Seviye 1',
  'SPL Seviye 2',
  'SPL Seviye 3',
  'BES',
  'SPK Lisansı',
  // İSG
  'İSG A Sınıfı',
  'İSG B Sınıfı',
  'İSG C Sınıfı',
  // Proje / Agile
  'PMP',
  'PRINCE2',
  'Scrum Master',
  'Product Owner',
  // Yazılım
  'AWS Certified',
  'Azure Fundamentals',
  'Google Cloud Associate',
  'Cisco CCNA',
  // Satış / Pazarlama
  'Google Ads Sertifikası',
  'Meta Blueprint',
  'HubSpot Academy',
  // Dil
  'YDS',
  'YÖKDİL',
  'TOEFL',
  'IELTS',
  // Muhasebe
  'SMMM Stajyerlik',
  'e-Defter / e-Fatura eğitimi',
  // Sağlık
  'İlk yardım sertifikası',
  'Hasta kabul sertifikası',
  // Lojistik
  'Forklift operatör belgesi',
  'SRC belgesi',
  // Genel
  'Microsoft Office uzmanlığı',
  'Excel ileri seviye',
  MANUAL_OPTION,
] as const;

const CERTIFICATES_BY_FAMILY: Partial<Record<RoleFamily, readonly string[]>> = {
  factory: ['İSG C Sınıfı', 'İlk yardım sertifikası', 'Forklift operatör belgesi'],
  shiftSupervisor: ['İSG C Sınıfı', 'İSG B Sınıfı', 'İlk yardım sertifikası', 'Forklift operatör belgesi'],
  productionLead: ['İSG B Sınıfı', 'İSG A Sınıfı', 'İlk yardım sertifikası'],
  construction: ['İSG C Sınıfı', 'İlk yardım sertifikası'],
  siteChief: ['İSG B Sınıfı', 'İSG A Sınıfı', 'İlk yardım sertifikası'],
  driver: ['SRC belgesi', 'İlk yardım sertifikası'],
  logistics: ['Forklift operatör belgesi', 'SRC belgesi', 'İlk yardım sertifikası'],
  warehouseLead: ['Forklift operatör belgesi', 'İSG C Sınıfı', 'İlk yardım sertifikası'],
  autoService: ['İlk yardım sertifikası'],
  serviceManager: ['İlk yardım sertifikası'],
  farm: ['İlk yardım sertifikası'],
  farmLead: ['İlk yardım sertifikası', 'İSG C Sınıfı'],
  security: ['İlk yardım sertifikası'],
  beauty: ['İlk yardım sertifikası'],
  kitchen: ['İlk yardım sertifikası'],
  kitchenChef: ['İlk yardım sertifikası'],
  restaurant: ['İlk yardım sertifikası'],
  restaurantManager: ['İlk yardım sertifikası'],
  housekeeping: ['İlk yardım sertifikası'],
  reception: ['İlk yardım sertifikası'],
  host: ['İlk yardım sertifikası'],
  hotelOps: ['İlk yardım sertifikası'],
  retail: ['İlk yardım sertifikası'],
  cashier: ['İlk yardım sertifikası'],
  storeManager: ['İlk yardım sertifikası'],
  callCenter: ['İlk yardım sertifikası'],
  customerSuccess: ['HubSpot Academy'],
  salesIndoor: ['HubSpot Academy', 'Google Ads Sertifikası'],
  salesField: ['HubSpot Academy', 'Google Ads Sertifikası'],
  salesManager: ['HubSpot Academy', 'Google Ads Sertifikası', 'Meta Blueprint'],
  regionalManager: ['HubSpot Academy', 'Google Ads Sertifikası'],
  insuranceOps: ['SEGEM', 'BES'],
  bankFront: ['SEGEM', 'BES'],
  branchManager: ['SEGEM', 'SPL Seviye 1'],
  portfolioManager: ['SPL Seviye 1', 'SPL Seviye 2', 'SPK Lisansı'],
  credit: ['SPL Seviye 1', 'SPL Seviye 2', 'SPK Lisansı'],
  accounting: ['SMMM Stajyerlik', 'e-Defter / e-Fatura eğitimi'],
  software: ['AWS Certified', 'Azure Fundamentals', 'Google Cloud Associate', 'Scrum Master'],
  techLead: ['AWS Certified', 'Scrum Master', 'PMP'],
  devops: ['AWS Certified', 'Azure Fundamentals', 'Google Cloud Associate'],
  qa: ['Scrum Master', 'Azure Fundamentals'],
  data: ['AWS Certified', 'Google Cloud Associate'],
  product: ['Product Owner', 'Scrum Master', 'PMP'],
  design: ['Google Ads Sertifikası'],
  teacher: ['YDS', 'YÖKDİL', 'TOEFL', 'IELTS'],
  schoolPrincipal: ['YDS', 'YÖKDİL'],
  hr: ['PMP'],
  hrManager: ['PMP', 'Scrum Master'],
  marketing: ['Google Ads Sertifikası', 'Meta Blueprint', 'HubSpot Academy'],
  brandManager: ['Google Ads Sertifikası', 'Meta Blueprint'],
  legal: ['YDS', 'YÖKDİL'],
  consulting: ['PMP', 'PRINCE2', 'Scrum Master'],
  admin: ['Microsoft Office uzmanlığı', 'Excel ileri seviye'],
  officeManager: ['Microsoft Office uzmanlığı', 'Excel ileri seviye', 'PMP'],
};

const FRONTLINE_CERT_BAN = new Set([
  'TOEFL',
  'IELTS',
  'YDS',
  'YÖKDİL',
  'SMMM Stajyerlik',
  'e-Defter / e-Fatura eğitimi',
  'Microsoft Office uzmanlığı',
  'Excel ileri seviye',
  'Google Ads Sertifikası',
  'Meta Blueprint',
  'HubSpot Academy',
  'AWS Certified',
  'Azure Fundamentals',
  'Google Cloud Associate',
  'Cisco CCNA',
  'PMP',
  'PRINCE2',
  'Scrum Master',
  'Product Owner',
  'SPL Seviye 1',
  'SPL Seviye 2',
  'SPL Seviye 3',
  'SPK Lisansı',
  'SEGEM',
  'BES',
  'Hasta kabul sertifikası',
]);

function certificatesForFamily(family: RoleFamily | null): string[] {
  if (!family) return [];
  return [...(CERTIFICATES_BY_FAMILY[family] ?? [])];
}

export function suggestCertificates(input: OccupationalProfileInput): string[] {
  const context = buildOccupationalContext(input);
  const existing = parseSelectedList(input.certificates).filter((item) => !isManualCareerOption(item));
  const values: string[] = [...certificatesForFamily(context.family)];
  if (context.adjacentStrength >= 2 && context.family !== 'factory') {
    for (const family of context.adjacentFamilies) {
      values.push(...certificatesForFamily(family).slice(0, 2));
    }
  }
  const bannedFrontline = context.family === 'factory' || context.familySeniority === 0;
  const ranked: string[] = [];
  const seen = new Set<string>();
  for (const value of [...values, ...existing]) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    if (bannedFrontline && FRONTLINE_CERT_BAN.has(trimmed) && !existing.includes(trimmed)) continue;
    seen.add(trimmed);
    ranked.push(trimmed);
  }
  if (ranked.length === 0 && !context.family) {
    ranked.push('İlk yardım sertifikası');
  }
  return withManualOption(ranked);
}

export type CareerLanguageEntry = {
  id: string;
  language: string;
  languageOther?: string;
  level: string;
};

export function createEmptyLanguageEntry(): CareerLanguageEntry {
  return {
    id: crypto.randomUUID(),
    language: '',
    languageOther: '',
    level: '',
  };
}

export function parseCareerLanguages(value: unknown): CareerLanguageEntry[] {
  if (Array.isArray(value)) {
    const rows: CareerLanguageEntry[] = [];
    for (const row of value) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      rows.push({
        id: typeof r.id === 'string' && r.id ? r.id : crypto.randomUUID(),
        language: String(r.language ?? '').trim(),
        languageOther: String(r.languageOther ?? ''),
        level: String(r.level ?? '').trim(),
      });
    }
    return rows;
  }
  if (typeof value === 'string' && value.trim()) {
    // Legacy: "İngilizce — İyi, Almanca — Orta"
    return value
      .split(/[,;]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [lang, level] = part.split(/\s*[—\-–:|]\s*/);
        return {
          id: crypto.randomUUID(),
          language: (lang ?? '').trim(),
          languageOther: '',
          level: (level ?? '').trim(),
        };
      });
  }
  return [];
}

export function serializeCareerLanguages(entries: CareerLanguageEntry[]): string {
  return entries
    .map((e) => {
      const lang =
        e.language === MANUAL_OPTION_SHORT || e.language === MANUAL_OPTION
          ? e.languageOther?.trim()
          : e.language;
      if (!lang || !e.level) return '';
      return `${lang} — ${e.level}`;
    })
    .filter(Boolean)
    .join(', ');
}

export function parseSelectedList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    // Prefer the join delimiter so "Diğer / Kendim gireceğim" is not split on "/".
    if (value.includes(' · ')) {
      return value.split(' · ').map((s) => s.trim()).filter(Boolean);
    }
    if (value === MANUAL_OPTION || value === MANUAL_OPTION_SHORT) {
      return [value];
    }
    return value
      .split(/[,•|\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function joinSelectedList(values: string[]): string {
  return values.map((v) => v.trim()).filter(Boolean).join(' · ');
}
