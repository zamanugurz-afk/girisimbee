import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import type { LegalDocumentBody } from '@/features/legal/lib/legal-document.utils';

export function buildPrivacyDocument(): LegalDocumentBody {
  return {
    meta: LEGAL_DOCUMENT_VERSIONS.privacy,
    intro:
      'Bu Gizlilik Politikası, {{tradeName}} Platformu’nda kişisel verilerin korunmasına ilişkin genel yaklaşımı açıklar. KVKK kapsamındaki zorunlu aydınlatma unsurları “KVKK Aydınlatma Metni”nde yer alır; bu politika onu tamamlar, yerine geçmez.',
    sections: [
      {
        id: 'approach',
        title: '1. Yaklaşımımız',
        paragraphs: [
          '{{legalName}}, Platform hizmetlerini sunarken kişisel verilerin güvenliğini ve gizliliğini önemser. Veriler; hesap yönetimi, ilan yayınlama, güvenlik, destek ve yasal yükümlülükler çerçevesinde işlenir.',
        ],
      },
      {
        id: 'visibility',
        title: '2. Kullanıcı içeriklerinin görünürlüğü',
        paragraphs: [
          'Yayınlanan ilanlar kamuya açık olabilir. Profil alanlarınızın görünürlüğü hesap ayarlarınıza bağlıdır. Doğrulanmış telefon numaranız, ilgili açık rızanız varsa ilan kapsamında görüntülenebilir.',
        ],
      },
      {
        id: 'security',
        title: '3. Güvenlik ve hesap koruması',
        paragraphs: [
          'Erişim kontrolleri, oturum yönetimi ve makul teknik/idari tedbirler uygulanır. Hiçbir sistem mutlak güvenlik vaat edemez; şüpheli durumda {{email}} üzerinden bildirim bekleriz.',
        ],
      },
      {
        id: 'processors',
        title: '4. Üçüncü taraf hizmetler',
        paragraphs: [
          'Kimlik doğrulama, barındırma, ödeme ve e-posta gibi hizmetler için işleyen / sağlayıcı firmalardan yararlanılabilir. Kart verileri ödeme kuruluşu altyapısında işlenir; Platform’un gördüğü ödeme verisi sınırlıdır. Ayrıntılar KVKK Aydınlatma Metni’ndedir.',
        ],
      },
      {
        id: 'retention-rights',
        title: '5. Saklama, silme ve haklar',
        paragraphs: [
          'Veriler, işleme amacı ve yasal saklama yükümlülükleri ile sınırlı tutulur. Hesap silme ve veri talepleri için hesap ayarları ile {{kvkkEmail}} kullanılabilir. İlgili kişi hakları KVKK Aydınlatma Metni’nde listelenir.',
        ],
      },
      {
        id: 'changes',
        title: '6. Değişiklikler ve iletişim',
        paragraphs: [
          'Bu politika güncellenebilir. Yürürlükteki sürüm Platform’da yayınlanır. İletişim: {{email}} · KVKK: {{kvkkEmail}} · Adres: {{kvkkApplicationAddress}}',
        ],
      },
    ],
  };
}
