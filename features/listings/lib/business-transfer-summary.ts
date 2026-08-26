import { normalizeListingDescription } from './listing-content-quality';
import { formatTryPlain } from '@/lib/utils';

export interface BusinessTransferSummaryContext {
  intent?: 'sell' | 'buy';
  title?: string;
  businessName?: string;
  businessType?: string;
  businessTypes?: string[] | string;
  sector?: string;
  sectors?: string[] | string;
  operationalStatus?: string;
  operationalPreference?: string;
  transferPrice?: number | string;
  budgetMax?: number | string;
  monthlyRent?: number | string;
  monthlyRevenue?: string;
  profitMargin?: string;
  businessAge?: number | string;
  employeeCount?: number | string;
  transferScope?: string[] | string;
  reasonForTransfer?: string;
  relevantExperience?: string;
  city?: string | null;
  district?: string | null;
}

export interface BusinessTransferSummaryDraft {
  shortDescription: string;
  longDescription: string;
}

export function buildBusinessTransferSummaryDraft(
  ctx: BusinessTransferSummaryContext
): BusinessTransferSummaryDraft {
  const isBuy = ctx.intent === 'buy';
  const location = [ctx.city, ctx.district].filter(Boolean).join(' / ');

  const parseList = (val?: string[] | string) =>
    Array.isArray(val)
      ? val
      : typeof val === 'string' && val.trim()
        ? val.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

  const parseNumber = (val?: number | string) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim()) {
      const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? null : num;
    }
    return null;
  };

  const sector =
    (Array.isArray(ctx.sectors) ? ctx.sectors.join(', ') : ctx.sectors)
    || ctx.sector
    || '';

  const businessType =
    (Array.isArray(ctx.businessTypes) ? ctx.businessTypes.join(', ') : ctx.businessTypes)
    || ctx.businessType
    || '';

  const scopes = parseList(ctx.transferScope).filter((s) => s !== 'Diğer');
  const scopeStr = scopes.slice(0, 6).join(', ');

  const priceNum = parseNumber(ctx.transferPrice);
  const budgetNum = parseNumber(ctx.budgetMax);
  const rentNum = parseNumber(ctx.monthlyRent);

  const priceStr = priceNum ? formatTryPlain(priceNum) : '';
  const budgetStr = budgetNum ? formatTryPlain(budgetNum) : '';
  const rentStr = rentNum ? formatTryPlain(rentNum) : '';

  if (isBuy) {
    // Alıcı / Devralan Dili
    const shortParts = [
      location ? location + ' lokasyonunda' : '',
      sector ? sector + ' sektöründe' : '',
      budgetStr ? budgetStr + ' devralma bütçesiyle' : '',
      businessType ? businessType + ' işletmesi devralmak istiyorum' : 'hazır işletme devralmak istiyorum',
    ].filter(Boolean);

    const shortDescription = normalizeListingDescription(shortParts.join(' ').trim() + '.');

    const longSentences: string[] = [];

    longSentences.push(
      (location ? location + ' lokasyonunda' : 'Belirlenen lokasyonlarda') +
      (sector ? ', ' + sector + ' sektöründe faaliyet gösteren' : '') +
      (businessType ? ' ' + businessType + ' türündeki' : ' faal veya hazır') +
      ' işletmeleri devralmak amacıyla yatırım yapmayı hedefliyorum.'
    );

    if (budgetStr) {
      longSentences.push(
        'Devralma için ayırdığım maksimum yatırım bütçesi ' + budgetStr + ' seviyesindedir.' +
        (rentStr ? ' Karşılanabilecek maksimum aylık kira hedefi ' + rentStr + ' düzeyindedir.' : '')
      );
    }

    if (ctx.operationalPreference) {
      longSentences.push(
        'İşletme yönetim modeli tercihi olarak ' + ctx.operationalPreference.toLocaleLowerCase('tr-TR') + ' planlanmaktadır.'
      );
    }

    if (ctx.relevantExperience?.trim()) {
      longSentences.push('Sektörel deneyim ve arka plan: ' + ctx.relevantExperience.trim() + '.');
    }

    longSentences.push(
      'Mevcut müşteri portföyü, ciro durumu, kira kontratı ve demirbaş listesi net olan işletme sahipleriyle detayları görüşmekten memnuniyet duyarım.'
    );

    const longDescription = normalizeListingDescription(longSentences.join(' '));

    return {
      shortDescription,
      longDescription,
    };
  }

  // Satıcı / Devreden Dili
  const bName = ctx.businessName?.trim() || ctx.title?.trim() || 'İşletmemiz';
  const statusStr = ctx.operationalStatus?.trim() || 'Faal';

  const shortParts = [
    location ? location + ' bölgesinde' : '',
    statusStr ? statusStr.toLocaleLowerCase('tr-TR') : '',
    businessType ? businessType : 'işletme',
    priceStr ? priceStr + ' devir bedeliyle devredilmektedir' : 'devredilmektedir',
  ].filter(Boolean);

  const shortDescription = normalizeListingDescription(shortParts.join(' ').trim() + '.');

  const longSentences: string[] = [];

  longSentences.push(
    bName + (location ? ', ' + location + ' lokasyonunda' : '') +
    (sector ? ', ' + sector + ' sektöründe' : '') +
    (businessType ? ' ' + businessType + ' olarak' : '') +
    ' ' + statusStr.toLocaleLowerCase('tr-TR') + ' şekilde devredilmektedir.'
  );

  if (priceStr || rentStr) {
    const finParts = [];
    if (priceStr) finParts.push('Devir bedeli ' + priceStr);
    if (rentStr) finParts.push('aylık kira bedeli ' + rentStr);
    longSentences.push(finParts.join(', ') + ' olarak belirlenmiştir.');
  }

  if (ctx.monthlyRevenue || ctx.profitMargin) {
    const revParts = [];
    if (ctx.monthlyRevenue && ctx.monthlyRevenue !== 'Görüşmede Paylaşılacak') {
      revParts.push('aylık ortalama ' + ctx.monthlyRevenue + ' ciro');
    }
    if (ctx.profitMargin && ctx.profitMargin !== 'Görüşmede Paylaşılacak') {
      revParts.push(ctx.profitMargin + ' net kâr marjı');
    }
    if (revParts.length > 0) {
      longSentences.push('İşletmemiz ' + revParts.join(' ve ') + ' ile faaliyetini sürdürmektedir.');
    }
  }

  if (ctx.businessAge || ctx.employeeCount) {
    const detailParts = [];
    if (ctx.businessAge) detailParts.push(ctx.businessAge + ' yıllık işletme geçmişine');
    if (ctx.employeeCount) detailParts.push(ctx.employeeCount + ' aktif çalışana');
    longSentences.push('İşletmemiz ' + detailParts.join(' ve ') + ' sahiptir.');
  }

  if (scopeStr) {
    longSentences.push('Devir kapsamında yer alan unsurlar: ' + scopeStr + '.');
  }

  if (ctx.reasonForTransfer?.trim()) {
    longSentences.push('Devir gerekçesi: ' + ctx.reasonForTransfer.trim() + '.');
  }

  longSentences.push(
    'Ciddi alıcılarla yerinde inceleme, demirbaş listesi, ciro doğrulaması ve devir şartları şeffaflıkla paylaşılacaktır.'
  );

  const longDescription = normalizeListingDescription(longSentences.join(' '));

  return {
    shortDescription,
    longDescription,
  };
}
