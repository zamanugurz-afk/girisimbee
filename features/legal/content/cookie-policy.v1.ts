import { LEGAL_COOKIE_INVENTORY } from '@/features/legal/config/legal-cookie-inventory.config';
import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import type { LegalDocumentBody } from '@/features/legal/lib/legal-document.utils';

export function buildCookiePolicyDocument(): LegalDocumentBody {
  const rows = LEGAL_COOKIE_INVENTORY.map(
    (c) =>
      `${c.name} — ${c.purpose} (kategori: ${c.category}; süre: ${c.duration}; taraf: ${c.party}; zorunlu: ${c.required ? 'evet' : 'hayır'}).`,
  );

  return {
    meta: LEGAL_DOCUMENT_VERSIONS.cookie_policy,
    intro:
      'Bu Çerez Politikası, {{tradeName}} Platformu’nda kullanılan çerez ve benzeri teknolojileri teknik envantere dayalı olarak açıklar. Kodda bulunmayan analitik / reklam pikselleri bu metne eklenmez.',
    sections: [
      {
        id: 'what',
        title: '1. Çerez nedir?',
        paragraphs: [
          'Çerezler; oturum, güvenlik ve tercihlerin çalışması için cihaza kaydedilebilen küçük veri parçalarıdır.',
        ],
      },
      {
        id: 'inventory',
        title: '2. Mevcut teknik envanter',
        paragraphs: [
          'Aşağıdaki liste kodda tespit edilen çerez / oturum teknolojilerine dayanır:',
          ...rows,
          'Google Analytics, GTM, Meta Pixel, Hotjar, Clarity, Vercel Analytics veya Sentry gibi araçlar şu an entegre değildir; eklendiğinde envanter ve tercih sistemi güncellenir.',
        ],
      },
      {
        id: 'categories',
        title: '3. Kategoriler',
        paragraphs: [
          'Gerekli: oturum ve güvenlik için zorunlu çerezler (rıza aranmaz).',
          'İşlevsel: tema gibi tercihler — varsayılan kapalı; kullanıcı açmadıkça çalıştırılmaz.',
          'Analitik / Pazarlama: şu an aktif script yoktur; ileride eklendiğinde ayrı tercih ve varsayılan kapalı kuralı uygulanır.',
        ],
      },
      {
        id: 'manage',
        title: '4. Tercihlerin yönetimi',
        paragraphs: [
          'Çerez tercihlerini banner veya footer’daki “Çerez Tercihleri” üzerinden değiştirebilirsiniz. Tarayıcı ayarlarından da çerezleri silebilirsiniz; gerekli çerezler kapatılırsa giriş / güvenlik etkilenebilir.',
        ],
      },
      {
        id: 'contact',
        title: '5. İletişim',
        paragraphs: [
          'Sorularınız için: {{email}} · KVKK: {{kvkkEmail}}',
        ],
      },
    ],
  };
}
