export type RadarCategoryKey =
  | 'cafe'
  | 'pet_shop'
  | 'butcher'
  | 'bakery'
  | 'market'
  | 'hairdresser'
  | 'gym'
  | 'pharmacy'
  | 'car_wash'
  | 'restaurant'
  | 'boutique'
  | 'dry_cleaning';

export interface RadarCategoryMeta {
  key: RadarCategoryKey;
  label: string;
  emoji: string;
  iconName: string;
  accent: string;
  overpassFilter: string;
  averageCatchmentRadius: number;
  idealDensityPerKm2: number;
}

export interface CompetitorPoi {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: RadarCategoryKey;
  categoryLabel: string;
  address?: string;
  brand?: string;
  distanceMeters: number;
}

export interface RadarListingMatch {
  id: string;
  title: string;
  price?: string;
  listingType: string;
  categoryLabel: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  href: string;
  tag?: string;
  isSuper?: boolean;
  companyName?: string;
  city?: string;
  district?: string;
}

export type SaturationLevel = 'low' | 'moderate' | 'high' | 'oversaturated';

export interface RadarAnalysisMetrics {
  competitorCount: number;
  areaKm2: number;
  densityPerKm2: number;
  saturationScore: number;
  saturationLevel: SaturationLevel;
  saturationLabel: string;
  opportunityScore: number;
  opportunityLabel: string;
}

export interface RadarIntelligenceReport {
  summaryAdvice: string;
  pros: string[];
  cons: string[];
  targetDemographic: string;
  differentiationIdea: string;
  recommendedPricePoint: string;
}

export interface RadarSpatialQueryInput {
  lat: number;
  lng: number;
  radiusMeters: number;
  category: RadarCategoryKey;
  locationName?: string;
}

export interface RadarSpatialResponse {
  query: {
    lat: number;
    lng: number;
    radiusMeters: number;
    category: RadarCategoryKey;
    categoryLabel: string;
    locationName?: string;
  };
  metrics: RadarAnalysisMetrics;
  listingsInRadius: RadarListingMatch[];
  competitors: CompetitorPoi[];
  intelligence: RadarIntelligenceReport;
}

export interface QuickLocationPreset {
  id: string;
  name: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  zoom: number;
  description: string;
}
