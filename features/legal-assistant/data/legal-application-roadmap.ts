import type {
  SectorLegalRoadmap,
  ApplicationStep,
  RequiredDocumentItem,
  DocumentTemplateContent,
} from '../types/legal-assistant.types';

// =========================================================================
// YARDIMCI FABRİKA: 25 SEKTÖR İÇİN 5 ADIMLI KAPSAMLI RESMİ YOL HARİTASI
// =========================================================================

interface SectorRawConfig {
  id: string;
  name: string;
  emoji: string;
  categoryGroup: 'Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Zanaat';
  statutoryCapital: number;
  statutoryDescription: string;
  legalRef: string;
  totalCost: number;
  totalDays: string;

  // 1. Şirket & Sicil
  step1: {
    title: string;
    institution: string;
    channel: 'Online Portal' | 'Fiziki Başvuru' | 'Noter / Odalar';
    portalUrl?: string;
    cost: number;
    days: string;
    legalBasis: string;
    proTips: string;
    processGuide: string[];
    docs: { name: string; format: 'E-İmza' | 'Asıl Belge' | 'Noter Onaylı' | 'PDF'; isTemplate?: boolean; proTip: string; template?: DocumentTemplateContent }[];
  };

  // 2. Vergi Dairesi
  step2: {
    title: string;
    institution: string;
    channel: 'Online Portal' | 'Fiziki Başvuru' | 'Noter / Odalar';
    portalUrl?: string;
    cost: number;
    days: string;
    legalBasis: string;
    proTips: string;
    processGuide: string[];
    docs: { name: string; format: 'E-İmza' | 'Asıl Belge' | 'Noter Onaylı' | 'PDF'; isTemplate?: boolean; proTip: string; template?: DocumentTemplateContent }[];
  };

  // 3. Mesleki İzin & Teknik Uygunluk
  step3: {
    title: string;
    institution: string;
    channel: 'Online Portal' | 'Fiziki Başvuru' | 'Noter / Odalar';
    portalUrl?: string;
    cost: number;
    days: string;
    legalBasis: string;
    proTips: string;
    processGuide: string[];
    docs: { name: string; format: 'E-İmza' | 'Asıl Belge' | 'Noter Onaylı' | 'PDF'; isTemplate?: boolean; proTip: string; template?: DocumentTemplateContent }[];
  };

  // 4. Oda & Birlik Kaydı
  step4: {
    title: string;
    institution: string;
    channel: 'Online Portal' | 'Fiziki Başvuru' | 'Noter / Odalar';
    portalUrl?: string;
    cost: number;
    days: string;
    legalBasis: string;
    proTips: string;
    processGuide: string[];
    docs: { name: string; format: 'E-İmza' | 'Asıl Belge' | 'Noter Onaylı' | 'PDF'; isTemplate?: boolean; proTip: string; template?: DocumentTemplateContent }[];
  };

  // 5. Belediye Ruhsatı
  step5: {
    title: string;
    institution: string;
    channel: 'Online Portal' | 'Fiziki Başvuru' | 'Noter / Odalar';
    portalUrl?: string;
    cost: number;
    days: string;
    legalBasis: string;
    proTips: string;
    processGuide: string[];
    docs: { name: string; format: 'E-İmza' | 'Asıl Belge' | 'Noter Onaylı' | 'PDF'; isTemplate?: boolean; proTip: string; template?: DocumentTemplateContent }[];
  };
}

function buildSectorRoadmap(c: SectorRawConfig): SectorLegalRoadmap {
  const steps: ApplicationStep[] = [
    {
      stepNumber: 1,
      title: c.step1.title,
      institution: c.step1.institution,
      applicationChannel: c.step1.channel,
      portalUrl: c.step1.portalUrl || 'https://mersis.gtb.gov.tr',
      estimatedCost: c.step1.cost,
      durationDays: c.step1.days,
      legalBasis: c.step1.legalBasis,
      proTips: c.step1.proTips,
      processGuide: c.step1.processGuide,
      requiredDocuments: c.step1.docs.map((d, i) => ({
        id: `${c.id}_s1_doc_${i}`,
        name: d.name,
        format: d.format,
        isDownloadableTemplate: !!d.isTemplate,
        templateFileName: `${c.id}_step1_doc_${i}.pdf`,
        proTip: d.proTip,
        templateContent: d.template,
      })),
    },
    {
      stepNumber: 2,
      title: c.step2.title,
      institution: c.step2.institution,
      applicationChannel: c.step2.channel,
      portalUrl: c.step2.portalUrl || 'https://dijital.gib.gov.tr',
      estimatedCost: c.step2.cost,
      durationDays: c.step2.days,
      legalBasis: c.step2.legalBasis,
      proTips: c.step2.proTips,
      processGuide: c.step2.processGuide,
      requiredDocuments: c.step2.docs.map((d, i) => ({
        id: `${c.id}_s2_doc_${i}`,
        name: d.name,
        format: d.format,
        isDownloadableTemplate: !!d.isTemplate,
        templateFileName: `${c.id}_step2_doc_${i}.pdf`,
        proTip: d.proTip,
        templateContent: d.template,
      })),
    },
    {
      stepNumber: 3,
      title: c.step3.title,
      institution: c.step3.institution,
      applicationChannel: c.step3.channel,
      portalUrl: c.step3.portalUrl || 'https://www.turkiye.gov.tr',
      estimatedCost: c.step3.cost,
      durationDays: c.step3.days,
      legalBasis: c.step3.legalBasis,
      proTips: c.step3.proTips,
      processGuide: c.step3.processGuide,
      requiredDocuments: c.step3.docs.map((d, i) => ({
        id: `${c.id}_s3_doc_${i}`,
        name: d.name,
        format: d.format,
        isDownloadableTemplate: !!d.isTemplate,
        templateFileName: `${c.id}_step3_doc_${i}.pdf`,
        proTip: d.proTip,
        templateContent: d.template,
      })),
    },
    {
      stepNumber: 4,
      title: c.step4.title,
      institution: c.step4.institution,
      applicationChannel: c.step4.channel,
      portalUrl: c.step4.portalUrl || 'https://www.tobb.org.tr',
      estimatedCost: c.step4.cost,
      durationDays: c.step4.days,
      legalBasis: c.step4.legalBasis,
      proTips: c.step4.proTips,
      processGuide: c.step4.processGuide,
      requiredDocuments: c.step4.docs.map((d, i) => ({
        id: `${c.id}_s4_doc_${i}`,
        name: d.name,
        format: d.format,
        isDownloadableTemplate: !!d.isTemplate,
        templateFileName: `${c.id}_step4_doc_${i}.pdf`,
        proTip: d.proTip,
        templateContent: d.template,
      })),
    },
    {
      stepNumber: 5,
      title: c.step5.title,
      institution: c.step5.institution,
      applicationChannel: c.step5.channel,
      portalUrl: c.step5.portalUrl || 'https://www.turkiye.gov.tr',
      estimatedCost: c.step5.cost,
      durationDays: c.step5.days,
      legalBasis: c.step5.legalBasis,
      proTips: c.step5.proTips,
      processGuide: c.step5.processGuide,
      requiredDocuments: c.step5.docs.map((d, i) => ({
        id: `${c.id}_s5_doc_${i}`,
        name: d.name,
        format: d.format,
        isDownloadableTemplate: !!d.isTemplate,
        templateFileName: `${c.id}_step5_doc_${i}.pdf`,
        proTip: d.proTip,
        templateContent: d.template,
      })),
    },
  ];

  return {
    sectorId: c.id,
    sectorName: c.name,
    emoji: c.emoji,
    categoryGroup: c.categoryGroup,
    totalEstimatedLegalCost: c.totalCost,
    estimatedTotalDays: c.totalDays,
    statutoryCapitalRequirement: {
      amount: c.statutoryCapital,
      description: c.statutoryDescription,
      legalRef: c.legalRef,
    },
    steps,
  };
}

// =========================================================================
// 25 SEKTÖR VERİ TABANI
// =========================================================================

export const LEGAL_APPLICATION_ROADMAPS: Record<string, SectorLegalRoadmap> = {
  // 1. Sigorta Acentesi
  'sigorta-acentesi': buildSectorRoadmap({
    id: 'sigorta-acentesi',
    name: 'Sigorta Acentesi',
    emoji: '🛡️',
    categoryGroup: 'Finans & Hizmet',
    statutoryCapital: 4149275,
    statutoryDescription: 'SEDDK 2026 Tebliği uyarınca Acente Levhasına kayıt için asgari ödenmiş sermaye veya mal varlığı şartı.',
    legalRef: 'Sigorta Acenteleri Yönetmeliği Madde 9 (SEDDK 2026)',
    totalCost: 174500,
    totalDays: '18 - 25 İş Günü',
    step1: {
      title: 'MERSİS & Ticaret Sicil Limited Şirket Kuruluşu',
      institution: 'Ticaret Sicil Müdürlüğü / MERSİS',
      channel: 'Online Portal',
      portalUrl: 'https://mersis.gtb.gov.tr',
      cost: 42000,
      days: '2 - 3 Gün',
      legalBasis: '6102 sayılı TTK ve Sigortacılık Kanunu Madde 32',
      proTips: 'Ana sözleşmeye sigortacılık dışı hiçbir faaliyet (danışmanlık, emlak vb.) eklemeyiniz; aksi takdirde TOBB/SAİK başvurunuz reddedilir.',
      processGuide: [
        'MERSİS sisteminden "Sigorta Aracılık Hizmetleri Ltd. Şti." unvanıyla ana sözleşme oluşturulur.',
        'Ticaret Sicil randevusu alınarak tescil yapılır ve Sicil Gazetesi ilanı verilir.',
      ],
      docs: [
        {
          name: 'Münhasıran Sigortacılık Ana Sözleşmesi',
          format: 'E-İmza',
          isTemplate: true,
          proTip: 'Unvanda ve amaç maddesinde münhasıran sigortacılık vurgusu yer almalıdır.',
          template: {
            title: 'T.C. TİCARET BAKANLIĞI - MERSİS LİMİTED ŞİRKET ANA SÖZLEŞMESİ',
            authority: 'İstanbul Ticaret Sicil Müdürlüğü',
            docType: 'Münhasıran Sigortacılık Ana Sözleşmesi',
            summary: '6102 sayılı TTK ve 5684 sayılı Sigortacılık Kanunu çerçevesinde limited şirket ana sözleşmesidir.',
            sections: [
              { heading: 'Madde 1 - Şirketin Unvanı', body: 'Şirketin ticaret unvanı "[UNVAN] SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ"dir.' },
              { heading: 'Madde 2 - Sermaye', body: 'Şirketin sermayesi SEDDK 2026 şartı gereği 4.149.275 TL olarak nakden taahhüt edilmiştir.' },
            ],
            signers: ['Kurucu Ortak', 'Acente Müdürü'],
            legalDisclaimer: 'MERSİS üzerinden tescil edilmelidir.',
          },
        },
        { name: 'Kurucu Ortak Noter İmza Beyannamesi', format: 'Noter Onaylı', proTip: 'Noterden tatbiki imza beyanı alınır.' },
        { name: 'Müstakil Ofis Kira Kontratı', format: 'PDF', isTemplate: true, proTip: 'Ofisin bağımsız girişe ve tabela asılabilir alana sahip olması gerekir.' },
      ],
    },
    step2: {
      title: 'Vergi Dairesi Mükellefiyet & Fiili Yoklama',
      institution: 'Gelir İdaresi Başkanlığı / Dijital Vergi Dairesi',
      channel: 'Online Portal',
      portalUrl: 'https://dijital.gib.gov.tr',
      cost: 3500,
      days: '1 - 2 Gün',
      legalBasis: '213 sayılı VUK Madde 153',
      proTips: 'Yoklama memuru geldiğinde dış tabela asılı olmalı ve acente müdürü ofiste bizzat bulunmalıdır.',
      processGuide: ['Dijital Vergi Dairesi üzerinden NACE Kodu: 66.22.01 ile işe başlama bildirimi yapılır.', 'Adrese gelen yoklama memuru çalışma alanını onaylar.'],
      docs: [
        { name: 'İşe Başlama Bildirimi', format: 'E-İmza', proTip: 'NACE Kodu: 66.22.01 seçilir.' },
        { name: 'Damga Vergisi Tahakkuk Fişi', format: 'PDF', proTip: 'Kira damga vergisi ödendi makbuzu dosyaya eklenir.' },
      ],
    },
    step3: {
      title: 'SEDDK Mesleki Sorumluluk Sigortası (MSS)',
      institution: 'Ruhsatlı Sigorta Şirketleri / SEDDK Denetimi',
      channel: 'Online Portal',
      portalUrl: 'https://www.seddk.gov.tr',
      cost: 30000,
      days: '1 Gün',
      legalBasis: 'Sigorta Acenteleri Yönetmeliği Madde 10',
      proTips: 'Poliçe süresi 1 yıllık olmalı ve asgari 1.500.000 TL teminat içermelidir.',
      processGuide: ['Sigorta şirketinden mesleki teminat poliçesi düzenletilerek lehdar TOBB gösterilir.'],
      docs: [
        { name: 'Yıllık Mesleki Sorumluluk Poliçesi', format: 'PDF', proTip: 'Poliçede TOBB / SAİK lehdar gösterilir.' },
      ],
    },
    step4: {
      title: 'TOBB / SAİK Levha Kayıt & Tescil Başvurusu',
      institution: 'TOBB / Sigorta Acenteleri İcra Komitesi',
      channel: 'Online Portal',
      portalUrl: 'https://sigorta.tobb.org.tr',
      cost: 85000,
      days: '10 - 15 Gün',
      legalBasis: '5684 sayılı Sigortacılık Kanunu Madde 23',
      proTips: 'Müdür olarak atanacak kişinin SEGEM belgesine ve 4 yıllık üniversite sonrası en az 2 yıl acente deneyimine sahip olması şarttır.',
      processGuide: ['TOBB portalına 4.149.275 TL sermaye blokaj belgesi ve SEGEM sertifikaları yüklenir.'],
      docs: [
        { name: '4.149.275 TL Sermaye Banka Blokaj Mektubu', format: 'Asıl Belge', proTip: 'Bankadan veya YMM raporuyla sunulur.' },
        { name: 'Acente Müdürü SEGEM & Lisans Diploması', format: 'Noter Onaylı', proTip: 'SEGEM teknik personel belgesi eklenir.' },
      ],
    },
    step5: {
      title: 'Belediye İşyeri Açma ve Çalışma Ruhsatı',
      institution: 'İlçe Belediyesi Ruhsat ve Denetim Müdürlüğü',
      channel: 'Fiziki Başvuru',
      cost: 14000,
      days: '3 - 5 Gün',
      legalBasis: 'İşyeri Açma ve Çalışma Ruhsatları Yönetmeliği',
      proTips: 'TSE onaylı 6kg ABC yangın söndürme tüpü faturası ve acil çıkış yönlendirmeleri denetlenir.',
      processGuide: ['İlçe Belediyesi Ruhsat Müdürlüğü\'ne dosya teslim edilir, zabıta denetimi sonrası ruhsat teslim alınır.'],
      docs: [
        {
          name: 'İşyeri Açma Ruhsatı Başvuru Beyannamesi',
          format: 'PDF',
          isTemplate: true,
          proTip: 'Belediye Ruhsat Servisi\'ne sunulacak standart beyan formudur.',
          template: {
            title: 'T.C. İLÇE BELEDİYE BAŞKANLIĞI - RUHSAT VE DENETİM MÜDÜRLÜĞÜ',
            authority: 'İşyeri Açma ve Çalışma Ruhsatları Servisi',
            docType: 'Sıhhi Müessese Ruhsat Başvuru Beyannamesi',
            summary: 'İşyeri Açma Yönetmeliği uyarınca çalışma ruhsatı talep evrakıdır.',
            sections: [
              { heading: '1. İşletme Bilgileri', body: 'Unvan: [Acente Unvanı] | Faaliyet: Sigorta Acenteliği | Adres: Kadıköy/İstanbul' },
              { heading: '2. Yangın & Güvenlik Beyanı', body: '6kg ABC yangın tüpü ve tahliye krokisi mevcuttur.' },
            ],
            signers: ['İşletmeci / Şirket Müdürü', 'Zabıta Denetim Memuru'],
            legalDisclaimer: 'Ruhsat belgesi dükkanda görünür yere asılmalıdır.',
          },
        },
        { name: 'İtfaiye Yangın Güvenlik Raporu', format: 'Asıl Belge', proTip: 'Yangın tüpü dolum faturası ibraz edilir.' },
      ],
    },
  }),

  // 2. Güzellik Salonu & Kuaför
  'kuafor-guzellik': buildSectorRoadmap({
    id: 'kuafor-guzellik',
    name: 'Güzellik Salonu & Kuaför',
    emoji: '💇‍♀️',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    statutoryCapital: 100000,
    statutoryDescription: 'Lazer epilasyon ve cilt bakım cihazları yatırımları asgari sermaye tabanı.',
    legalRef: 'Güzellik Salonları Yönetmeliği (Danıştay 2024 Güncel)',
    totalCost: 38000,
    totalDays: '10 - 15 İş Günü',
    step1: {
      title: 'Ticaret Sicil / Esnaf Odası Kuruluş Tescili',
      institution: 'Esnaf Sicil Müdürlüğü / MERSİS',
      channel: 'Online Portal',
      cost: 4500,
      days: '1 - 2 Gün',
      legalBasis: '5362 sayılı Esnaf Kanunu & 6102 sayılı TTK',
      proTips: 'Şahıs işletmesi veya limited şirket olarak tescil edilebilir.',
      processGuide: ['Esnaf siciline veya MERSİS üzerinden ticaret siciline kuruluş kaydı yapılır.'],
      docs: [
        { name: 'Kuruluş Beyannamesi & İmza Beyanı', format: 'E-İmza', proTip: 'Güzellik ve kuaförlük NACE kodu seçilir.' },
        { name: 'Kira Sözleşmesi', format: 'PDF', isTemplate: true, proTip: 'Kira kontratında kullanım amacı güzellik salonu olarak belirtilmelidir.' },
      ],
    },
    step2: {
      title: 'Vergi Dairesi Mükellefiyet & Yazar Kasa POS',
      institution: 'Gelir İdaresi Başkanlığı',
      channel: 'Online Portal',
      cost: 2800,
      days: '1 Gün',
      legalBasis: '213 sayılı VUK',
      proTips: 'Yoklama memuru çalışma koltuklarını ve sterilizasyon dolaplarını yerinde kontrol eder.',
      processGuide: ['İşe başlama bildirimi gönderilir ve yoklama tamamlanır.'],
      docs: [{ name: 'Vergi İşe Başlama Bildirimi', format: 'E-İmza', proTip: 'Vergi levhası onaylatılır.' }],
    },
    step3: {
      title: 'MEB Ustalık Belgesi & Cihaz CE/TSE Tip Onayları',
      institution: 'İlçe Sağlık Müdürlüğü / MEB',
      channel: 'Fiziki Başvuru',
      cost: 14500,
      days: '4 - 6 Gün',
      legalBasis: 'Güzellik Salonları Cihaz Standartları Tebliği',
      proTips: 'Lazer epilasyon cihazlarının dalga boyu ve joule limitlerinin kozmetik (tıbbi olmayan) sınırda olduğunu gösteren CE belgeleri dosyaya eklenir.',
      processGuide: ['MEB Ustalık belgesi veya noter tasdikli mesul müdürlük sözleşmesi ibraz edilir.', 'Cihaz teknik dosyaları İlçe Sağlık servisine sunulur.'],
      docs: [
        {
          name: 'Kuaförlük / Güzellik Ustalık Belgesi & Mesul Müdür Sözleşmesi',
          format: 'Noter Onaylı',
          isTemplate: true,
          proTip: 'İşletme sahibi veya mesul müdürün ustalık belgesi şarttır.',
          template: {
            title: 'T.C. MİLLİ EĞİTİM BAKANLIĞI - MESUL MÜDÜRLÜK SÖZLEŞMESİ',
            authority: 'Berberler ve Kuaförler Esnaf Odası Onaylı',
            docType: 'Güzellik Salonu Mesul Müdürlük Sözleşmesi',
            summary: 'Güzellik salonunda teknik hijyen ve cihaz denetimini yürütecek ustalık belgeli mesul müdür sözleşmesidir.',
            sections: [
              { heading: '1. Taraflar', body: 'İşletmeci: [İşletmeci Adı] | Mesul Müdür: [Ustalık Belgeli Müdür]' },
              { heading: '2. Yasal Sorumluluk', body: 'Mesul müdür cihazların kalibrasyonu ve sterilizasyon standartlarından sorumludur.' },
            ],
            signers: ['İşletmeci', 'Mesul Müdür', 'Noter'],
            legalDisclaimer: 'İlçe Sağlık ve Belediye Ruhsat dosyasına eklenir.',
          },
        },
        { name: 'Lazer & Cilt Cihazı CE/TSE Tip Onay Sertifikaları', format: 'PDF', proTip: 'Cihaz fatura ve teknik kılavuzları sunulur.' },
      ],
    },
    step4: {
      title: 'Kuaförler ve Güzellik Uzmanları Esnaf Odası Kaydı',
      institution: 'İlçe Esnaf ve Sanatkarlar Odası',
      channel: 'Fiziki Başvuru',
      cost: 4200,
      days: '1 Gün',
      legalBasis: '5362 sayılı Kanun',
      proTips: 'Oda kayıt belgesi ve resmi tarife panosu teslim alınır.',
      processGuide: ['Odaya kayıt yapılarak faaliyet belgesi alınır.'],
      docs: [{ name: 'Oda Kayıt Beyannamesi', format: 'Asıl Belge', proTip: 'Oda sicil kaydı tamamlanır.' }],
    },
    step5: {
      title: 'Belediye Sıhhi Müessese İşyeri Ruhsatı',
      institution: 'İlçe Belediyesi Ruhsat ve Denetim Müdürlüğü',
      channel: 'Fiziki Başvuru',
      cost: 12000,
      days: '3 - 5 Gün',
      legalBasis: 'İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik',
      proTips: 'Nereye başvurulur: İlçe Belediyesi Ruhsat Müdürlüğü. Nasıl başvurulur: Ustalık belgesi, cihaz CE onayları, tıbbi atık/iğne bertaraf kutusu beyanı ve itfaiye raporuyla dosya açılır. Zabıta mekan hijyenini denetler.',
      processGuide: [
        'İlçe Belediyesi Ruhsat Müdürlüğü\'ne başvuru dosyası teslim edilir.',
        'Zabıta ekipleri salondaki havalandırma emiş gücünü, otoklav sterilizasyon cihazını ve atık kutusunu yerinde inceler.',
        'Ruhsat harcı belediye veznesine yatırılarak çerçeveli çalışma ruhsatı teslim alınır.',
      ],
      docs: [
        {
          name: 'Belediye Sıhhi Müessese Ruhsat Başvuru Dosyası',
          format: 'PDF',
          isTemplate: true,
          proTip: 'Belediyeye sunulacak standart ruhsat başvuru beyannamesidir.',
          template: {
            title: 'T.C. İLÇE BELEDİYE BAŞKANLIĞI - RUHSAT MÜDÜRLÜĞÜ',
            authority: 'Sıhhi Müesseseler Ruhsat Servisi',
            docType: 'Güzellik Salonu Ruhsat Başvuru Beyannamesi',
            summary: 'İşyeri açma ruhsatı başvuru evrakıdır.',
            sections: [
              { heading: 'İşyeri Tanımı', body: 'Güzellik Salonu ve Cilt Bakım Merkezi | Net Alan: 70 m²' },
              { heading: 'Sterilizasyon Beyanı', body: 'UV sterilizatör, otoklav ve tek kullanımlık malzemeler mevcuttur.' },
            ],
            signers: ['İşletmeci', 'Zabıta Amiri'],
            legalDisclaimer: 'Ruhsat onaylandıktan sonra duvara asılır.',
          },
        },
        { name: 'İtfaiye Yangın Önlem Raporu', format: 'Asıl Belge', proTip: 'Yangın söndürme tüpü faturası ibraz edilir.' },
        { name: 'Tıbbi Atık & İğne Bertaraf Sözleşmesi', format: 'PDF', proTip: 'Atık iğne ve tıbbi kutu beyanı verilir.' },
      ],
    },
  }),
};

// =========================================================================
// 25 SEKTÖR İÇİN OTOMATİK DİNAMİK YOL HARİTASI ÜRETİCİ
// =========================================================================

interface SectorMeta {
  name: string;
  emoji: string;
  category: 'Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Zanaat';
  capital: number;
  cost: number;
  days: string;
  institution3: string;
  channel3: 'Online Portal' | 'Fiziki Başvuru' | 'Noter / Odalar';
  step3Title: string;
  step3ProTip: string;
  step5ProTip: string;
}

const SECTOR_METAS: Record<string, SectorMeta> = {
  'emlak-gayrimenkul': {
    name: 'Emlak & Gayrimenkul Ofisi',
    emoji: '🏢',
    category: 'Finans & Hizmet',
    capital: 100000,
    cost: 32000,
    days: '12 - 18 İş Günü',
    institution3: 'Ticaret Bakanlığı / TTBS Portalı',
    channel3: 'Online Portal',
    step3Title: 'Ticaret İl Müdürlüğü Taşınmaz Ticareti Yetki Belgesi (TTBS)',
    step3ProTip: 'Seviye 5 MYK belgesi ve en az 20 m² bağımsız kullanım alanı şarttır.',
    step5ProTip: 'İlçe belediyesine TTBS belgesi, vitrin LED tabela beyanı ve yangın tüpüyle başvurulur.',
  },
  'muhasebe-smmm': {
    name: 'Mali Müşavirlik & SMMM Bürosu',
    emoji: '📊',
    category: 'Finans & Hizmet',
    capital: 0,
    cost: 45000,
    days: '10 - 15 İş Günü',
    institution3: 'TÜRMOB / İl SMMM Odası',
    channel3: 'Noter / Odalar',
    step3Title: 'TÜRMOB Ruhsatı & Büro Tescil Belgesi (BTB)',
    step3ProTip: 'SMMM ruhsatnamesi ve kaşe talepnamesi odaya onaylatılır.',
    step5ProTip: 'Belediyeye harçtan muaf büro bildirim dilekçesi verilir.',
  },
  'hukuk-burosu': {
    name: 'Hukuk & Avukatlık Bürosu',
    emoji: '⚖️',
    category: 'Finans & Hizmet',
    capital: 0,
    cost: 24000,
    days: '5 - 7 İş Günü',
    institution3: 'İl Barosu Başkanlığı & UYAP',
    channel3: 'Online Portal',
    step3Title: 'Baro Levhası Büro Tescili & UYAP Avukat Portalı',
    step3ProTip: 'BaroKart ve e-İmza ile UYAP dava ve icra takibi yetkileri aktifleşir.',
    step5ProTip: 'Baro levha tescili sonrası belediyeye büro açılış bildirimi yapılır.',
  },
  'yazilim-ajans': {
    name: 'Yazılım & Dijital Ajans',
    emoji: '💻',
    category: 'Finans & Hizmet',
    capital: 50000,
    cost: 22000,
    days: '3 - 5 İş Günü',
    institution3: 'Ticaret Bakanlığı / HİB & GİB',
    channel3: 'Online Portal',
    step3Title: 'Hizmet İhracatçıları Birliği (HİB) & %80 Vergi İstisnası',
    step3ProTip: 'Yurtdışına yazılım/tasarım ihracatı yapan firmalar kazançlarının %80\'ini vergiden muaf tutar.',
    step5ProTip: 'İlçe belediyesine bilişim/yazılım sıhhi işyeri beyannamesi verilir.',
  },
  'kafe-kahve': {
    name: 'Kafe & Kahve Dükkanı',
    emoji: '☕',
    category: 'Yeme - İçme',
    capital: 100000,
    cost: 48000,
    days: '10 - 15 İş Günü',
    institution3: 'Tarım İlçe Müdürlüğü (GGBS)',
    channel3: 'Online Portal',
    step3Title: 'Tarım Bakanlığı Gıda İşletme Kayıt Belgesi (GGBS)',
    step3ProTip: 'Barista ve servis personelinin MEB onaylı Hijyen Eğitimi Sertifikası şarttır.',
    step5ProTip: 'İlçe belediyesi zabıta ve itfaiye ekipleri baca filtresini ve mutfak hijyenini inceler.',
  },
  'restoran-lokanta': {
    name: 'Restoran & Lokanta',
    emoji: '🍽️',
    category: 'Yeme - İçme',
    capital: 150000,
    cost: 62000,
    days: '15 - 20 İş Günü',
    institution3: 'İtfaiye & Çevre Şehircilik İl Müdürlüğü',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Sanayi Baca Filtresi & İtfaiye Emisyon Raporu',
    step3ProTip: 'Davlumbaz bacasının elektrostatik veya sulu filtreye sahip olması ve çatı mahyasını aşması şarttır.',
    step5ProTip: 'Belediyeye kat malikleri muvafakatnamesi, baca projesi ve gıda kayıt belgesiyle başvurulur.',
  },
  'donerci-kebapci': {
    name: 'Dönerci & Kebapçı',
    emoji: '🥙',
    category: 'Yeme - İçme',
    capital: 120000,
    cost: 55000,
    days: '12 - 18 İş Günü',
    institution3: 'Tarım İlçe Müdürlüğü & İtfaiye',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Ocakbaşı Baca İzolasyonu & Et Tedarik Kaydı',
    step3ProTip: 'Et faturalarında mezbaha kesim ve veteriner sağlık raporu barkodu bulunmalıdır.',
    step5ProTip: 'İlçe belediyesi yangın nozullarını ve yağ tutucu kanal bağlantısını denetler.',
  },
  'cigkofte-subesi': {
    name: 'Çiğköfteci & Fast Food',
    emoji: '🌯',
    category: 'Yeme - İçme',
    capital: 50000,
    cost: 28500,
    days: '7 - 10 İş Günü',
    institution3: 'Tarım ve Orman Bakanlığı (GGBS)',
    channel3: 'Online Portal',
    step3Title: 'GGBS Gıda İşletme Kayıt Belgesi & Hijyen Onayı',
    step3ProTip: 'Soğutmalı teşhir dolabı (+4°C) ve MEB Hijyen belgeleri dosyaya eklenir.',
    step5ProTip: 'Belediyeye başvuru yapılır; apartman altı ise kat malikleri muvafakatnamesi sunulur.',
  },
  'firin-unlu-mamuller': {
    name: 'Fırın & Unlu Mamüller',
    emoji: '🥖',
    category: 'Yeme - İçme',
    capital: 250000,
    cost: 65000,
    days: '18 - 25 İş Günü',
    institution3: 'Tarım İl Müdürlüğü & İtfaiye',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Gıda Üretim İzni & Taş Fırın Baca Emisyon Raporu',
    step3ProTip: 'Gıda Mühendisi istihdam sözleşmesi ve sulu elektrostatik filtre projesi şarttır.',
    step5ProTip: 'İskan projesinde "Fırın" ibaresi olan müstakil veya ticari alana GSM 2. Sınıf ruhsatı verilir.',
  },
  'eczane-medikal': {
    name: 'Eczane & Medikal Ürünler',
    emoji: '💊',
    category: 'Kişisel Bakım & Sağlık',
    capital: 400000,
    cost: 95000,
    days: '20 - 30 İş Günü',
    institution3: 'İl Sağlık Müdürlüğü & TİTCK (İTS)',
    channel3: 'Fiziki Başvuru',
    step3Title: 'İl Sağlık Eczane Ruhsatnamesi & İlaç Takip Sistemi (İTS)',
    step3ProTip: 'Eczacılık Diploması, ilçe nüfus kotası (3.500 kişiye 1 eczane) ve asgari 35 m² dükkan şarttır.',
    step5ProTip: 'İl Sağlık ve Eczacı Odası ortak heyet denetimi sonrası resmi açılış onaylanır.',
  },
  'dis-klinigi': {
    name: 'Diş Polikliniği / Ağız Diş',
    emoji: '🦷',
    category: 'Kişisel Bakım & Sağlık',
    capital: 500000,
    cost: 115000,
    days: '25 - 35 İş Günü',
    institution3: 'İl Sağlık Müdürlüğü & NDK (Eski TAEK)',
    channel3: 'Fiziki Başvuru',
    step3Title: 'İl Sağlık Mimari Proje Onayı & NDK Röntgen Lisansı',
    step3ProTip: 'Panoramik röntgen odası en az 2mm kurşun zırhlama ve NDK radyasyon ölçümü gerektirir.',
    step5ProTip: 'Tıbbi Atık Sözleşmesi ve Diş Hekimi Mesul Müdür kaydıyla poliklinik ruhsatnamesi alınır.',
  },
  'optik-magazasi': {
    name: 'Optik Mağazası & Gözlükçü',
    emoji: '👓',
    category: 'Kişisel Bakım & Sağlık',
    capital: 150000,
    cost: 42000,
    days: '10 - 15 İş Günü',
    institution3: 'İl Sağlık Müdürlüğü & SGK Medula',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Optisyenlik Ruhsatnamesi & Dijital Fokometre Tescili',
    step3ProTip: 'Optisyenlik diploması ve dijital odaklama cihazı fatura onayı zorunludur.',
    step5ProTip: 'İlçe Sağlık ve Belediye atölye denetimi sonrası mağaza ruhsatı düzenlenir.',
  },
  'pilates-yoga': {
    name: 'Pilates & Reformer Stüdyosu',
    emoji: '🧘‍♀️',
    category: 'Kişisel Bakım & Sağlık',
    capital: 100000,
    cost: 36000,
    days: '14 - 20 İş Günü',
    institution3: 'Gençlik ve Spor İl Müdürlüğü',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Gençlik ve Spor İl Müdürlüğü Tesis Yeterlilik İzni',
    step3ProTip: 'En az 2. Kademe Pilates Antrenörlük Belgesi ve aletler arası 1.2 m güvenlik mesafesi şarttır.',
    step5ProTip: 'Spor İl Müdürlüğü izin belgesi ve itfaiye raporuyla belediye ruhsatı teslim alınır.',
  },
  'market-bakkal': {
    name: 'Süpermarket & Bakkal',
    emoji: '🛒',
    category: 'Perakende & Zanaat',
    capital: 150000,
    cost: 35000,
    days: '7 - 10 İş Günü',
    institution3: 'Tarım Bakanlığı / Tütün ve Alkol Dairesi (TAPDK)',
    channel3: 'Online Portal',
    step3Title: 'TAPDK Tütün/Alkol Satış İzni & Tartı Aleti Damgası',
    step3ProTip: 'Okul ve ibadethanelere en az 100 metre mesafe şartı aranır.',
    step5ProTip: 'İlçe belediyesi zabıta servisi reyon düzeni ve yangın tüpünü inceleyerek ruhsat verir.',
  },
  'butik-giyim': {
    name: 'Butik & Giyim Mağazası',
    emoji: '👗',
    category: 'Perakende & Zanaat',
    capital: 80000,
    cost: 25000,
    days: '5 - 7 İş Günü',
    institution3: 'Terziler ve Konfeksiyoncular Esnaf Odası',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Oda Kayıt Tescili & Perakende Satış Bildirimi',
    step3ProTip: 'NACE Kodu: 47.71.01 ile tekstil perakende kaydı açılır.',
    step5ProTip: 'Deneme kabinleri, yangın tüpü ve tabela beyanıyla belediyeden sıhhi ruhsat alınır.',
  },
  'petshop-urunleri': {
    name: 'Petshop & Veteriner Ürünleri',
    emoji: '🐾',
    category: 'Perakende & Zanaat',
    capital: 100000,
    cost: 32000,
    days: '10 - 15 İş Günü',
    institution3: 'Tarım ve Orman İlçe Müdürlüğü',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Evcil Hayvan Satış/Bakım Eğitim Sertifikası & Veteriner Protokolü',
    step3ProTip: 'Petshop eğitim sertifikası ve sorumlu veteriner hekim iş sözleşmesi zorunludur.',
    step5ProTip: 'İlçe belediyesi havalandırma ve koku tahliye sistemini inceleyerek ruhsat verir.',
  },
  'kirtasiye-kitap': {
    name: 'Kırtasiye & Kitabevi',
    emoji: '📚',
    category: 'Perakende & Zanaat',
    capital: 60000,
    cost: 24000,
    days: '5 - 7 İş Günü',
    institution3: 'Kültür ve Turizm Bakanlığı (Telif Hakları)',
    channel3: 'Online Portal',
    step3Title: 'Kitap Satış Sertifikası & Bandrol Uygunluğu',
    step3ProTip: 'Bandrollü fikir ve sanat eseri satışı için bakanlık sertifika numarası alınır.',
    step5ProTip: 'Belediyeye sıhhi müessese beyannamesi verilir.',
  },
  'cicekci-botanik': {
    name: 'Çiçekçi & Botanik Tasarım',
    emoji: '💐',
    category: 'Perakende & Zanaat',
    capital: 50000,
    cost: 22000,
    days: '4 - 6 İş Günü',
    institution3: 'Çiçekçiler Esnaf Odası',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Çiçekçiler Esnaf Odası Sicili & Canlı Bitki Kaydı',
    step3ProTip: 'Dükkan önü çiçek sergisi için belediye tretuvar işgaliye izni alınır.',
    step5ProTip: 'İlçe belediyesine başvuru yapılarak sıhhi ruhsat alınır.',
  },
  'telefon-aksesuar': {
    name: 'Telefon & Aksesuar Mağazası',
    emoji: '📱',
    category: 'Perakende & Zanaat',
    capital: 75000,
    cost: 26000,
    days: '5 - 7 İş Günü',
    institution3: 'Türk Standardları Enstitüsü (TSE)',
    channel3: 'Fiziki Başvuru',
    step3Title: 'TSE HYB Hizmet Yeterlilik Belgesi (Teknik Servis Varsa)',
    step3ProTip: 'Ekran/batarya tamiri varsa antistatik ESD masa ve lehim duman tahliyesi zorunludur.',
    step5ProTip: 'Güvenlik kamerası ve yangın tüpü kontrolü sonrası belediye ruhsatı verilir.',
  },
  'oto-ekspertiz': {
    name: 'Oto Ekspertiz İstasyonu',
    emoji: '🔍',
    category: 'Perakende & Zanaat',
    capital: 300000,
    cost: 65000,
    days: '15 - 20 İş Günü',
    institution3: 'Türk Standardları Enstitüsü (TSE)',
    channel3: 'Fiziki Başvuru',
    step3Title: 'TSE 13805 Hizmet Yeterlilik & Cihaz Kalibrasyonu',
    step3ProTip: 'Dyno test, fren ve süspansiyon test cihazlarının TÜRKAK kalibrasyon sertifikaları şarttır.',
    step5ProTip: 'Rampa genişliği ve tavan yüksekliği denetlenerek belediyeden GSM 2. Sınıf ruhsat alınır.',
  },
  'oto-yikama': {
    name: 'Oto Yıkama & Detailing',
    emoji: '🚗',
    category: 'Perakende & Zanaat',
    capital: 150000,
    cost: 52000,
    days: '15 - 25 İş Günü',
    institution3: 'Büyükşehir Su İdaresi (İSKİ/ASKİ)',
    channel3: 'Fiziki Başvuru',
    step3Title: 'İSKİ / Su İdaresi Atıksu Deşarj İzni & Yağ Ayırıcı Havuz',
    step3ProTip: 'Çamur ve yağ tutucu çökertme havuzu projesi onaylatılmalıdır.',
    step5ProTip: 'İSKİ deşarj belgesi ve kat malikleri muvafakatnamesiyle belediyeden GSM 3. Sınıf ruhsat alınır.',
  },
  'lastik-servisi': {
    name: 'Lastik & Jant Servis Merkezi',
    emoji: '🛞',
    category: 'Perakende & Zanaat',
    capital: 150000,
    cost: 45000,
    days: '10 - 15 İş Günü',
    institution3: 'Çevre, Şehircilik Bakanlığı / LASDER',
    channel3: 'Online Portal',
    step3Title: 'Ömrünü Tamamlamış Lastik (ÖTL) Bertaraf Protokolü',
    step3ProTip: 'Atık eski lastiklerin lisanslı geri dönüşüm tesisine teslim sözleşmesi zorunludur.',
    step5ProTip: 'Basınçlı hava kompresör tankı hidrostatik test raporuyla belediye GSM ruhsatı verilir.',
  },
  'kuru-temizleme': {
    name: 'Kuru Temizleme & Terzi',
    emoji: '👔',
    category: 'Perakende & Zanaat',
    capital: 180000,
    cost: 48000,
    days: '12 - 18 İş Günü',
    institution3: 'Çevre İl Müdürlüğü & Makina Müh. Odası',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Tehlikeli Kimyasal Atık Bertaraf Sözleşmesi & Buhar Kazanı Muayenesi',
    step3ProTip: 'Perkloretilen kimyasal atık bertaraf sözleşmesi ve MMO buhar kazanı muayene raporu şarttır.',
    step5ProTip: 'Müstakil baca ve yangın güvenliği kontrolü sonrası belediye GSM 3. Sınıf ruhsatı düzenlenir.',
  },
  'kres-gunduz-bakimevi': {
    name: 'Kreş & Gündüz Bakımevi / Anaokulu',
    emoji: '👶',
    category: 'Finans & Hizmet',
    capital: 300000,
    cost: 58000,
    days: '25 - 35 İş Günü',
    institution3: 'Aile ve Sosyal Hizmetler İl Müdürlüğü',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Özel Kreş Açılış İzin Belgesi & Bina Standartları Onayı',
    step3ProTip: 'Bahçe alanı, çift kaçış merdiveni, çocuk başına düşen m² ve hava debisi denetlenir.',
    step5ProTip: 'Aile Bakanlığı onayından sonra belediye ve itfaiye ortak ruhsatı düzenler.',
  },
  'lojistik-kurye': {
    name: 'Kurye Dağıtım & Şehir İçi Lojistik',
    emoji: '🛵',
    category: 'Finans & Hizmet',
    capital: 100000,
    cost: 75000,
    days: '10 - 15 İş Günü',
    institution3: 'Ulaştırma ve Altyapı Bakanlığı Bölge Müdürlüğü',
    channel3: 'Fiziki Başvuru',
    step3Title: 'P2 / Kurye Dağıtım İşletmeciliği Yetki Belgesi',
    step3ProTip: 'Özmal veya sözleşmeli en az 3 adet kurye aracı/motosiklet tescili ve kurye takip yazılımı şarttır.',
    step5ProTip: 'Yetki belgesi ile birlikte belediyeye lojistik büro ruhsatı başvurusu yapılır.',
  },
  'mimarlik-muhendislik': {
    name: 'Mimarlık & Mühendislik Proje Ofisi',
    emoji: '📐',
    category: 'Finans & Hizmet',
    capital: 50000,
    cost: 26000,
    days: '4 - 6 İş Günü',
    institution3: 'TMMOB Mimarlar Odası / İnşaat Mühendisleri Odası',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Serbest Mimarlık / Mühendislik Büro Tescil Belgesi (BTB)',
    step3ProTip: 'Oda aidatı, imza sirküleri ve mimar/mühendis diploma tescili ile BTB belgesi alınır.',
    step5ProTip: 'Belediyeye mimarlık bürosu ruhsat dosyası verilir.',
  },
  'tatlici-pastane': {
    name: 'Pastane, Tatlıcı & Butik Fırın',
    emoji: '🍰',
    category: 'Yeme - İçme',
    capital: 100000,
    cost: 38000,
    days: '7 - 10 İş Günü',
    institution3: 'İl/İlçe Tarım ve Orman Müdürlüğü',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Gıda İşletme Kayıt / Onay Belgesi & Hijyen Denetimi',
    step3ProTip: 'Fırın bacası, su analiz raporu, personel hijyen eğitimi ve zararlı mücadele sözleşmesi aranır.',
    step5ProTip: 'İtfaiye baca raporu ve gıda kayıt belgesiyle belediye sıhhi ruhsatı verir.',
  },
  'psikolojik-danismanlik': {
    name: 'Psikolojik Danışmanlık & Terapi',
    emoji: '🧠',
    category: 'Kişisel Bakım & Sağlık',
    capital: 50000,
    cost: 24000,
    days: '6 - 8 İş Günü',
    institution3: 'İl Sağlık Müdürlüğü / Aile ve Sosyal Hizmetler Müdürlüğü',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Psikolojik Danışmanlık & Aile Danışma Merkezi İzin Belgesi',
    step3ProTip: 'Psikoloji lisans/yüksek lisans diploması, ses yalıtımı ve danışan bekleme alanı şarttır.',
    step5ProTip: 'Belediyeye danışmanlık merkezi açılış beyannamesi verilir.',
  },
  'surucu-kursu': {
    name: 'Sürücü Kursu & MTSK Merkezi',
    emoji: '🚗',
    category: 'Finans & Hizmet',
    capital: 250000,
    cost: 65000,
    days: '20 - 30 İş Günü',
    institution3: 'T.C. Millî Eğitim Bakanlığı (MEB Özel Öğretim Kurumları)',
    channel3: 'Fiziki Başvuru',
    step3Title: 'MEB Özel MTSK Kurum Açma İzni ve İş Yeri Açma Ruhsatı',
    step3ProTip: 'Derslik tavan yüksekliği, simülatör cihazı, eğitim araçları ve usta öğretici sözleşmeleri denetlenir.',
    step5ProTip: 'MEB müfettiş raporu sonrası kurum açılış ruhsatı valilikçe onaylanır.',
  },
  'veteriner-klinigi': {
    name: 'Veteriner Kliniği & Hayvan Hastanesi',
    emoji: '🩺',
    category: 'Kişisel Bakım & Sağlık',
    capital: 200000,
    cost: 72000,
    days: '15 - 20 İş Günü',
    institution3: 'Tarım ve Orman Bakanlığı & Nükleer Düzenleme Kurumu (NDK)',
    channel3: 'Fiziki Başvuru',
    step3Title: 'Veteriner Kliniği Çalışma İzni & Röntgen Odası TAEK/NDK Lisansı',
    step3ProTip: 'Kurşun kaplı röntgen odası, ameliyathane, otoklav ve veteriner hekim diploma tescili zorunludur.',
    step5ProTip: 'İl Tarım Müdürlüğü denetimi sonrası klinik ruhsatı verilir.',
  },
};

// Metadatalardan eksik kalan tüm sektörleri 5 adımlı tam şablonla otomatik doldur
for (const [key, meta] of Object.entries(SECTOR_METAS)) {
  if (!LEGAL_APPLICATION_ROADMAPS[key]) {
    LEGAL_APPLICATION_ROADMAPS[key] = buildSectorRoadmap({
      id: key,
      name: meta.name,
      emoji: meta.emoji,
      categoryGroup: meta.category,
      statutoryCapital: meta.capital,
      statutoryDescription: `${meta.name} faaliyeti için tavsiye edilen asgari yasal işletme sermayesi.`,
      legalRef: '6102 sayılı TTK & İlgili Mesleki Yönetmelik',
      totalCost: meta.cost,
      totalDays: meta.days,
      step1: {
        title: 'MERSİS & Ticaret / Esnaf Sicil Kuruluşu',
        institution: 'Ticaret Sicil Müdürlüğü / Esnaf Odası',
        channel: 'Online Portal',
        portalUrl: 'https://mersis.gtb.gov.tr',
        cost: Math.round(meta.cost * 0.25),
        days: '2 Gün',
        legalBasis: '6102 sayılı Türk Ticaret Kanunu & 5362 sayılı Esnaf Kanunu',
        proTips: 'MERSİS üzerinden şirket veya esnaf kaydı açılırken ana sözleşme NACE koduna dikkat edilmelidir.',
        processGuide: [
          'MERSİS sisteminden kuruluş ana sözleşmesi hazırlanır.',
          'Noter onaylı imza beyannamesi ve kira kontratı sisteme yüklenir.',
        ],
        docs: [
          {
            name: `${meta.name} Kuruluş Ana Sözleşmesi`,
            format: 'E-İmza',
            isTemplate: true,
            proTip: 'Ticaret unvanı ve NACE kodunun tam uyumlu olması gerekir.',
            template: {
              title: `T.C. TİCARET BAKANLIĞI - ${meta.name.toUpperCase()} KURULUŞ SÖZLEŞMESİ`,
              authority: 'Ticaret Sicil Müdürlüğü',
              docType: 'Kuruluş Sözleşmesi Taslağı',
              summary: `${meta.name} için standart resmi kuruluş ana sözleşmesi örneğidir.`,
              sections: [
                { heading: 'Şirket Unvanı', body: `[ŞİRKET UNVANI] ${meta.name.toUpperCase()} LİMİTED ŞİRKETİ` },
                { heading: 'Sermaye', body: `Şirket sermayesi ${meta.capital.toLocaleString('tr-TR')} TL olarak belirlenmiştir.` },
              ],
              signers: ['Kurucu Ortak', 'Müdür'],
              legalDisclaimer: 'MERSİS üzerinden tescil edilmelidir.',
            },
          },
          { name: 'Kurucu Ortak Noter İmza Beyannamesi', format: 'Noter Onaylı', proTip: 'Noterden tatbiki imza beyanı alınır.' },
          { name: 'İşyeri Kira Sözleşmesi', format: 'PDF', isTemplate: true, proTip: 'Kira kontratında işyeri kullanım amacı açıkça belirtilmelidir.' },
        ],
      },
      step2: {
        title: 'Vergi Dairesi Mükellefiyet & Fiili Yoklama',
        institution: 'Gelir İdaresi Başkanlığı / Dijital Vergi Dairesi',
        channel: 'Online Portal',
        portalUrl: 'https://dijital.gib.gov.tr',
        cost: 3000,
        days: '1 - 2 Gün',
        legalBasis: '213 sayılı Vergi Usul Kanunu Madde 153',
        proTips: 'Yoklama memuru geldiğinde dış tabela asılı olmalı ve çalışma alanı hazır bulunmalıdır.',
        processGuide: [
          'Dijital Vergi Dairesi üzerinden işe başlama bildirimi gönderilir.',
          'Yoklama memuru adresi yerinde ziyaret ederek yoklama tutanağını tanzim eder.',
        ],
        docs: [
          { name: 'İşe Başlama Bildirimi Formu', format: 'E-İmza', proTip: 'İlgili NACE kodu seçilerek başvuru yapılır.' },
          { name: 'Kira Sözleşmesi & Damga Vergisi Makbuzu', format: 'PDF', proTip: 'Damga vergisi tahakkuku dosyalanır.' },
        ],
      },
      step3: {
        title: meta.step3Title,
        institution: meta.institution3,
        channel: meta.channel3,
        cost: Math.round(meta.cost * 0.35),
        days: '4 - 7 Gün',
        legalBasis: 'Sektörel Meslek Standartları ve İlgili Bakanlık Tebliği',
        proTips: meta.step3ProTip,
        processGuide: [
          `İlgili kurum (${meta.institution3}) portalına veya il müdürlüğüne dosya teslim edilir.`,
          'Teknik denetim ve inceleme sonrası mesleki onay / yeterlilik belgesi düzenlenir.',
        ],
        docs: [
          {
            name: `${meta.name} Mesleki Yeterlilik & İzin Başvuru Belgesi`,
            format: 'PDF',
            isTemplate: true,
            proTip: meta.step3ProTip,
            template: {
              title: `T.C. İLGİLİ BAKANLIK / KURUM - ${meta.name.toUpperCase()} İZİN BELGESİ`,
              authority: meta.institution3,
              docType: 'Mesleki İzin ve Yeterlilik Belgesi',
              summary: `${meta.name} faaliyeti için zorunlu mesleki yeterlilik onay belgesidir.`,
              sections: [
                { heading: 'İşletme ve Meslek Sahibi Bilgisi', body: `Meslek: ${meta.name} | Adres: Kadıköy/İstanbul` },
                { heading: 'Teknik Standartlar', body: 'İlgili kanun ve yönetmeliklerdeki teknik şartlar sağlanmıştır.' },
              ],
              signers: ['İşletmeci', 'Denetim Yetkilisi'],
              legalDisclaimer: 'Ruhsat dosyasına eklenir.',
            },
          },
        ],
      },
      step4: {
        title: 'İlgili Meslek Odası & Birlik Kaydı',
        institution: 'Ticaret Odası / Esnaf ve Sanatkarlar Odası',
        channel: 'Fiziki Başvuru',
        cost: 4500,
        days: '1 - 2 Gün',
        legalBasis: '5174 sayılı TOBB Kanunu & 5362 sayılı Esnaf Kanunu',
        proTips: 'Oda kayıt belgesi ve resmi faaliyet belgesi belediye ruhsatı için zorunludur.',
        processGuide: ['Odaya tescil başvurusu yapılır ve faaliyet belgesi teslim alınır.'],
        docs: [
          { name: 'Oda Sicil Kayıt Beyannamesi', format: 'Asıl Belge', proTip: 'Oda sicil kaydı tamamlanır.' },
          { name: 'Oda Faaliyet Belgesi', format: 'PDF', proTip: 'Belediyeye sunulacak güncel faaliyet belgesidir.' },
        ],
      },
      step5: {
        title: 'Belediye İşyeri Açma ve Çalışma Ruhsatı',
        institution: 'İlçe Belediyesi Ruhsat ve Denetim Müdürlüğü',
        channel: 'Fiziki Başvuru',
        cost: Math.round(meta.cost * 0.35),
        days: '3 - 5 Gün',
        legalBasis: 'İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik',
        proTips: meta.step5ProTip,
        processGuide: [
          'İlçe Belediyesi Ruhsat Müdürlüğü\'ne başvuru dosyası teslim edilir.',
          'Zabıta ve İtfaiye ekipleri adrese gelerek yangın güvenliğini, mekansal standartları ve evrakları yerinde inceler.',
          'Metrekare harcı ödendikten sonra çerçeveli çalışma ruhsatı teslim alınır.',
        ],
        docs: [
          {
            name: 'Belediye İşyeri Açma Ruhsat Başvuru Dosyası',
            format: 'PDF',
            isTemplate: true,
            proTip: meta.step5ProTip,
            template: {
              title: 'T.C. İLÇE BELEDİYE BAŞKANLIĞI - RUHSAT MÜDÜRLÜĞÜ',
              authority: 'İşyeri Açma ve Çalışma Ruhsatları Servisi',
              docType: 'İşyeri Açma ve Çalışma Ruhsatı Başvuru Beyannamesi',
              summary: `${meta.name} için resmi belediye çalışma ruhsatı başvuru evrakıdır.`,
              sections: [
                { heading: '1. İşyeri Bilgileri', body: `Unvan: [İşletme Unvanı] | Faaliyet: ${meta.name} | Adres: Kadıköy/İstanbul` },
                { heading: '2. Denetim Beyanı', body: 'Yangın söndürme tüpü, acil çıkış levhaları ve yapı iskanı mevcuttur.' },
              ],
              signers: ['İşletmeci / Müdür', 'Ruhsat Denetim Memuru'],
              legalDisclaimer: 'Ruhsat belgesi dükkanda görünür yere asılmalıdır.',
            },
          },
          { name: 'İtfaiye Yangın Önlem Raporu', format: 'Asıl Belge', proTip: 'Yangın tüpü dolum faturası ibraz edilir.' },
          { name: 'Bina İskan Belgesi & Numarataj', format: 'PDF', proTip: 'Yapı kullanım izin belgesi ve kapı numaratajı sunulur.' },
        ],
      },
    });
  }
}

export const ALL_LEGAL_ROADMAPS: SectorLegalRoadmap[] = Object.values(LEGAL_APPLICATION_ROADMAPS).sort((a, b) =>
  a.sectorName.localeCompare(b.sectorName, 'tr')
);

export function getSectorLegalRoadmap(sectorId: string): SectorLegalRoadmap {
  return (
    LEGAL_APPLICATION_ROADMAPS[sectorId] ||
    LEGAL_APPLICATION_ROADMAPS['sigorta-acentesi']
  );
}
