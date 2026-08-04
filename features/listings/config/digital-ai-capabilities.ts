/**
 * Digital & AI capability modules — feature-card content for create flow + detail.
 * Each module mirrors the reference pattern: icon + title + rich description.
 */
export interface DigitalAiCapability {
  id: string;
  title: string;
  description: string;
  /** lucide-react icon name */
  icon: DigitalAiCapabilityIcon;
}

export type DigitalAiCapabilityIcon =
  | 'Bot'
  | 'Sparkles'
  | 'Workflow'
  | 'BarChart3'
  | 'Plug'
  | 'ShieldCheck'
  | 'Languages'
  | 'Layers'
  | 'MessageSquare'
  | 'Brain';

export const DIGITAL_AI_CAPABILITIES: DigitalAiCapability[] = [
  {
    id: 'ai-assistant',
    title: 'Yapay Zeka Asistanı',
    description:
      'Süreçlerinize özel AI ajanlar ile soru-cevap, öneri ve görev otomasyonu. Kullanıcı niyetini anlayıp adım adım çözüm üretir.',
    icon: 'Bot',
  },
  {
    id: 'ai-content',
    title: 'AI Destekli İçerik Üretimi',
    description:
      'Başlık ve kısa girdiden metin, özet veya senaryo üretir. Marka tonuna göre düzenlenebilir çıktılar sunar.',
    icon: 'Sparkles',
  },
  {
    id: 'automation',
    title: 'İş Akışı Otomasyonu',
    description:
      'Tekrarlayan operasyonları kural ve tetikleyicilerle otomatikleştirir. Onay, bildirim ve entegrasyon adımlarını bağlar.',
    icon: 'Workflow',
  },
  {
    id: 'analytics',
    title: 'Veri Analitiği & Raporlama',
    description:
      'Ürün, satış veya operasyon verisini panellerde özetler. KPI takibi ve öngörü için hazır metrikler sunar.',
    icon: 'BarChart3',
  },
  {
    id: 'chatbot',
    title: 'Chatbot & Müşteri Desteği',
    description:
      '7/24 yanıt, SSS ve yönlendirme. İnsan desteğine eskalasyon ile müşteri deneyimini hızlandırır.',
    icon: 'MessageSquare',
  },
  {
    id: 'integrations',
    title: 'Entegrasyon & API',
    description:
      'CRM, ERP, e-ticaret ve mesajlaşma araçlarına bağlanır. Webhook ve REST API ile veri akışını yönetir.',
    icon: 'Plug',
  },
  {
    id: 'personalization',
    title: 'Kişiselleştirme & Öneri',
    description:
      'Kullanıcı davranışına göre içerik, ürün veya aksiyon önerir. Segmentasyon ve A/B testleri ile iyileştirir.',
    icon: 'Brain',
  },
  {
    id: 'compliance',
    title: 'Güvenlik & Uyumluluk Etiketleri',
    description:
      'Hassas veri, KVKK ve erişim kurallarını etiketler. Riskli içerik veya işlemler için uyarı ve denetim izi bırakır.',
    icon: 'ShieldCheck',
  },
  {
    id: 'modular-areas',
    title: 'Modüler Alan Yönetimi',
    description:
      'Çözümü departman, lokasyon veya ürün alanına göre ayırır. Her alan kendi kuralları ve görünürlüğüyle yönetilir.',
    icon: 'Layers',
  },
  {
    id: 'i18n',
    title: 'Uluslararası Dil Desteği',
    description:
      'TR, EN ve diğer dillerde arayüz veya içerik sunar. Çok dilli müşteri ve ekip senaryolarına uyum sağlar.',
    icon: 'Languages',
  },
];

export const DIGITAL_AI_CAPABILITY_TITLES = DIGITAL_AI_CAPABILITIES.map((c) => c.title);

export const DIGITAL_AI_CAPABILITY_BY_TITLE = Object.fromEntries(
  DIGITAL_AI_CAPABILITIES.map((c) => [c.title, c]),
) as Record<string, DigitalAiCapability>;

export function resolveDigitalAiCapabilities(
  selected: unknown,
): DigitalAiCapability[] {
  if (!Array.isArray(selected)) return [];
  return selected
    .map((item) => DIGITAL_AI_CAPABILITY_BY_TITLE[String(item)])
    .filter((item): item is DigitalAiCapability => Boolean(item));
}
