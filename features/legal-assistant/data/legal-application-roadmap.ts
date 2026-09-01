import type { SectorLegalRoadmap } from '../types/legal-assistant.types';

export const LEGAL_APPLICATION_ROADMAPS: Record<string, SectorLegalRoadmap> = {
  // ================= 1. SİGORTA ACENTESİ (2026 GÜNCEL) =================
  'sigorta-acentesi': {
    sectorId: 'sigorta-acentesi',
    sectorName: 'Sigorta Acentesi',
    emoji: '🛡️',
    categoryGroup: 'Finans & Hizmet',
    totalEstimatedLegalCost: 174500,
    estimatedTotalDays: '18 - 25 İş Günü',
    statutoryCapitalRequirement: {
      amount: 4149275,
      description: 'SEDDK 2026 Tebliği uyarınca Acente Levhasına kayıt için asgari ödenmiş sermaye veya mal varlığı şartı.',
      legalRef: 'Sigorta Acenteleri Yönetmeliği Madde 9 (SEDDK 2026)',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'MERSİS & Ticaret Sicil Limited Şirket Kuruluşu',
        institution: 'Ticaret Sicil Müdürlüğü / MERSİS',
        applicationChannel: 'Online Portal',
        portalUrl: 'https://mersis.gtb.gov.tr',
        estimatedCost: 42000,
        durationDays: '2 - 3 Gün',
        legalBasis: '6102 sayılı TTK ve Sigortacılık Kanunu Madde 32',
        proTips: 'Ana sözleşmeye sigortacılık dışı hiçbir ticari faaliyet (örn: danışmanlık, emlak vb.) eklemeyiniz; aksi takdirde TOBB/SAİK başvurunuz doğrudan reddedilir.',
        requiredDocuments: [
          {
            id: 'doc_sigorta_ana_sozlesme',
            name: 'Münhasıran Sigortacılık Amaçlı Şirket Ana Sözleşmesi',
            format: 'E-İmza',
            isDownloadableTemplate: true,
            templateFileName: 'sigorta_acentesi_ana_sozlesme.pdf',
            proTip: 'Şirket unvanında mutlaka "Sigorta Aracılık Hizmetleri Limited Şirketi" ibaresi bulunmalı ve faaliyet konusu münhasıran sigortacılık olarak kilitlenmelidir. Sigorta dışı başka hiçbir faaliyet yazılmamalıdır.',
            templateContent: {
              title: 'T.C. TİCARET BAKANLIĞI - MERSİS LİMİTED ŞİRKET ANA SÖZLEŞMESİ',
              authority: 'İstanbul Ticaret Sicil Müdürlüğü / MERSİS No: 0-7810-9281-0001',
              docType: 'Münhasıran Sigortacılık Kurucu Ana Sözleşmesi',
              summary: '6102 sayılı Türk Ticaret Kanunu ve 5684 sayılı Sigortacılık Kanunu hükümleri çerçevesinde kurulmuş limited şirket ana sözleşmesi örnek taslağıdır.',
              sections: [
                {
                  heading: 'Madde 1 - Şirketin Unvanı',
                  body: 'Şirketin ticaret unvanı "[ŞİRKET UNVANI] SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ"dir.',
                },
                {
                  heading: 'Madde 2 - Amaç ve Faaliyet Konusu',
                  body: 'Şirketin tek ve münhasır amacı Türkiye\'de kurulmuş veya kurulacak sigorta şirketlerinin acenteliğini yapmaktır. Şirket konusu dışında hiçbir ticari, mali veya sınai faaliyette bulunamaz.',
                },
                {
                  heading: 'Madde 3 - Şirket Sermayesi ve Paylar',
                  body: 'Şirketin sermayesi SEDDK 2026 Tebliğine uygun olarak 4.149.275 TL (Dört Milyon Yüz Kırk Dokuz Bin İki Yüz Yetmiş Beş Türk Lirası) değerindedir.',
                },
                {
                  heading: 'Madde 4 - Şirketin İdaresi ve Temsili',
                  body: 'Şirket müdürü olarak SEGEM teknik personel yeterliliğine ve 4 yıllık lisans mezuniyeti sonrası en az 2 yıl sigortacılık deneyimine sahip şirket ortağı münferiden temsil ve ilzama yetkilidir.',
                },
              ],
              signers: ['Kurucu Ortak (İmza)', 'Acente Müdürü (İmza)', 'Ticaret Sicil Tasdik Memuru (Mühür)'],
              legalDisclaimer: 'Bu taslak resmi MERSİS sistemine girilerek e-imza ile imzalanmalı ve Ticaret Sicil Müdürlüğü tarafından tescil edilmelidir.',
            },
          },
          {
            id: 'doc_sigorta_imza_beyan',
            name: 'Kurucu Ortakların Kimlik ve İmza Beyannameleri',
            format: 'Noter Onaylı',
            isDownloadableTemplate: true,
            templateFileName: 'kurucu_ortak_imza_beyani.pdf',
            proTip: 'Ortakların yeni çipli T.C. kimlik kartları ve noterden alınmış imza tescil beyannamesi gerekir. Kurucu ortakların yüz kızartıcı suçlardan adli sicil kaydı bulunmamalıdır.',
            templateContent: {
              title: 'T.C. NOTERLİĞİ - İMZA BEYANNAMESİ VE TESCİL BELGESİ',
              authority: 'Kadıköy 12. Noterliği - Yevmiye No: 2026/18492',
              docType: 'Şirket Müdürü & Kurucu Ortak Resmi İmza Beyanı',
              summary: 'Limited şirket kuruluşunda ticaret unvanı altına atılacak şirket müdürü tatbiki imza örneklerini ve kimlik tasdikini içerir.',
              sections: [
                {
                  heading: 'Kimlik Bilgileri',
                  body: 'T.C. Kimlik No: [11 Haneli TC] | Ad Soyad: [Kurucu Ortak] | İkametgah: İstanbul/Kadıköy',
                },
                {
                  heading: 'Tatbiki İmza Örnekleri',
                  body: 'Aşağıda şirket unvanı altında münferit yetkiyle atacağım 3 adet tatbiki imzamın şahsıma ait olduğunu beyan ve tasdik ederim.',
                },
              ],
              signers: ['Beyanda Bulunan (3 Adet Tatbiki İmza)', 'Noter Başkatibi (Mühür & İmza)'],
              legalDisclaimer: 'İmza beyannamesi tescil talepnamesiyle birlikte Ticaret Sicil memurluğuna ibraz edilir.',
            },
          },
          {
            id: 'doc_sigorta_kira_kontrat',
            name: 'Kira Kontratı veya Tapu Fotokopisi (Müstakil Ofis)',
            format: 'PDF',
            isDownloadableTemplate: true,
            templateFileName: 'ticari_kira_sozlesmesi.pdf',
            proTip: 'Acentelik yapılacak mekanın bağımsız bir girişe sahip olması, başka bir ticari işletmeyle (örn: emlakçı, oto galeri) aynı kapıyı paylaşmaması ve tabela asılabilir olması şarttır.',
            templateContent: {
              title: 'TİCARİ KİRA SÖZLEŞMESİ & NUMARATAJ BELGESİ',
              authority: 'Gelir İdaresi Başkanlığı Onaylı Standart Kira Sözleşmesi',
              docType: 'Ticari İşyeri Kira Kontratı',
              summary: 'Acentelik ofisi olarak kullanılacak bağımsız işyerinin kira şartlarını ve damga vergisi tahakkukunu içerir.',
              sections: [
                {
                  heading: 'Kiralanan Taşınmaz Bilgileri',
                  body: 'Adres: Kadıköy/İstanbul | Kullanım Amacı: Sigorta Acenteliği ve İdari Ofis | Net Kullanım Alanı: 45 m²',
                },
                {
                  heading: 'Özel Şartlar ve İzinler',
                  body: 'Kiracı, işyeri dış cephesine mevzuata uygun acentelik tabelası asmaya, güvenlik kamerası ve çelik evrak kasası montajı yapmaya yetkilidir.',
                },
              ],
              signers: ['Kiraya Veren (Mal Sahibi)', 'Kiracı (Acente Müdürü)', 'Kefil'],
              legalDisclaimer: 'Kira kontratının damga vergisi Dijital Vergi Dairesi üzerinden 15 gün içinde yatırılmalıdır.',
            },
          },
          {
            id: 'doc_sigorta_rekabet_dekont',
            name: 'Rekabet Kurumu Payı ve Sicil Harç Dekontu',
            format: 'PDF',
            proTip: 'Sermayenin onbinde dördü (%0,04) oranındaki Rekabet Kurumu payı tescil öncesinde anlaşmalı bankalara veya online MERSİS tahsilat ekranından yatırılmalı ve dekont sisteme eklenmelidir.',
          },
        ],
        processGuide: [
          'MERSİS sisteminden ana sözleşme hazırlanırken şirket unvanında mutlaka "Sigorta Aracılık Hizmetleri Limited Şirketi" ibaresi bulunmalı ve faaliyet konusu münhasıran sigortacılık olarak kilitlenmelidir.',
          'Ticaret Sicil randevusu alınarak şirket tescili ve Ticaret Sicil Gazetesi ilanı tamamlanır.',
          'Yetkili acente müdürü için imza sirküleri noterden çıkartılır.',
        ],
      },
      {
        stepNumber: 2,
        title: 'Vergi Dairesi Mükellefiyet & Fiili Yoklama',
        institution: 'Gelir İdaresi Başkanlığı / İnteraktif Vergi Dairesi',
        applicationChannel: 'Online Portal',
        portalUrl: 'https://dijital.gib.gov.tr',
        estimatedCost: 3500,
        durationDays: '1 - 2 Gün',
        legalBasis: '213 sayılı VUK Madde 153',
        proTips: 'Yoklama memuru geldiğinde işyerinde dış cephe tabelasının asılı olması ve acente müdürünün bizzat bulunması süreci 1 günde onaylatır.',
        requiredDocuments: [
          {
            id: 'doc_vergi_ise_baslama',
            name: 'İşe Başlama Bildirimi Formu',
            format: 'E-İmza',
            proTip: 'Dijital Vergi Dairesi üzerinden işe başlama bildirimi yapılırken NACE Kodu: 66.22.01 (Sigorta Acentelerinin Faaliyetleri) seçilmelidir.',
          },
          {
            id: 'doc_vergi_sicil_tasdik',
            name: 'Ticaret Sicil Tasdiknamesi & Sicil Gazetesi',
            format: 'PDF',
            proTip: 'Ticaret sicil müdürlüğünden onaylı tasdikname taranarak sisteme yüklenir; şirketin aktif tescilini kanıtlar.',
          },
          {
            id: 'doc_vergi_damga_vergisi',
            name: 'Kira Sözleşmesi ve Damga Vergisi Tahakkuku',
            format: 'PDF',
            proTip: 'Kira kontratının damga vergisi tahakkuk fişi ve ödendi makbuzu yoklama memuruna ibraz edilmek üzere dosyada hazır tutulmalıdır.',
          },
          {
            id: 'doc_vergi_imza_sirkuleri',
            name: 'Müdür Noter Onaylı İmza Sirküleri',
            format: 'Noter Onaylı',
            proTip: 'Şirket adına resmi işlem yapmaya yetkili müdürün noter onaylı imza sirküleri vergi dairesi dosyasına eklenir.',
          },
        ],
        processGuide: [
          'Dijital Vergi Dairesi üzerinden işe başlama bildirimi gönderilir ve vergi kimlik numarası tescil edilir.',
          'Yoklama memuru fiziki adrese gelmeden önce dış tabela, masa ve bilişim donanımları hazır vaziyette olmalıdır.',
          'Yoklama fişi imzalandıktan sonra e-Tebligat ve İnternet Vergi Dairesi şifresi aktifleşir.',
        ],
      },
      {
        stepNumber: 3,
        title: 'SEDDK Mesleki Sorumluluk Sigortası (MSS)',
        institution: 'Ruhsatlı Sigorta Şirketleri / SEDDK Denetimi',
        applicationChannel: 'Online Portal',
        portalUrl: 'https://www.seddk.gov.tr',
        estimatedCost: 30000,
        durationDays: '1 Gün',
        legalBasis: 'Sigorta Acenteleri Yönetmeliği Madde 10',
        proTips: 'Poliçenin başlangıç tarihini TOBB başvuru gününden önceye aldırın; poliçe süresi 1 yıllık ve teminatı asgari 1.500.000 TL olmalıdır.',
        requiredDocuments: [
          {
            id: 'doc_mss_police',
            name: 'Yıllık Mesleki Sorumluluk Poliçesi (Asgari 1.500.000 TL Teminatlı)',
            format: 'PDF',
            proTip: 'Poliçede lehtar olarak TOBB / SAİK gösterilmeli ve mesleki ihmal, kusur ve temerrüt klozu bulunmalıdır.',
          },
          {
            id: 'doc_mss_makbuz',
            name: 'Poliçe Prim Tahsilat & Ödeme Makbuzu',
            format: 'PDF',
            proTip: 'Poliçe priminin peşin veya ilk taksidinin ödendiğini gösterir banka dekontu TOBB başvuru portalına yüklenir.',
          },
        ],
        processGuide: [
          'Ruhsatlı bir sigorta şirketinden mesleki kusur ve ihmallere karşı zorunlu teminat içeren Mesleki Sorumluluk Sigortası düzenletilir.',
          'Poliçede TOBB / SAİK lehdar gösterilmelidir.',
        ],
      },
      {
        stepNumber: 4,
        title: 'TOBB / SAİK Levha Kayıt & Tescil Başvurusu',
        institution: 'Türkiye Odalar ve Borsalar Birliği / Sigorta Acenteleri İcra Komitesi',
        applicationChannel: 'Online Portal',
        portalUrl: 'https://sigorta.tobb.org.tr',
        estimatedCost: 85000,
        durationDays: '10 - 15 Gün',
        legalBasis: '5684 sayılı Sigortacılık Kanunu Madde 23',
        proTips: 'Müdür olarak atanacak kişinin SEGEM teknik personel belgesine ve 4 yıllık lisans mezuniyeti sonrası en az 2 yıl sigortacılık mesleki deneyimine sahip olması şarttır.',
        requiredDocuments: [
          {
            id: 'doc_tobb_sermaye_blokaj',
            name: '4.149.275 TL Asgari Sermaye Banka Blokajı / YMM Raporu',
            format: 'Asıl Belge',
            proTip: 'Banka şubesinden alınacak "Sermaye bloke mektubu" veya Yeminli Mali Müşavir (YMM) onaylı sermaye tespit raporunun aslı teslim edilmelidir.',
          },
          {
            id: 'doc_tobb_segem_diploma',
            name: 'Acente Müdürü SEGEM Belgesi ve 4 Yıllık Üniversite Diploması',
            format: 'Noter Onaylı',
            proTip: 'Müdürün SEGEM Teknik Personel Sertifikası ve e-Devlet/Noter onaylı lisans diploması dosyaya eklenir.',
          },
          {
            id: 'doc_tobb_sgk_deneyim',
            name: 'Acente Müdürü 2 Yıl Sektörel Deneyim Hizmet Dökümü (SGK)',
            format: 'PDF',
            proTip: 'SGK Barkodlu Hizmet Dökümünde meslek kodunun sigortacılık alanında en az 720 prim günü olması kontrol edilir.',
          },
          {
            id: 'doc_tobb_mekan_foto',
            name: 'Fiziki Mekan Uygunluk Beyanı & İç/Dış Fotoğraflar',
            format: 'PDF',
            proTip: 'Dış tabela, çelik para kasası, çalışma masaları ve arşiv dolabını gösteren 4 adet yüksek çözünürlüklü fotoğraf eklenmelidir.',
          },
        ],
        processGuide: [
          'TOBB Sigortacılık Portalı üzerinden online başvuru formu doldurulur ve evraklar sisteme yüklenir.',
          'Evrakların asılları ve onaylı kopyaları bağlı bulunulan Ticaret Odası Sigortacılık Birimine elden teslim edilir.',
          'SAİK komisyonu incelemesi sonrası onaylanan acente Levha Kayıt Numarası alır.',
        ],
      },
      {
        stepNumber: 5,
        title: 'Belediye İşyeri Açma ve Çalışma Ruhsatı',
        institution: 'Yetkili İlçe Belediyesi Ruhsat ve Denetim Müdürlüğü',
        applicationChannel: 'Fiziki Başvuru',
        portalUrl: 'https://www.turkiye.gov.tr',
        estimatedCost: 14000,
        durationDays: '3 - 5 Gün',
        legalBasis: 'İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik',
        proTips: 'Yangın söndürme tüpü TSE onaylı 6kg ABC tipi olmalı ve acil çıkış levhaları fosforlu/ışıklı olarak kapı üstüne yerleştirilmelidir.',
        requiredDocuments: [
          {
            id: 'doc_belediye_ruhsat_formu',
            name: 'İşyeri Açma ve Çalışma Ruhsatı Başvuru Beyan Formu',
            format: 'PDF',
            isDownloadableTemplate: true,
            templateFileName: 'belediye_ruhsat_basvuru_formu.pdf',
            proTip: 'İlçe Belediyesi Ruhsat Müdürlüğü matbu beyannamesi doldurularak imza sirküleri ve vergi levhası fotokopisiyle sunulur.',
            templateContent: {
              title: 'T.C. KADIKÖY BELEDİYE BAŞKANLIĞI - RUHSAT VE DENETİM MÜDÜRLÜĞÜ',
              authority: 'İşyeri Açma ve Çalışma Ruhsatları Servisi - Başvuru Kayıt: 2026/RUH-8392',
              docType: 'Sıhhi Müessese İşyeri Açma ve Çalışma Ruhsatı Başvuru Beyannamesi',
              summary: 'İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik uyarınca belediye denetim ve ruhsatlandırma beyan evrakıdır.',
              sections: [
                {
                  heading: '1. İşyeri ve İşletmeci Tanımı',
                  body: 'Ticaret Unvanı: [Acente Unvanı] Ltd. Şti. | Faaliyet Konusu: Sigorta Acenteliği ve İdari Ofis | Adres: Kadıköy/İstanbul',
                },
                {
                  heading: '2. Mekan ve Yangın Güvenliği Standartları',
                  body: 'Net Kullanım Alanı: 45 m² | Yangın Tüpü: 1 Adet 6kg ABC Kuru Kimyevi Tozlu (TSE/CE Belgeli) | Kat Mülkiyeti Durumu: İskanlı Ticari Bağımsız Bölüm',
                },
                {
                  heading: '3. Yasal Taahhütname',
                  body: 'Beyan ettiğim hususların doğruluğunu, aksi tespit edildiğinde 1608 sayılı Kanun uyarınca işyerimin mühürlenerek faaliyetten men edilmesini peşinen kabul ederim.',
                },
              ],
              signers: ['İşletmeci / Şirket Müdürü (İmza)', 'Zabıta Denetim Memuru (İmza)', 'Ruhsat ve Denetim Müdürü (Onay & Mühür)'],
              legalDisclaimer: 'Ruhsat belgesi düzenlendikten sonra işyerinde görünür bir yere asılmak zorundadır.',
            },
          },
          {
            id: 'doc_belediye_itfaiye_raporu',
            name: 'İtfaiye Yangın ve Tahliye Önlem Raporu',
            format: 'Asıl Belge',
            proTip: '6kg yangın tüpünün bakım kartı ve son 6 ay içinde kesilmiş dolum faturası itfaiye görevlisine ibraz edilir.',
          },
          {
            id: 'doc_belediye_iskan_tapu',
            name: 'Tapu / İskan Belgesi & Numarataj',
            format: 'PDF',
            proTip: 'Binanın yapı kullanım izin belgesi (İskan) ve belediye numarataj servisinden alınmış güncel resmi kapı numarası belgesi gerekir.',
          },
        ],
        processGuide: [
          'Belediye Ruhsat Müdürlüğüne başvuru yapılır.',
          'Zabıta ve İtfaiye ekipleri adrese gelerek yangın tüpü, acil çıkış yönlendirmeleri ve bağımsız giriş şartını denetler.',
          'Harçlar yatırıldıktan sonra çerçeveli resmi çalışma ruhsatı teslim edilir.',
        ],
      },
    ],
  },

  // ================= 2. ÇİĞKÖFTECİ & FAST FOOD =================
  'cig-kofte': {
    sectorId: 'cig-kofte',
    sectorName: 'Çiğköfteci & Fast Food',
    emoji: '🌯',
    categoryGroup: 'Yeme - İçme',
    totalEstimatedLegalCost: 28500,
    estimatedTotalDays: '7 - 10 İş Günü',
    statutoryCapitalRequirement: {
      amount: 50000,
      description: 'Şahıs işletmesi veya Limited şirket asgari kuruluş sermayesi tabanı.',
      legalRef: '5362 sayılı Esnaf Kanunu & 6102 sayılı TTK',
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Vergi Dairesi Açılışı & Yazar Kasa / POS Tescili',
        institution: 'Gelir İdaresi Başkanlığı / İnteraktif Vergi Dairesi',
        applicationChannel: 'Online Portal',
        portalUrl: 'https://dijital.gib.gov.tr',
        estimatedCost: 2800,
        durationDays: '1 Gün',
        legalBasis: '213 sayılı VUK',
        proTips: 'Yeni nesil Android POS / ÖKC cihazının faturası alındıktan sonra 1 ay içinde vergi dairesine bildirilmesi zorunludur.',
        requiredDocuments: [
          {
            id: 'doc_cig_ise_baslama',
            name: 'İşe Başlama Bildirimi',
            format: 'E-İmza',
            proTip: 'NACE Kodu: 56.10.08 (Çiğ köfte, döner ve dürüm hazırlayan yerler) seçilmelidir.',
          },
          {
            id: 'doc_cig_kira',
            name: 'Dükkan Kira Sözleşmesi',
            format: 'PDF',
            proTip: 'Kira kontratında kullanım amacının "Gıda ve Restoran Hizmetleri" olarak geçmesi belediye ruhsatı için zorunludur.',
          },
        ],
        processGuide: ['Online mükellefiyet kaydı açılır.', 'Yeni nesil Android POS ile açılış tamamlanır.'],
      },
      {
        stepNumber: 2,
        title: 'Tarım ve Orman Bakanlığı İşletme Kayıt Belgesi (GGBS)',
        institution: 'İl / İlçe Tarım ve Orman Müdürlüğü',
        applicationChannel: 'Online Portal',
        portalUrl: 'https://ggbs.tarim.gov.tr',
        estimatedCost: 4200,
        durationDays: '3 - 5 Gün',
        legalBasis: '5996 sayılı Gıda Kanunu',
        proTips: 'Dükkanda çalışan herkesin e-Devlet onaylı MEB Hijyen Eğitimi belgesi olmadan gıda denetimi geçemez.',
        requiredDocuments: [
          {
            id: 'doc_cig_tarim_dilekce',
            name: 'Gıda İşletmeleri Kayıt Başvuru Dilekçesi',
            format: 'PDF',
            isDownloadableTemplate: true,
            templateFileName: 'tarim_isletme_kayit_dilekcesi.pdf',
            proTip: 'GGBS sistemi üzerinden başvuru yapıldıktan sonra ilçe tarım gıda mühendisleri dükkandaki dolap derecelerini (+4°C) denetler.',
            templateContent: {
              title: 'T.C. TARIM VE ORMAN BAKANLIĞI - İLÇE MÜDÜRLÜĞÜ',
              authority: 'Gıda Güvenliği ve İşletme Kayıt Şubesi (GGBS)',
              docType: 'Gıda İşletmeleri Kayıt Belgesi Başvuru Formu',
              summary: '5996 sayılı Veteriner Hizmetleri, Bitki Sağlığı, Gıda ve Yem Kanunu uyarınca gıda üretim ve servis noktaları kayıt belgesidir.',
              sections: [
                {
                  heading: '1. İşletme Tanımı',
                  body: 'İşletme Adı: [İşletme Adı] | Faaliyet: Çiğköfte ve Hazır Gıda Sunumu | Kapasite: Günlük 150 kg',
                },
                {
                  heading: '2. Hijyen ve Soğuk Zincir Ekipmanları',
                  body: 'Soğutmalı Teşhir Dolabı: Dijital dereceli (+4°C) | Paslanmaz Çelik Tezgâh (AISI 304 Standart) | Çalışan Hijyen Sertifikaları mevcuttur.',
                },
              ],
              signers: ['İşletme Sahibi (İmza)', 'Gıda Kontrol Mühendisi (İmza)', 'İlçe Tarım Müdürü (Onay)'],
              legalDisclaimer: 'Gıda işletme kayıt numarası ürün etiketlerinde ve dükkan vitrininde belirtilmek zorundadır.',
            },
          },
          {
            id: 'doc_cig_hijyen_belgesi',
            name: 'Tüm Personel Hijyen Eğitimi Sertifikaları (MEB Onaylı)',
            format: 'PDF',
            proTip: 'e-Devlet üzerinden alınan Milli Eğitim Bakanlığı Hayat Boyu Öğrenme Genel Müdürlüğü Hijyen Belgesi geçerlidir.',
          },
        ],
        processGuide: ['GGBS gıda portalı üzerinden kayıt başvurusu tamamlanır.'],
      },
      {
        stepNumber: 3,
        title: 'Belediye Sıhhi Müessese İşyeri Ruhsatı',
        institution: 'İlçe Belediyesi Ruhsat Müdürlüğü',
        applicationChannel: 'Fiziki Başvuru',
        estimatedCost: 15000,
        durationDays: '3 - 5 Gün',
        legalBasis: 'İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik',
        proTips: 'Apartman altı dükkanlarda bina sakinlerinden noter onaylı kat malikleri muvafakatnamesi alınmalıdır.',
        requiredDocuments: [
          {
            id: 'doc_cig_muvafakat',
            name: 'Kat Malikleri Muvafakatnamesi (Apartman altı ise)',
            format: 'Noter Onaylı',
            isDownloadableTemplate: true,
            templateFileName: 'apartman_muvafakatname_taslagi.pdf',
            proTip: 'Apartmandaki tüm kat maliklerinin oybirliğiyle veya çoğunluk kararıyla dükkanda yeme-içme faaliyeti yapılmasına izin verdiğini gösterir.',
            templateContent: {
              title: 'KAT MÜLKİYETİ KANUNU GEREĞİNCE KAT MALİKLERİ MUVAFAKATNAMESİ',
              authority: 'T.C. Noterliği Tasdikli Kat Malikleri Karar Tutanağı',
              docType: 'İşyeri Açılışı Muvafakat Belgesi',
              summary: '634 sayılı Kat Mülkiyeti Kanunu uyarınca ana gayrimenkulün zemin katında gıda/ticari işletme açılmasına dair malikler beyanıdır.',
              sections: [
                {
                  heading: 'Taşınmaz ve Bağımsız Bölüm',
                  body: 'Ana Gayrimenkul: [Sokak/Cadde No] | Zemin Kat [Dükkan No] nolu bağımsız bölüm.',
                },
                {
                  heading: 'Kat Malikleri Onay Beyanı',
                  body: 'Yukarıda adresi yazılı bağımsız bölümde [İşletmeci Adı] tarafından çiğköfte ve unlu mamul işletmesi açılmasına, tabela asılmasına ve gerekli baca bağlantısına muvafakat ettiğimizi beyan ederiz.',
                },
              ],
              signers: ['Apartman Yöneticisi (İmza)', 'Kat Malikleri (İmza Listesi)', 'Noter (Mühür)'],
              legalDisclaimer: 'Bu muvafakatname belediye ruhsat başvuru dosyasına zorunlu ek olarak sunulur.',
            },
          },
          {
            id: 'doc_cig_itfaiye',
            name: 'İtfaiye Yangın Tüpü Uygunluk Raporu',
            format: 'Asıl Belge',
            proTip: '6kg ABC yangın söndürme tüpü fatura ve garanti belgesi dosyaya eklenir.',
          },
        ],
        processGuide: ['Belediyeye dosya teslim edilerek sıhhi çalışma ruhsatı alınır.'],
      },
    ],
  },
};

export function getSectorLegalRoadmap(sectorId: string): SectorLegalRoadmap {
  return (
    LEGAL_APPLICATION_ROADMAPS[sectorId] || {
      sectorId,
      sectorName: sectorId.replace(/-/g, ' ').toUpperCase(),
      emoji: '📜',
      categoryGroup: 'Finans & Hizmet',
      totalEstimatedLegalCost: 35000,
      estimatedTotalDays: '10 - 15 İş Günü',
      statutoryCapitalRequirement: {
        amount: 50000,
        description: 'Genel ticari işletme asgari sermaye tabanı.',
        legalRef: '6102 sayılı Türk Ticaret Kanunu & İlgili Meslek Mevzuatı',
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Ticaret Sicil / Esnaf Odası Kuruluş Tescili',
          institution: 'Ticaret Sicil Müdürlüğü / Esnaf Odası',
          applicationChannel: 'Online Portal',
          portalUrl: 'https://mersis.gtb.gov.tr',
          estimatedCost: 14000,
          durationDays: '2 Gün',
          legalBasis: '6102 sayılı TTK',
          proTips: 'MERSİS üzerinden şirket veya esnaf kaydı açılırken ana sözleşme maddelerine dikkat edilmelidir.',
          requiredDocuments: [
            {
              id: 'doc_genel_ana_sozlesme',
              name: 'Kuruluş Ana Sözleşmesi',
              format: 'E-İmza',
              isDownloadableTemplate: true,
              proTip: 'Ticaret unvanı ve NACE kodunun tam uyumlu olması gerekir.',
              templateContent: {
                title: 'T.C. TİCARET BAKANLIĞI - TİCARET SİCİLİ GENEL KURULUŞ SÖZLEŞMESİ',
                authority: 'Ticaret Sicil Müdürlüğü',
                docType: 'Genel Limited Şirket / Şahıs Sözleşme Taslağı',
                summary: 'Standart ticari işletme kuruluş ana sözleşmesi resmi örneğidir.',
                sections: [
                  { heading: 'Şirket Unvanı', body: '... TİCARET LİMİTED ŞİRKETİ' },
                  { heading: 'Sermaye', body: 'Şirket sermayesi 50.000 TL olarak belirlenmiştir.' },
                ],
                signers: ['Kurucu Ortak', 'Sicil Memuru'],
                legalDisclaimer: 'MERSİS üzerinden tescil edilmelidir.',
              },
            },
          ],
          processGuide: ['Şirket veya şahıs işletmesi kaydı tescil edilir.'],
        },
      ],
    }
  );
}
