import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import type { LegalDocumentBody } from '@/features/legal/lib/legal-document.utils';

/** CONTACT_COMMUNICATION_V1 — iletişim talebi + platform içi mesajlaşma koşulları (KVKK açık rıza değildir). */
export function buildContactCommunicationDocument(): LegalDocumentBody {
  return {
    meta: LEGAL_DOCUMENT_VERSIONS.contact_communication,
    intro:
      'Bu İletişim ve Mesajlaşma Kullanım Koşulları (“Koşullar”), {{tradeName}} Platformu üzerinde ilanlara ilişkin iletişim taleplerinin oluşturulması, değerlendirilmesi ve kabul sonrası mesajlaşmanın yürütülmesine ilişkin kuralları düzenler. İşletmeci: {{legalName}}. Bu belge KVKK Aydınlatma Metni veya açık rıza metni değildir.',
    sections: [
      {
        id: 'purpose',
        title: '1. Amaç ve Kapsam',
        paragraphs: [
          'Bu Koşullar; ilan sahipleriyle güvenli iletişim kurmak isteyen kullanıcıların iletişim talebi göndermesi, ilan sahiplerinin bu talepleri kabul veya reddetmesi ve kabul edilen talepler sonucunda Platform içi mesajlaşmanın başlaması süreçlerini kapsar.',
          'Genel üyelik şartları ayrıca Kullanıcı Sözleşmesi ile; kişisel verilerin işlenmesi KVKK Aydınlatma Metni ve Gizlilik Politikası ile düzenlenir.',
        ],
      },
      {
        id: 'platform-role',
        title: '2. Girişimbee’nin Platformdaki Rolü',
        paragraphs: [
          '{{tradeName}}, ilanların yayınlanması ile kullanıcıların iletişim talebi ve mesajlaşma yoluyla bağlantı kurması için teknik altyapı sağlar.',
          'Platform; taraflar arasındaki hukuki / ticari ilişkinin tarafı değildir, işlem sonucu garanti etmez ve kullanıcılar adına taahhüt üstlenmez. İlan yayınlanmış olması, ilanın veya ilan sahibinin Platform tarafından onaylandığı, doğrulandığı veya tavsiye edildiği anlamına gelmez.',
        ],
      },
      {
        id: 'party-duties',
        title: '3. Kullanıcı ve İlan Sahibinin Sorumlulukları',
        paragraphs: [
          'İlan Sahibi; ilan içeriğinden, kendi beyanlarından, eylemlerinden ve kullanıcılarla yürüttüğü işlemlerden kendi hukuki sorumluluğu çerçevesinde sorumludur.',
          'İletişim talebi gönderen kullanıcı; kendi beyanlarından, mesajlarından, eylemlerinden ve gerçekleştirdiği işlemlerden kendi hukuki sorumluluğu çerçevesinde sorumludur.',
          'Taraflar kendi eylemleri, beyanları ve gerçekleştirdikleri işlemler bakımından kendi hukuki sorumlulukları çerçevesinde hareket eder.',
        ],
      },
      {
        id: 'platform-comms',
        title: '4. Platform Üzerinden Gerçekleştirilen İletişim',
        paragraphs: [
          'İletişim talebi göndermek ve (kabul sonrası) mesajlaşmak için giriş yapmış olmanız ve bu Koşulları kabul etmeniz gerekir. Kendi ilanınıza talep gönderemezsiniz; aktif talep varken mükerrer talep oluşturulamaz.',
          'İlan Sahibi talebi kabul veya reddedebilir. Yalnızca kabul edilen talepler Platform içi konuşma hakkı doğurur. Bekleyen talepler süre sonunda süresi dolmuş sayılabilir.',
        ],
      },
      {
        id: 'contact-data',
        title: '5. Kişisel ve İletişim Bilgileri',
        paragraphs: [
          'İlan sayfalarında İlan Sahibi telefon numarası kamuya açık gösterilmez. Platform, talep veya kabul sonrasında tarafların telefon numarasını otomatik olarak karşı tarafa iletmez.',
          'Taraflar, kendi iradeleriyle mesajlaşma içinde telefon veya diğer iletişim bilgilerini paylaşabilir. Bu paylaşımın sonuçlarından paylaşımı yapan taraf sorumludur.',
        ],
      },
      {
        id: 'fraud',
        title: '6. Dolandırıcılık ve Şüpheli İletişim',
        paragraphs: [
          'Kullanıcılar; para, banka, kimlik veya güvenlik bilgilerini paylaşmadan önce karşı tarafı ve işlemi kendileri doğrulamalıdır. Platform, taraflar arasındaki iletişimin veya sonrasında gerçekleşebilecek işlemlerin sonucunu garanti etmez.',
          'Şüpheli içerikler {{email}} üzerinden bildirilebilir. Platform, makul ölçüde inceleme ve müdahale yetkilerini saklı tutar.',
        ],
      },
      {
        id: 'prohibited',
        title: '7. Yasaklı Kullanımlar',
        paragraphs: [
          'Spam, taciz, tehdit, dolandırıcılık, kimlik taklidi, yasa dışı faaliyet teklifi ve Platform güvenliğini zedeleyen davranışlar yasaktır. İhlalde talep / konuşma sınırlandırılabilir veya hesap askıya alınabilir.',
        ],
      },
      {
        id: 'message-nature',
        title: '8. Mesajların ve İletişimlerin Niteliği',
        paragraphs: [
          'Mesajlar kullanıcılar arasında özel iletişim niteliğindedir. Platform, mesajları otomatik olarak üçüncü kişilere ifşa etmez; güvenlik, hukuki zorunluluk veya kötüye kullanım incelemesi istisnaları saklıdır.',
          'Yazışmalardaki beyanların doğruluğu ilgili kullanıcıya aittir. Platform, yazışma içeriğinin doğruluğunu veya hukuki sonuçlarını garanti etmez.',
        ],
      },
      {
        id: 'investment',
        title: '9. Yatırım / Ticari İşlem Riskleri',
        paragraphs: [
          'Yatırım, ortaklık, franchise, iş ve dijital / AI ilanları kullanıcılar tarafından oluşturulur. {{tradeName}} yatırım tavsiyesi vermez; sermaye piyasası aracılığı veya portföy yönetimi sunmaz.',
          'Platform üzerinde bir ilanın yayınlanması, ilan sahibinin, ilan içeriğinin veya yatırım / ticari fırsatın Platform tarafından onaylandığı, doğrulandığı veya tavsiye edildiği anlamına gelmez. Ödeme, ortaklık veya yatırım kararlarından önce gerekli incelemeleri yapmak kullanıcının sorumluluğundadır.',
        ],
      },
      {
        id: 'off-platform',
        title: '10. Platform Dışı İletişim ve İşlemler',
        paragraphs: [
          'Platform dışı iletişim, ödeme ve sözleşmeler tarafların kendi sorumluluk alanındadır. Platform, Platform dışında kurulan ilişkilerin tarafı değildir.',
        ],
      },
      {
        id: 'security-powers',
        title: '11. Platform Güvenliği ve Müdahale Yetkileri',
        paragraphs: [
          'Platform, makul teknik ve idari güvenlik önlemleri alır; kötüye kullanım, spam veya güvenlik ihlali şüphesinde talepleri / konuşmaları sınırlandırabilir, hesapları askıya alabilir veya gerekli bildirimleri yapabilir.',
          'İnternet ortamındaki risklerin tamamen ortadan kaldırılamayacağını taraflar kabul eder.',
        ],
      },
      {
        id: 'kvkk-ref',
        title: '12. Kişisel Verilerin Korunması',
        paragraphs: [
          'İletişim talebi ve mesajlaşma süreçlerinde işlenen kişisel veriler; KVKK Aydınlatma Metni ve Gizlilik Politikası kapsamında, talebin yürütülmesi, güvenlik ve yasal yükümlülükler amacıyla işlenir.',
          'Bu Koşulların kabulü, KVKK aydınlatması veya açık rıza yerine geçmez. Veri hakları için {{email}} / {{kvkkEmail}} üzerinden başvuru yapılabilir.',
        ],
      },
      {
        id: 'acceptance',
        title: '13. Kullanıcı Kabulü',
        paragraphs: [
          'İletişim talebi gönderirken veya talebi kabul ederken bu Koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Kabul; kullanıcı, belge anahtarı, sürüm, zaman ve kaynak bilgisiyle kaydedilebilir.',
        ],
      },
      {
        id: 'statutory',
        title: '14. Kanundan Doğan Hak ve Yükümlülüklerin Saklılığı',
        paragraphs: [
          'Bu Kullanım Koşulları Girişimbee’nin kanundan doğan yükümlülüklerini ortadan kaldırmaz. Tüketicinin ve ilgili kişinin zorunlu mevzuattan doğan hakları saklıdır.',
          'İletişim: {{email}} · Telefon: {{phone}} · KEP: {{kepAddress}}',
        ],
      },
    ],
  };
}
