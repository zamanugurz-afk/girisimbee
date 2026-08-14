import type { InvestmentContext } from '@/features/investments/lib/investment-context';
import { formatTeamLabel, listEnteredMetrics } from '@/features/investments/lib/investment-context';
import { joinList, sentenceCaseInvestment } from '@/features/investments/lib/investment-text';

export type InvestmentSummaryDraft = {
  shortDescription: string;
  longDescription: string;
  highlights: string[];
};

function whoPays(ctx: InvestmentContext): string {
  return joinList(ctx.targetCustomer);
}

function models(ctx: InvestmentContext): string {
  return joinList(ctx.businessModel);
}

function funds(ctx: InvestmentContext): string {
  return joinList(ctx.useOfFunds);
}

function metricClause(ctx: InvestmentContext): string {
  const rows = listEnteredMetrics(ctx);
  if (!rows.length) return '';
  return rows.map((row) => `${row.label} ${row.value}`).join(', ');
}

export function buildInvestmentSummaryDraft(ctx: InvestmentContext): InvestmentSummaryDraft {
  const name = ctx.startupName || 'Girişim';
  const sector = ctx.sector || 'belirtilmemiş sektör';
  const stage = ctx.stage || ctx.productStatus || 'belirtilmemiş aşama';
  const customer = whoPays(ctx);
  const model = models(ctx);
  const funding = ctx.fundingNeed.amountDisplay;
  const equity = ctx.investmentOffer.equityOffered;
  const use = funds(ctx);
  const metrics = metricClause(ctx);

  const shortParts = [
    `${name}, ${sector} alanında ${stage.toLocaleLowerCase('tr-TR')} bir girişimdir`,
    customer ? `${customer} müşterilere yöneliktir` : '',
    funding ? `${funding} yatırım aramaktadır` : '',
    equity ? `${equity} hisse teklif etmektedir` : '',
  ].filter(Boolean);
  const shortDescription = sentenceCaseInvestment(shortParts.join('; '));

  const longSentences: string[] = [];
  longSentences.push(
    `${name}${ctx.productName && ctx.productName !== name ? ` (${ctx.productName})` : ''} ${sector} sektöründe, ${stage.toLocaleLowerCase('tr-TR')} bir girişimdir.`,
  );
  if (ctx.problem) {
    longSentences.push(`Çözülen problem: ${sentenceCaseInvestment(ctx.problem).replace(/\.$/, '')}.`);
  }
  if (ctx.solution) {
    longSentences.push(`Çözüm: ${sentenceCaseInvestment(ctx.solution).replace(/\.$/, '')}.`);
  }
  if (customer || model) {
    longSentences.push(
      [
        customer ? `Hedef müşteri ${customer}` : '',
        model ? `iş modeli ${model}` : '',
      ]
        .filter(Boolean)
        .join('; ') + '.',
    );
  }
  const statusBits = [ctx.productStatus, ctx.revenueStatus, ctx.tractionStatus].filter(Boolean);
  if (statusBits.length) {
    longSentences.push(`Mevcut durum: ${joinList(statusBits)}.`);
  }
  if (metrics) {
    longSentences.push(`Girilen traction: ${metrics}.`);
  }
  if (funding || equity) {
    longSentences.push(
      [
        funding ? `${funding} yatırım aranıyor` : '',
        equity ? `${equity} hisse teklif ediliyor` : '',
        ctx.investmentOffer.valuation ? `değerleme ${ctx.investmentOffer.valuation}` : '',
      ]
        .filter(Boolean)
        .join('; ') + '.',
    );
  }
  if (use) {
    longSentences.push(
      `Yatırım ${use} için kullanılacak${ctx.useOfFundsDetail ? ` (${ctx.useOfFundsDetail})` : ''}.`,
    );
  }
  if (ctx.differentiation) {
    longSentences.push(`Farklılaşma: ${sentenceCaseInvestment(ctx.differentiation).replace(/\.$/, '')}.`);
  }
  const team = formatTeamLabel(ctx);
  if (team) longSentences.push(`Ekip: ${team}.`);
  if (ctx.geography) longSentences.push(`Konum: ${ctx.geography}.`);

  const highlights = [
    funding && equity ? `${funding} · ${equity} hisse` : funding || (equity ? `${equity} hisse` : ''),
    statusBits.length ? joinList(statusBits, ' · ') : '',
    model ? `İş modeli: ${model}` : '',
    use ? `Kullanım: ${use}` : '',
    ctx.differentiation ? sentenceCaseInvestment(ctx.differentiation) : '',
  ].filter(Boolean);

  return {
    shortDescription: shortDescription.slice(0, 500),
    longDescription: longSentences.join(' ').slice(0, 2000),
    highlights: highlights.slice(0, 5),
  };
}
