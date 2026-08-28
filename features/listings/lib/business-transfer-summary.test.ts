import { describe, it, expect } from 'vitest';
import { buildBusinessTransferSummaryDraft } from './business-transfer-summary';

describe('buildBusinessTransferSummaryDraft', () => {
  it('generates sell intent draft correctly (İşletmemi Devretmek İstiyorum)', () => {
    const draft = buildBusinessTransferSummaryDraft({
      intent: 'sell',
      businessName: 'Kadıköy Moda Butik Kafe',
      businessType: 'Kafe / Restoran / Yeme-İçme',
      sector: 'Gıda ve İçecek',
      operationalStatus: 'Aktif Faaliyette (Cirolu & Müşterili)',
      transferPrice: 750000,
      monthlyRent: 25000,
      monthlyRevenue: '500.000 - 1.000.000 TL',
      profitMargin: '%20 - %30',
      businessAge: 3,
      employeeCount: 4,
      transferScope: ['Demirbaşlar & Ekipmanlar', 'İşletme Ruhsatı & İzinler', 'Marka & Tabela Hakkı'],
      reasonForTransfer: 'Şehir Değişikliği',
      city: 'İstanbul',
      district: 'Kadıköy',
    });

    expect(draft.shortDescription).toContain('İstanbul / Kadıköy');
    expect(draft.shortDescription).toContain('750.000 TL');
    expect(draft.shortDescription).toContain('devredilmektedir');

    expect(draft.longDescription).toContain('Kadıköy Moda Butik Kafe');
    expect(draft.longDescription).toContain('Gıda ve İçecek sektöründe');
    expect(draft.longDescription).toContain('750.000 TL');
    expect(draft.longDescription).toContain('25.000 TL');
    expect(draft.longDescription).toContain('500.000 - 1.000.000 TL');
    expect(draft.longDescription).toContain('%20 - %30');
    expect(draft.longDescription).toContain('3 yıllık işletme geçmişine');
    expect(draft.longDescription).toContain('4 aktif çalışana');
    expect(draft.longDescription).toContain('Demirbaşlar ve Ekipmanlar');
    expect(draft.longDescription).toContain('Şehir Değişikliği');
  });

  it('generates buy intent draft correctly (İşletme Devralmak İstiyorum)', () => {
    const draft = buildBusinessTransferSummaryDraft({
      intent: 'buy',
      businessTypes: ['Kafe / Restoran / Yeme-İçme'],
      sectors: ['Gıda ve İçecek'],
      budgetMax: 1000000,
      monthlyRent: 30000,
      operationalPreference: 'Kendisi İşletecek',
      relevantExperience: '5 yıl kafe ve restoran işletmeciliği',
      city: 'İzmir',
      district: 'Karşıyaka',
    });

    expect(draft.shortDescription).toContain('İzmir / Karşıyaka');
    expect(draft.shortDescription).toContain('Gıda ve İçecek sektöründe');
    expect(draft.shortDescription).toContain('1.000.000 TL');
    expect(draft.shortDescription).toContain('devralmak istiyorum');

    expect(draft.longDescription).toContain('İzmir / Karşıyaka lokasyonunda');
    expect(draft.longDescription).toContain('Gıda ve İçecek sektöründe faaliyet gösteren');
    expect(draft.longDescription).toContain('1.000.000 TL');
    expect(draft.longDescription).toContain('30.000 TL');
    expect(draft.longDescription).toContain('kendisi işletecek');
    expect(draft.longDescription).toContain('5 yıl kafe ve restoran işletmeciliği');
  });
});
