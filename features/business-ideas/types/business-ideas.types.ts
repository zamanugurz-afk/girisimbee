export type IdeaCategory =
  | 'side_hustle'
  | 'field_mobile'
  | 'local_business_services'
  | 'home_craft';

export type WorkStyle =
  | 'after_hours' // Mesai Sonrası & Hafta Sonu
  | 'mobile'      // Sahada / Mobil
  | 'home'        // Evden / Atölyeden
  | 'full_time';  // Tam Zamanlı

export type CapitalTier =
  | 'micro'       // 0 - 15.000 ₺ (Sıfır / Mikro Sermaye)
  | 'low'         // 15.000 - 60.000 ₺ (Düşük Sermaye)
  | 'medium'      // 60.000 - 200.000 ₺ (Orta Sermaye)
  | 'scale';      // 200.000 ₺+ (Gelişmiş Donanım)

export type RevenueFrequency = 'daily' | 'monthly' | 'project';

export interface RequiredToolItem {
  name: string;
  estimatedCost: number;
  isMandatory: boolean;
  description?: string;
}

export interface ExecutionStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface BusinessIdea {
  id: string;
  slug: string;
  title: string;
  emoji: string;
  tagline: string;
  category: IdeaCategory;
  categoryLabel: string;
  workStyle: WorkStyle;
  workStyleLabel: string;
  capitalTier: CapitalTier;
  capitalRange: {
    min: number;
    max: number;
    formatted: string;
  };
  timeToFirstIncome: string; // örn: "1 - 3 Gün", "1 Hafta", "2 - 4 Hafta"
  potentialMonthlyEarnings: {
    min: number;
    max: number;
    average: number;
    formatted: string;
  };
  profitMarginPercent: number; // örn: 75 (%75)
  revenueFrequency: RevenueFrequency;
  revenueFrequencyLabel: string;
  dailyRevenueExample?: string; // örn: "Günde 2 koltuk yıkama = 1.600 ₺ net günlük kazanç"
  difficultyLevel: 'Kolay' | 'Orta' | 'İleri';
  trendBadge?: string; // örn: "🔥 Yüksek Talep", "⚡ Sıfır Sermaye", "🌙 Hafta Sonu Favorisi"
  targetCustomers: string[];
  requiredTools: RequiredToolItem[];
  executionSteps: ExecutionStep[];
  proTips: string[];
  commonMistakes: string[];
  summaryDescription: string;
}
