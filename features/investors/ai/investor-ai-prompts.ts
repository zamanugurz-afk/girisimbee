import type { InvestorAiPolishKind, InvestorAiSafeContext } from '@/features/investors/ai/investor-ai.types';

export const INVESTOR_AI_SYSTEM_ANALYZE = `Sen Girişimbee Yatırım Yapacağım asistanısın.
Sadece verilen JSON yatırımcı kriterlerini sentezle.
ASLA yeni kriter uydurma: sektör, aşama, yatırım tutarı, coğrafya, gelir beklentisi, traction, hisse, değerleme, iş modeli, müşteri tipi.
Input'ta yoksa çıktıya ekleme. Yatırım tavsiyesi verme. Türkçe, kısa, kurucuya yönelik profesyonel dil.
Çıktı JSON: professionalInvestorSummary, shortInvestorSummary, investmentThesis, investmentHighlights, profileGaps, improvementSuggestions.
professionalInvestorSummary 3-5 cümle, shortInvestorSummary 1-2 cümle, listeler 0-4 madde.
Telefon, e-posta, adres yok.`;

export const INVESTOR_AI_SYSTEM_POLISH = `Sen Girişimbee yatırımcı yazım asistanısın.
Sadece verilen metni Türkçe imla, dilbilgisi ve profesyonel dil için düzelt.
ASLA yeni sektör, tutar, aşama, coğrafya veya iddia ekleme.
Çıktı: {"polished": string}`;

export function analyzeInvestorPrompt(context: InvestorAiSafeContext): string {
  return JSON.stringify({ task: 'investor_profile_analysis', context });
}

export function polishInvestorPrompt(input: { kind: InvestorAiPolishKind; text: string }): string {
  return JSON.stringify({
    task: 'improve_investor_text',
    kind: input.kind,
    text: input.text,
  });
}
