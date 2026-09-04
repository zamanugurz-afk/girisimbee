export type RadarCategoryKey =
  | 'cafe'
  | 'pet_shop'
  | 'butcher'
  | 'bakery'
  | 'market'
  | 'hairdresser'
  | 'gym'
  | 'pharmacy'
  | 'insurance_agency'
  | 'travel_agency'
  | 'real_estate'
  | 'auto_gallery'
  | 'car_wash'
  | 'restaurant'
  | 'boutique'
  | 'stationery'
  | 'florist'
  | 'optician'
  | 'dry_cleaning'
  | 'dental_clinic'
  | 'kindergarten'
  | 'law_firm'
  | 'software_agency'
  | 'furniture'
  | 'electronics'
  | (string & {});

export interface RadarCategoryMeta {
  key: RadarCategoryKey;
  label: string;
  emoji: string;
  iconName: string;
  accent: string;
  overpassFilter: string;
  averageCatchmentRadius: number;
  idealDensityPerKm2: number;
  isPopularTop8?: boolean;
  searchKeywords?: string[];
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

export interface MarketGapConcept {
  title: string;
  tag: string;
  description: string;
  targetAudience: string;
  suitabilityScore: number;
}

export interface MissingSectorItem {
  key: string;
  label: string;
  emoji: string;
  existingCount: number;
  idealCount: number;
  demandScore: number;
  popularityRank: number;
  statusBadge: string;
  opportunityReason: string;
}

export interface RadarIntelligenceReport {
  summaryAdvice: string;
  marketGapSummary: string;
  marketGapScore: number;
  missingSectors: MissingSectorItem[];
  missingConcepts: MarketGapConcept[];
  recommendedEntryStrategy: string;
  strategyRationale: string;
  estimatedTicketSize: string;
  targetDemographic: string;
  pros: string[];
  cons: string[];
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
  availableSectors?: Record<string, number>;
  dailySnapshot?: {
    cycleId: string;
    syncedAt: string;
    isDailySnapshot: boolean;
  };
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
