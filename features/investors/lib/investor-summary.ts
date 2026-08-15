import type { InvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';
import { joinList, sentenceCaseInvestment } from '@/features/investments/lib/investment-text';

export type InvestorSummaryDraft = {
  shortDescription: string;
  longDescription: string;
  highlights: string[];
};

export function buildInvestorSummaryDraft(ctx: InvestorCriteriaContext): InvestorSummaryDraft {
  const name = ctx.displayName || 'Yatırımcı';
  const type = ctx.investorType || 'yatırımcı';
  const sectors = joinList(ctx.preferredSectors);
  const stages = ctx.allStages ? 'tüm aşamalar' : joinList(ctx.preferredStages);
  const ticket = ctx.investmentTicket.amountDisplay;
  const geos = joinList(ctx.preferredGeographies);
  const models = joinList(ctx.preferredBusinessModels);
  const customers = joinList(ctx.preferredTargetCustomers);

  const shortDescription = sentenceCaseInvestment(
    [
      `${name}, ${type}`,
      sectors ? `${sectors} odaklı` : '',
      stages ? `${stages} aşamalarına yatırım yapıyor` : '',
      ticket ? `bilet ${ticket}` : '',
    ]
      .filter(Boolean)
      .join('; '),
  );

  const longSentences: string[] = [];
  longSentences.push(`${name} bir ${type.toLocaleLowerCase('tr-TR')}.`);
  if (sectors) longSentences.push(`Odak sektörler: ${sectors}.`);
  if (stages) longSentences.push(`Tercih edilen aşamalar: ${stages}.`);
  if (ticket) {
    const bounds = [
      ctx.investmentTicket.min != null ? `min ${ctx.investmentTicket.min} TL` : '',
      ctx.investmentTicket.max != null ? `max ${ctx.investmentTicket.max} TL` : '',
    ]
      .filter(Boolean)
      .join(', ');
    longSentences.push(`Yatırım bileti ${ticket}${bounds ? ` (${bounds})` : ''}.`);
  }
  if (ctx.preferredProductStatuses.length) {
    longSentences.push(`Ürün durumu: ${joinList(ctx.preferredProductStatuses)}.`);
  }
  if (models || customers) {
    longSentences.push(
      [models ? `iş modeli ${models}` : '', customers ? `hedef müşteri ${customers}` : '']
        .filter(Boolean)
        .join('; ') + '.',
    );
  }
  if (ctx.revenueExpectation || ctx.tractionExpectation) {
    longSentences.push(
      `Beklenti: ${[ctx.revenueExpectation, ctx.tractionExpectation].filter(Boolean).join(' · ')}.`,
    );
  }
  if (geos) longSentences.push(`Coğrafya: ${geos}.`);
  if (ctx.equityPreference || ctx.valuationApproach) {
    longSentences.push(
      [
        ctx.equityPreference ? `hisse ${ctx.equityPreference}` : '',
        ctx.valuationApproach ? `değerleme ${ctx.valuationApproach}` : '',
      ]
        .filter(Boolean)
        .join('; ') + '.',
    );
  }
  if (ctx.preferredUseOfFunds.length) {
    longSentences.push(`Kullanım tercihi: ${joinList(ctx.preferredUseOfFunds)}.`);
  }
  if (ctx.investmentThesis) {
    longSentences.push(`Tez: ${sentenceCaseInvestment(ctx.investmentThesis).replace(/\.$/, '')}.`);
  }
  if (ctx.mustHaveSignals.length) {
    longSentences.push(`Olmazsa olmaz: ${joinList(ctx.mustHaveSignals)}.`);
  }
  if (ctx.dealBreakers.length) {
    longSentences.push(`İstemedikleri: ${joinList(ctx.dealBreakers)}.`);
  }

  const highlights = [
    ticket ? `Bilet: ${ticket}` : '',
    sectors ? `Sektör: ${joinList(ctx.preferredSectors.slice(0, 3))}` : '',
    stages ? `Aşama: ${stages}` : '',
    ctx.investmentThesis ? sentenceCaseInvestment(ctx.investmentThesis) : '',
  ].filter(Boolean);

  return {
    shortDescription: shortDescription.slice(0, 500),
    longDescription: longSentences.join(' ').slice(0, 2000),
    highlights: highlights.slice(0, 4),
  };
}
