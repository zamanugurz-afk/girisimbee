export type WorkspaceType = 'home' | 'garage_workshop' | 'rented_shop' | 'virtual_mobile' | 'client_location';

export type VehicleType = 'personal_car' | 'light_commercial' | 'motorcycle' | 'none';

export type TimeCommitment = 'full_time' | 'part_time' | 'weekend_project' | 'team_managed';

export type VentureCategory =
  | 'Evcil Hayvan & Yaşam'
  | 'Deneyim & Etkinlik'
  | 'Zanaat & Hatıra'
  | 'Tasarım & Hediyelik'
  | 'Kozmetik & Deneyim'
  | 'Yayıncılık & Çocuk'
  | 'Otomotiv & Mobil Enerji'
  | 'Otomotiv & Yerinde Servis'
  | 'Yiyecek & İçecek'
  | 'Teknoloji & Dijital Servis'
  | 'Hizmet & Temizlik'
  | 'Diğer Niş Girişim';

export interface VentureCollateral {
  workspaceType: WorkspaceType;
  workspaceNote?: string;
  vehicleType: VehicleType;
  vehicleNote?: string;
  timeCommitment: TimeCommitment;
  hoursPerWeek: number;
  skillsAndExperience: string;
}

export interface VentureBudgetBreakdown {
  equipmentCost: number;
  equipmentItems: string[];
  initialStockCost: number;
  marketingCost: number;
  operatingBufferCost: number;
  totalRequiredCapital: number;
}

export interface VentureFinancialProjection {
  estimatedMonthlyRevenue: number;
  estimatedMonthlyNetProfit: number;
  offeredInvestorSharePercent: number; // e.g. 35 for 35% profit share
  dealType: 'profit_share' | 'equity_share' | 'debt_return';
  calculatedPaybackMonths: number;
}

export interface VentureIdeaDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorCity: string;
  authorEmail?: string;
  authorPhone?: string;
  
  // Step 1: Concept
  title: string;
  category: VentureCategory;
  oneLiner: string;
  whyItWorks: string;
  targetAudience: string;

  // Step 2: Collaterals
  collateral: VentureCollateral;

  // Step 3: Budget Needs
  budget: VentureBudgetBreakdown;

  // Step 4: Projections & Offer
  financials: VentureFinancialProjection;

  // Lifecycle Status
  status: 'draft' | 'pending_admin_review' | 'approved' | 'published';
  adminFeedback?: string;
}

export const DEFAULT_VENTURE_DRAFT: VentureIdeaDraft = {
  id: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  authorName: '',
  authorCity: 'İstanbul',
  title: '',
  category: 'Deneyim & Etkinlik',
  oneLiner: '',
  whyItWorks: '',
  targetAudience: '',
  collateral: {
    workspaceType: 'home',
    vehicleType: 'personal_car',
    timeCommitment: 'full_time',
    hoursPerWeek: 40,
    skillsAndExperience: '',
  },
  budget: {
    equipmentCost: 35000,
    equipmentItems: ['Temel Başlangıç Ekipmanı'],
    initialStockCost: 15000,
    marketingCost: 10000,
    operatingBufferCost: 5000,
    totalRequiredCapital: 65000,
  },
  financials: {
    estimatedMonthlyRevenue: 85000,
    estimatedMonthlyNetProfit: 55000,
    offeredInvestorSharePercent: 35,
    dealType: 'profit_share',
    calculatedPaybackMonths: 3,
  },
  status: 'draft',
};
