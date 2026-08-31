export type SetupEquipmentCategory = 
  | 'mandatory' 
  | 'core_tech' 
  | 'furniture' 
  | 'appliances' 
  | 'machinery' 
  | 'safety';

export interface SetupEquipment {
  id: string;
  name: string;
  category: SetupEquipmentCategory;
  unitCost: number;
  defaultQty: number;
  minQty: number;
  isLocked: boolean; // true = Mevzuat/işletme standardı gereği kilitli zorunlu
  unitLabel: string;
  description?: string;
}

export interface SetupStaffRole {
  role: string;
  count: number;
  avgSalary: number;
  isMandatory?: boolean;
  description?: string;
}

export interface SetupLegalFeeItem {
  name: string;
  cost: number;
  description: string;
  isMandatory?: boolean;
}

export interface SetupBreakEvenMetric {
  label: string;
  unitPrice: number;
  targetUnitsPerDay: number;
  unitLabel: string;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  emoji: string;
  categoryGroup: string;
  defaultM2: number;
  fitoutCostPerM2: number; // Tadilat & Dekorasyon m² maliyeti
  mandatoryLegalItems: SetupLegalFeeItem[];
  equipments: SetupEquipment[];
  recommendedStaff: SetupStaffRole[];
  breakEvenMetric: SetupBreakEvenMetric;
  monthlyUtilitiesEstimate: number;
  monthlyAccountingFee: number;
  monthlySoftwareFee: number;
  workingCapitalMonths?: number;
}

export interface BusinessSetupCalculationResult {
  totalInitialInvestment: number;
  equipmentTotal: number;
  leaseInitialTotal: number; // 1 Peşin + 2 Depozito + 1 Emlak Komisyonu
  fitoutTotal: number;
  legalFeesTotal: number;
  workingCapitalReserve: number;
  
  monthlyOperatingCost: number;
  monthlyRent: number;
  monthlyStaffCost: number;
  monthlyUtilities: number;
  monthlyAccounting: number;
  monthlySoftware: number;
  
  dailyBreakEvenCount: number;
  monthlyBreakEvenRevenue: number;
  breakEvenMetric: SetupBreakEvenMetric;
}
