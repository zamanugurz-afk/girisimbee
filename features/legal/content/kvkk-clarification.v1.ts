import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import type { LegalDocumentBody } from '@/features/legal/lib/legal-document.utils';

/** KVKK m.10 clarification — informational only, not a consent form. */
export function buildKvkkClarificationDocument(): LegalDocumentBody {
  return {
    meta: LEGAL_DOCUMENT_VERSIONS.kvkk_clarification,
    intro:
      '6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) md. 10 uyarınca hazırlanan bu Aydınlatma Metni bilgilendirme amaçlıdır. Bu metni okumanız açık rıza anlamına gelmez; açık rıza gerektiren işlemler ayrı metinler ve ayrı onaylarla yürütülür.',
    sections: [
      {
        id: 'controller',
        title: '1. Veri sorumlusunun kimliği',
        paragraphs: [
          'Veri sorumlusu: {{legalName}}',
          'Adres: {{address}}',
          'Telefon: {{phone}} · E-posta: {{email}} · KVKK başvuru: {{kvkkEmail}} · KEP: {{kepAddress}}',
          'Başvuru adresi: {{kvkkApplicationAddress}}',
        ],
      },
      {
        id: 'categories',
        title: '2. İşlenen kişisel veri kategorileri',
        paragraphs: [
          'Kimlik: ad, soyad, kullanıcı adı, görünen ad.',
          'İletişim: e-posta, telefon.',
          'Hesap / profil: rol, durum, bio, bağlantı hesapları, görünürlük tercihleri, şirket / pozisyon bilgisi (paylaşıldığı ölçüde).',
          'İlan: başlık, açıklamalar, kategori alanları, şehir / konum, görseller, etiketler, iletişim telefonu.',
          'Belge: iş arayan süreçlerinde CV ve yüklenen belgeler.',
          'İşlem güvenliği / teknik: IP, kullanıcı aracısı, oturum ve güvenlik logları, consent / kabul kayıtları.',
          'Ödeme: ödeme işlemi meta verileri; kart verileri ödeme kuruluşu tarafından işlenir, Platform kart numarası saklamaz.',
          'İletişim kayıtları: destek talepleri ve (ürün olarak etkinse) mesajlaşma içerikleri.',
        ],
      },
      {
        id: 'purposes',
        title: '3. İşleme amaçları',
        paragraphs: [
          'Üyelik oluşturma ve kimlik doğrulama; Platform hizmetlerinin sunulması; ilan yayınlama ve keşif; güvenlik ve kötüye kullanımın önlenmesi; destek; yasal yükümlülüklerin yerine getirilmesi; (ayrı rıza varsa) pazarlama iletişimi.',
        ],
      },
      {
        id: 'legal-bases',
        title: '4. Hukuki sebepler',
        paragraphs: [
          'KVKK md. 5 kapsamında; sözleşmenin kurulması / ifası, hukuki yükümlülük, meşru menfaat (güvenlik, dolandırıcılık önleme — ilgili kişinin temel haklarına zarar vermemek kaydıyla) ve açık rızanın zorunlu olduğu hallerde açık rıza.',
          'Özel nitelikli kişisel veri kasıtlı olarak toplanmaz. Serbest metin veya CV içinde bu tür veri bulunması halinde KVKK md. 6 çerçevesi dikkate alınır; kullanıcıların bu verileri paylaşmaması önerilir.',
        ],
      },
      {
        id: 'collection',
        title: '5. Toplama yöntemleri',
        paragraphs: [
          'Veriler; kayıt ve profil formları, ilan oluşturma, belge yükleme, çerez / oturum teknolojileri, destek kanalları ve (Google OAuth kullanıldığında) kimlik sağlayıcısından gelen sınırlı hesap bilgileri yoluyla elektronik ortamda toplanır.',
        ],
      },
      {
        id: 'transfers',
        title: '6. Aktarım alıcıları ve amaçları',
        paragraphs: [
          'Hizmetin yürütülmesi için: barındırma / veritabanı sağlayıcısı, kimlik doğrulama (Google OAuth), ödeme kuruluşu, e-posta gönderim hizmeti ve yasal zorunluluk halinde yetkili kamu kurumları.',
          'İlan telefonu ve CV / belge paylaşımları, ilgili açık rızalar çerçevesinde diğer kullanıcılara / ilan sahiplerine gösterilebilir.',
        ],
      },
      {
        id: 'abroad',
        title: '7. Yurt dışı aktarım',
        paragraphs: [
          'Bazı hizmet sağlayıcılar yurt dışında veri işleyebilir veya aktarabilir. Sağlayıcı bölgeleri ve KVKK md. 9 kapsamındaki aktarım mekanizmaları (standart sözleşme vb.) şirket / sağlayıcı belgeleriyle doğrulanmaktadır. Doğrulanmamış aktarımlar “Doğrulanacak” statüsündedir; tamamlanmadan “tamamlandı” sayılmaz.',
        ],
      },
      {
        id: 'retention',
        title: '8. Saklama süreleri / kriterleri',
        paragraphs: [
          'Hesap verileri üyelik süresince; ilanlar yayın / silme politikasına göre; consent ve güvenlik kayıtları hukuki ispat ve zamanaşımı süreleri boyunca; yasal zorunluluklar (mali / ticari defter vb.) ilgili mevzuattaki sürelerce saklanır. Süre bitiminde silme, yok etme veya anonimleştirme uygulanır.',
        ],
      },
      {
        id: 'rights',
        title: '9. İlgili kişi hakları (KVKK md. 11)',
        paragraphs: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, işlemenin amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme, yurt içinde / dışında aktarıldığı üçüncü kişileri bilme, eksik / yanlış işlenmişse düzeltilmesini isteme, KVKK’daki şartlarla silinmesini / yok edilmesini isteme, otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme ve kanuna aykırı işlem nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz.',
        ],
      },
      {
        id: 'application',
        title: '10. Başvuru yöntemi',
        paragraphs: [
          'Başvurularınızı {{kvkkEmail}} adresine veya {{kvkkApplicationAddress}} adresine iletebilirsiniz. Kimlik doğrulaması gerekebilir. Başvurular KVKK ve ilgili tebliğlerdeki usule göre yanıtlanır.',
        ],
      },
    ],
  };
}
