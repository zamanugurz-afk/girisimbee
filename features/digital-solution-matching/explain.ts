import type {
  DigitalSolutionConsumerProfile,
  DigitalSolutionDimensionResult,
  DigitalSolutionMatchExplanation,
  DigitalSolutionProfile,
} from '@/features/digital-solution-matching/types';

export function generateDigitalSolutionMatchReasons(
  dimensions: DigitalSolutionDimensionResult[],
  consumer: DigitalSolutionConsumerProfile,
  solution: DigitalSolutionProfile,
): DigitalSolutionMatchExplanation[] {
  const reasons: DigitalSolutionMatchExplanation[] = [];
  const addedTexts = new Set<string>();

  const addReason = (kind: 'match' | 'gap', text: string) => {
    if (!addedTexts.has(text)) {
      addedTexts.add(text);
      reasons.push({ kind, text });
    }
  };

  for (const dim of dimensions) {
    if (dim.score === null) continue;

    switch (dim.key) {
      case 'sector':
        if (dim.score >= 0.8) {
          const sec = consumer.industry || solution.industry;
          addReason('match', sec ? `${sec} sektörünüzle güçlü uyum` : 'Sektörünüzle güçlü uyum');
        }
        break;

      case 'targetAudience':
        if (dim.score >= 0.8) {
          const audience = solution.targetAudience;
          addReason('match', audience ? `${audience} ölçeğinize uygun çözüm` : 'İşletme ölçeğinize uygun çözüm');
        }
        break;

      case 'capabilities':
        if (dim.score >= 0.6) {
          addReason('match', 'İhtiyacınıza uygun yetenekler sunuyor');
        }
        break;

      case 'solutionType':
        if (dim.score >= 0.8) {
          const type = solution.solutionType;
          addReason('match', type ? `${type} beklentinizle örtüşüyor` : 'Çözüm türü beklentinizle örtüşüyor');
        }
        break;

      case 'deliveryModel':
        if (dim.score >= 0.8) {
          const model = solution.deliveryModel;
          addReason('match', model ? `${model} teslim modeli uygun` : 'Teslim modeli beklentinize uygun');
        }
        break;

      case 'location':
        if (dim.score === 1.0) {
          addReason('match', 'Lokasyon ve çalışma modeli tam uyumlu');
        } else if (dim.score === 0.85) {
          addReason('gap', 'İstanbul Anadolu ↔ İstanbul Avrupa — küçük lokasyon farkı');
        } else if (dim.score === 0.50) {
          addReason('gap', 'Farklı şehir lokasyon tercihi');
        }
        break;

      case 'priceRange':
        if (dim.score >= 0.8) {
          addReason('match', 'Fiyat ve bütçe aralığı uygun');
        }
        break;

      case 'language':
        if (dim.score >= 0.8) {
          addReason('match', 'Desteklenen diller ekip yapınıza uygun');
        }
        break;
    }
  }

  // Ensure 3 to 5 informative reasons
  if (reasons.length < 3) {
    if (solution.capabilities && solution.capabilities.length > 0) {
      addReason('match', `${solution.capabilities.slice(0, 2).join(', ')} modülleri hazır`);
    }
  }
  if (reasons.length < 3) {
    addReason('match', 'Bulut ve online entegrasyona hazır');
  }

  return reasons.slice(0, 5);
}
