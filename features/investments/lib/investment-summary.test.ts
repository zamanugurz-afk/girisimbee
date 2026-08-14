import { describe, expect, it } from 'vitest';
import { buildInvestmentContext } from '@/features/investments/lib/investment-context';
import { buildInvestmentSummaryDraft } from '@/features/investments/lib/investment-summary';
import { extractNumericTokens } from '@/features/candidates/ai/career-ai-grounding';

function contextFrom(customFields: Record<string, unknown>, title = 'Nova') {
  return buildInvestmentContext({ title, city: 'Ankara', customFields });
}

function draftFrom(customFields: Record<string, unknown>, title = 'Nova') {
  return buildInvestmentSummaryDraft(contextFrom(customFields, title));
}

const SCENARIOS: Array<{ name: string; title: string; fields: Record<string, unknown> }> = [
  {
    name: 'fikir aşaması SaaS',
    title: 'IdeaSaaS',
    fields: {
      sector: 'SaaS / Yazılım',
      stage: 'Fikir aşaması',
      productStatus: 'Fikir',
      businessModel: ['SaaS'],
      targetCustomer: ['B2B'],
      problem: 'Raporlama yavaş',
      solution: 'Otomatik rapor',
      differentiation: 'Sektör şablonları',
      revenueStatus: 'Gelir yok',
      tractionStatus: 'Müşteri yok',
      investmentAmount: '500.000 TL\'ye kadar',
      equityOffered: 15,
      useOfFunds: ['Ürün geliştirme'],
    },
  },
  {
    name: 'MVP SaaS',
    title: 'MvpSaaS',
    fields: {
      sector: 'SaaS / Yazılım',
      stage: 'MVP aşaması',
      productStatus: 'MVP',
      businessModel: ['SaaS', 'Abonelik'],
      targetCustomer: ['KOBİ'],
      problem: 'Stok takibi dağınık',
      solution: 'Bulut stok',
      differentiation: 'Hızlı kurulum',
      revenueStatus: 'Gelir yok',
      tractionStatus: 'Pilot',
      investmentAmount: '1.000.000 - 2.500.000 TL',
      equityOffered: 12,
      useOfFunds: ['Ürün geliştirme', 'Satış'],
    },
  },
  {
    name: 'gelir üreten SaaS',
    title: 'RevSaaS',
    fields: {
      sector: 'SaaS / Yazılım',
      stage: 'Gelir elde ediliyor',
      productStatus: 'Ticari olarak aktif',
      businessModel: ['SaaS'],
      targetCustomer: ['B2B'],
      problem: 'Fatura süreçleri yavaş',
      solution: 'Otomasyon',
      differentiation: 'Entegre banka',
      revenueStatus: 'Düzenli gelir',
      tractionStatus: 'Aktif müşteri tabanı',
      mrr: '120000',
      activeCustomers: '14',
      investmentAmount: '2.500.000 - 5.000.000 TL',
      equityOffered: 10,
      useOfFunds: ['Ürün geliştirme', 'Satış'],
    },
  },
  {
    name: 'B2B marketplace',
    title: 'PazarYeri',
    fields: {
      sector: 'Marketplace',
      stage: 'İlk müşteriler',
      productStatus: 'Canlı ürün',
      businessModel: ['Marketplace', 'Komisyon'],
      targetCustomer: ['B2B', 'Pazaryeri katılımcısı'],
      problem: 'Tedarik dağınık',
      solution: 'B2B pazaryeri',
      differentiation: 'Dikey kategori',
      revenueStatus: 'İlk gelir',
      tractionStatus: 'İlk müşteriler',
      gmv: '800000',
      investmentAmount: '5.000.000 - 10.000.000 TL',
      equityOffered: 8,
      useOfFunds: ['Pazarlama', 'Yeni pazar'],
    },
  },
  {
    name: 'FinTech',
    title: 'OdemeKo',
    fields: {
      sector: 'Fintech',
      stage: 'MVP aşaması',
      productStatus: 'Beta',
      businessModel: ['SaaS', 'Komisyon'],
      targetCustomer: ['KOBİ'],
      problem: 'Tahsilat gecikiyor',
      solution: 'Dijital tahsilat',
      differentiation: 'Açık bankacılık',
      revenueStatus: 'Gelir yok',
      tractionStatus: 'Pilot',
      investmentAmount: '2.500.000 - 5.000.000 TL',
      equityOffered: 11,
      useOfFunds: ['Yazılım geliştirme', 'Operasyon'],
    },
  },
  {
    name: 'AI startup',
    title: 'GozetAI',
    fields: {
      sector: 'Yapay zeka',
      stage: 'Fikir aşaması',
      productStatus: 'Fikir',
      businessModel: ['SaaS'],
      targetCustomer: ['Enterprise'],
      problem: 'Kalite kontrol yavaş',
      solution: 'Görüntü ile hata tespiti',
      differentiation: 'Hat bazlı model',
      revenueStatus: 'Gelir yok',
      tractionStatus: 'Müşteri yok',
      investmentAmount: '1.000.000 - 2.500.000 TL',
      equityOffered: 14,
      useOfFunds: ['Yapay zeka', 'Ürün geliştirme'],
    },
  },
  {
    name: 'e-ticaret',
    title: 'ShopBee',
    fields: {
      sector: 'E-ticaret',
      stage: 'Büyüme aşaması',
      productStatus: 'Ölçekleniyor',
      businessModel: ['E-ticaret'],
      targetCustomer: ['Tüketici', 'B2C'],
      problem: 'Niş ürün bulunamıyor',
      solution: 'Dikey mağaza',
      differentiation: 'Üreticiden teslim',
      revenueStatus: 'Büyüyen gelir',
      tractionStatus: 'Ölçeklenen müşteri tabanı',
      monthlyRevenue: '450000',
      investmentAmount: '5.000.000 - 10.000.000 TL',
      equityOffered: 9,
      useOfFunds: ['Pazarlama', 'Çalışma sermayesi'],
    },
  },
  {
    name: 'hizmet tabanlı girişim',
    title: 'OperasyonPro',
    fields: {
      sector: 'İnsan kaynakları teknolojisi',
      stage: 'Gelir elde ediliyor',
      productStatus: 'Ticari olarak aktif',
      businessModel: ['Hizmet', 'Abonelik'],
      targetCustomer: ['KOBİ'],
      problem: 'Bordro operasyonu yavaş',
      solution: 'Dış kaynaklı bordro',
      differentiation: 'Sabit aylık ücret',
      revenueStatus: 'Düzenli gelir',
      tractionStatus: 'Aktif müşteri tabanı',
      activeCustomers: '40',
      investmentAmount: '500.000 - 1.000.000 TL',
      equityOffered: 20,
      useOfFunds: ['İnsan kaynakları', 'Satış'],
    },
  },
];

describe('investment deterministic summary', () => {
  it.each(SCENARIOS)('synthesizes $name without inventing numbers', ({ title, fields }) => {
    const ctx = contextFrom(fields, title);
    const draft = buildInvestmentSummaryDraft(ctx);
    expect(draft.longDescription.length).toBeGreaterThan(40);
    expect(draft.shortDescription.length).toBeGreaterThan(20);
    const evidence = JSON.stringify(ctx);
    const allowed = new Set(extractNumericTokens(evidence));
    for (const token of extractNumericTokens(`${draft.longDescription} ${draft.shortDescription}`)) {
      expect(allowed.has(token)).toBe(true);
    }
    expect(draft.longDescription).not.toMatch(/100 müşteri|500K MRR|%40 büyüme|10 kişilik ekip/);
  });

  it('carries funding, equity, MRR and customers when provided', () => {
    const draft = draftFrom(SCENARIOS[2].fields, 'RevSaaS');
    expect(draft.longDescription).toContain('120000');
    expect(draft.longDescription).toContain('14');
    expect(draft.longDescription).toContain('2.500.000 - 5.000.000 TL');
    expect(draft.longDescription).toContain('10%');
    expect(draft.longDescription).toContain('Ürün geliştirme');
  });
});
