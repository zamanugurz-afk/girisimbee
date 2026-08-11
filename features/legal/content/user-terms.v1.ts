import { LEGAL_DOCUMENT_VERSIONS } from '@/features/legal/config/legal-documents.config';
import type { LegalDocumentBody } from '@/features/legal/lib/legal-document.utils';

export function buildUserTermsDocument(): LegalDocumentBody {
  return {
    meta: LEGAL_DOCUMENT_VERSIONS.user_terms,
    intro:
      'Bu Kullanıcı Sözleşmesi (“Sözleşme”), {{tradeName}} markası altında işletilen çevrimiçi platformun (“Platform”) kullanım koşullarını düzenler. Veri sorumlusu / işletmeci: {{legalName}}, adres: {{address}}.',
    sections: [
      {
        id: 'purpose',
        title: '1. Amaç ve kapsam',
        paragraphs: [
          'Platform; girişimcilik, yatırım, ortaklık, iş fırsatları, franchise ve dijital / yapay zeka çözümleri alanlarında ilanların yayınlanmasına, keşfedilmesine ve ilan sahipleriyle iletişime geçilmesine aracılık eden bir hizmet ortamıdır.',
          'Bu Sözleşme, Platform’a üye olan veya Platform hizmetlerini kullanan tüm kullanıcılar için geçerlidir.',
        ],
      },
      {
        id: 'definitions',
        title: '2. Tanımlar',
        paragraphs: [
          '“Kullanıcı”: Platform’a kayıt olan veya hizmetlerden yararlanan gerçek / tüzel kişi temsilcisidir. “İlan”: Kullanıcı tarafından oluşturulan içeriktir. “İlan Sahibi”: İlanı yayınlayan kullanıcıdır. “Platform”: {{tradeName}} web uygulaması ve ilişkili teknik hizmetlerdir.',
        ],
      },
      {
        id: 'membership',
        title: '3. Üyelik',
        paragraphs: [
          'Üyelik için doğru, güncel ve eksiksiz bilgi vermeniz gerekir. Bir hesabı başkası adına açıyorsanız bunu yapmaya yetkili olduğunuzu beyan edersiniz. Yanlış veya yanıltıcı kayıt bilgileri hesabın askıya alınmasına yol açabilir.',
        ],
      },
      {
        id: 'account-security',
        title: '4. Hesap güvenliği',
        paragraphs: [
          'Hesap güvenliğiniz (şifre, oturum, cihaz erişimi) size aittir. Yetkisiz erişim şüphesinde derhal destek birimine bildirmeniz beklenir: {{email}}.',
        ],
      },
      {
        id: 'obligations',
        title: '5. Kullanıcı yükümlülükleri',
        paragraphs: [
          'Platform’u yürürlükteki mevzuata, bu Sözleşme’ye ve yayınlanan politikalara uygun kullanırsınız. Başkalarının haklarını ihlal eden, yanıltıcı veya hukuka aykırı faaliyetlerde bulunamazsınız.',
        ],
      },
      {
        id: 'listing-create',
        title: '6. İlan oluşturma',
        paragraphs: [
          'İlan oluşturma, ilgili kategori formları ve yayın öncesi yasal bilgilendirme / açık rıza adımlarına tabidir. Platform, teknik veya güvenlik gerekçesiyle yayın sürecini sınırlayabilir.',
        ],
      },
      {
        id: 'listing-accuracy',
        title: '7. İlan içeriğinin doğruluğu',
        paragraphs: [
          'İlan içeriğinin doğruluğu, güncelliği ve hukuka uygunluğu İlan Sahibi’ne aittir. Platform, kullanıcılar arasında sözleşme akdetmez; aracılık ve teknik altyapı sağlar.',
        ],
      },
      {
        id: 'user-provided-data',
        title: '8. Kullanıcı tarafından sağlanan bilgilerin sorumluluğu',
        paragraphs: [
          'Profil, iletişim, belge, CV ve serbest metin alanlarına girdiğiniz bilgilerin doğruluğundan ve hukuka uygunluğundan siz sorumlusunuz. Özel nitelikli kişisel verileri (sağlık, inanç, sendika vb.) gereksiz yere paylaşmayın; Platform bunları kasıtlı olarak talep etmez.',
        ],
      },
      {
        id: 'investment',
        title: '9. Yatırım ilanları',
        paragraphs: [
          'Yatırım / girişim ilanları kullanıcılar tarafından oluşturulur. {{tradeName}}, sermaye piyasası faaliyeti kapsamında yatırım tavsiyesi, aracılık veya portföy yönetimi hizmeti sunmaz.',
          'Yatırım kararları kullanıcıların kendi değerlendirmesine bağlıdır. Platform, ilanların doğruluğunu her durumda garanti etmez; ancak sahte / yanıltıcı içeriklere karşı makul moderasyon ve güvenlik önlemleri uygular.',
        ],
      },
      {
        id: 'jobs',
        title: '10. İş ilanları',
        paragraphs: [
          'İş ilanlarında işveren / işe alan taraf, ilgili iş ve sosyal güvenlik mevzuatına uygun hareket etmekle yükümlüdür. İş arayanların CV ve belgelerinin paylaşımı, ayrı açık rıza süreçlerine tabidir.',
        ],
      },
      {
        id: 'partnership',
        title: '11. Ortaklık ilanları',
        paragraphs: [
          'Ortaklık teklifleri hukuka ve dürüstlük kurallarına uygun olmalıdır. Ortaklık şartlarının, katkıların ve taahhütlerin doğruluğu İlan Sahibi’ne aittir.',
        ],
      },
      {
        id: 'franchise',
        title: '12. Franchise ilanları',
        paragraphs: [
          'Franchise ilanlarında marka, yatırım tutarı, sözleşme şartları ve bölgesel haklara ilişkin bilgilerin doğruluğu İlan Sahibi’ne aittir. Gerekli izin / lisansların sağlanması İlan Sahibi’nin yükümlülüğündedir.',
        ],
      },
      {
        id: 'digital-ai',
        title: '13. Dijital ve AI hizmetleri',
        paragraphs: [
          'Dijital / AI ürün ve hizmet ilanlarında fonksiyon, fiyat, teslimat ve destek taahhütlerinin gerçeği yansıtması gerekir. Yanıltıcı “yapay zeka” iddiaları yasaktır.',
        ],
      },
      {
        id: 'prohibited',
        title: '14–18. Yasaklı içerikler',
        paragraphs: [
          'Yasaklananlar arasında şunlar yer alır: dolandırıcılık ve sahte ilan; spam; küfür, hakaret, ayrımcılık; yasa dışı ürün/hizmet veya faaliyet; kişisel verilerin izinsiz ifşası; zararlı yazılım; sistemin kötüye kullanımı; yanıltıcı yatırım veya kazanç vaatleri.',
        ],
      },
      {
        id: 'communication',
        title: '19. Kullanıcılar arası iletişim',
        paragraphs: [
          'Platform’un birincil iletişim modeli, ilan üzerinde doğrulanmış telefon ile aramadır. Platform içi mesajlaşma altyapısı ürün yol haritasında yer alabilir; aktif kullanım politikası ürün ayarlarına bağlıdır. Kullanıcılar, iletişimde kişisel verileri gereksiz yere paylaşmamalıdır.',
        ],
      },
      {
        id: 'platform-role',
        title: '20. Platformun rolü',
        paragraphs: [
          'Platform; ilanların yayınlanması, keşfi ve teknik iletişim olanakları için altyapı sunar. Kullanıcılar arasındaki hukuki ilişkilerin tarafı değildir.',
        ],
      },
      {
        id: 'verification',
        title: '21. İlanların doğrulanması',
        paragraphs: [
          'Telefon doğrulama, içerik kalitesi kontrolleri ve moderasyon süreçleri uygulanabilir. Bu kontroller her ilanın maddi doğruluğunu garanti etmez; kullanıcılara makul özen gösterme yükümlülüğü getirir.',
        ],
      },
      {
        id: 'no-advice',
        title: '22. Yatırım tavsiyesi konusu',
        paragraphs: [
          '{{tradeName}} otomatik olarak yatırım tavsiyesi vermez. Platformdaki içerikler bilgilendirme / ilan niteliğindedir; bireysel yatırım kararı kullanıcıya aittir.',
        ],
      },
      {
        id: 'moderation',
        title: '23–27. Moderasyon, kaldırma, askıya alma, kapatma ve itiraz',
        paragraphs: [
          'Platform; politikaya aykırı içerikleri kaldırabilir, hesabı geçici askıya alabilir veya ağır ihlallerde kapatabilir. Kullanıcı, destek kanalı üzerinden itiraz edebilir: {{email}}.',
        ],
      },
      {
        id: 'ugc-ip',
        title: '28–29. Kullanıcı içerikleri ve fikri mülkiyet',
        paragraphs: [
          'Platform’un yazılımı, tasarımı ve markası {{tradeName}} / {{legalName}} haklarına tabidir. İlan içeriğinin fikri mülkiyeti, yasal sınırlar içinde İlan Sahibi’ne aittir; İlan Sahibi, içeriğin Platform’da yayınlanması için gerekli lisansları verdiğini kabul eder.',
        ],
      },
      {
        id: 'third-parties',
        title: '30. Üçüncü taraf bağlantılar',
        paragraphs: [
          'Platform; barındırma, kimlik doğrulama, ödeme ve e-posta gibi üçüncü taraf hizmet sağlayıcılarından yararlanabilir. Bu sağlayıcıların kendi koşulları ayrıca uygulanabilir.',
        ],
      },
      {
        id: 'security-availability',
        title: '31–32. Platform güvenliği ve hizmet kesintileri',
        paragraphs: [
          'Platform, makul teknik güvenlik önlemleri alır. Hizmetin kesintisiz ve hatasız olacağı garanti edilmez; planlı bakım veya arıza durumlarında erişim etkilenebilir.',
        ],
      },
      {
        id: 'liability',
        title: '33. Sorumluluk sınırları',
        paragraphs: [
          'Kanunun emredici hükümleri saklı kalmak kaydıyla, Platform’un sorumluluğu doğrudan ve öngörülebilir zararlarla sınırlıdır. Bu madde, tüketicinin veya ilgili kişinin kanundan doğan haklarını ortadan kaldırmaz. “Hiçbir şekilde sorumlu değiliz” türü blanket feragatler bu Sözleşme’nin parçası değildir.',
        ],
      },
      {
        id: 'law-disputes',
        title: '34–35. Uygulanacak hukuk ve uyuşmazlık',
        paragraphs: [
          'Bu Sözleşme’ye Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda {{address}} mahkemeleri / icra daireleri yetkilidir (kanunen yetkili merciler saklıdır).',
        ],
      },
      {
        id: 'changes-termination',
        title: '36–37. Sözleşme değişiklikleri ve fesih',
        paragraphs: [
          'Platform, Sözleşme’yi güncelleyebilir. Önemli değişikliklerde makul duyuru yapılır. Güncel sürüm Platform’da yayınlandığı tarihten itibaren geçerlidir. Kullanıcı hesabını kapatarak veya Platform’u kullanmayı bırakarak üyeliğini sona erdirebilir; Platform da ihlal halinde üyeliği sona erdirebilir.',
        ],
      },
      {
        id: 'contact',
        title: '38. İletişim',
        paragraphs: [
          'İletişim: {{email}} · Telefon: {{phone}} · KEP: {{kepAddress}} · KVKK başvuruları: {{kvkkEmail}} / {{kvkkApplicationAddress}}',
        ],
      },
    ],
  };
}
