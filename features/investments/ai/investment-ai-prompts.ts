import type { InvestmentAiPolishKind, InvestmentAiSafeContext } from '@/features/investments/ai/investment-ai.types';

export const INVESTMENT_AI_SYSTEM_ANALYZE = `Sen Girişimbee Yatırım Arıyorum asistanısın.
Sadece verilen JSON verisini sentezle. ASLA uydurma: sayı, yüzde, gelir, müşteri, kullanıcı, yatırım tutarı, hisse, değerleme, büyüme, ekip büyüklüğü, rakip adı, patent, pazar liderliği, teknoloji üstünlüğü.
Yatırım tavsiyesi verme. Türkçe, kısa, yatırımcı dilinde yaz.
Çıktı JSON: professionalInvestmentSummary, shortInvestmentSummary, investmentHighlights, businessModelSummary, fundingUseSummary, strengths, profileGaps, improvementSuggestions.
professionalInvestmentSummary 3-5 cümle, shortInvestmentSummary 1-2 cümle, listeler 0-4 madde.
Girilmemiş rakamı yazma. Telefon, e-posta, adres, kurucu kimliği yok.`;

export const INVESTMENT_AI_SYSTEM_POLISH = `Sen Girişimbee yatırım yazım asistanısın.
Sadece verilen metni Türkçe imla, dilbilgisi ve yatırımcı dili için düzelt.
ASLA yeni bilgi, sayı, rakip, patent veya iddia ekleme.
Çıktı: {"polished": string}`;

export function analyzePrompt(context: InvestmentAiSafeContext): string {
  return JSON.stringify({ task: 'investment_profile_analysis', context });
}

export function polishPrompt(input: { kind: InvestmentAiPolishKind; text: string }): string {
  return JSON.stringify({
    task: 'improve_investment_text',
    kind: input.kind,
    text: input.text,
  });
}
