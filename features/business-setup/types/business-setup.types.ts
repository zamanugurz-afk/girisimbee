export type SetupEquipmentCategory = 
  | 'mandatory' 
  | 'core_tech' 
  | 'furniture' 
  | 'appliances' 
  | 'machinery' 
  | 'safety'
  | 'comfort';

export interface SetupEquipment {
  id: string;
  name: string;
  category: SetupEquipmentCategory;
  unitCost: number;
  defaultQty: number;
  minQty: number;
  isLocked: boolean; // true = Mevzuat gereği silinemez
  unitLabel: string;
  regulatoryNote?: string;
  description?: string;
  isCustom?: boolean;
  scalesWithM2?: boolean;
  m2Ratio?: number;
}

export interface SetupStaffRole {
  role: string;
  count: number;
  avgSalary: number; // Net Maaş
  isMandatory?: boolean;
  allowOwnerFulfillment?: boolean;
  description?: string;
}

export interface SetupLegalFeeItem {
  name: string;
  cost: number;
  description: string;
  isMandatory?: boolean;
}

export interface SetupSoftwareLicense {
  name: string;
  annual: number; // Yıllık Lisans Bedeli
  monthlyMaintenance: number; // Aylık Bakım / Bulut Aboneliği
  description?: string;
}

export interface SetupBreakEvenMetric {
  label: string;
  unitPrice: number;
  targetUnitsPerDay: number;
  unitLabel?: string;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  emoji?: string;
  categoryGroup: 'Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Mağazacılık' | 'Otomotiv & Sanayi';
  defaultM2: number;
  fitoutCostPerM2?: number;
  legalBasis: string;
  statutoryCapital: number;
  mandatoryLegalItems: SetupLegalFeeItem[];
  equipments: SetupEquipment[];
  initialInventoryCost: number;
  initialInventoryDescription?: string;
  softwareLicenseCost: SetupSoftwareLicense;
  recommendedStaff: SetupStaffRole[];
  breakEvenMetric: SetupBreakEvenMetric;
  monthlyUtilitiesEstimate?: number;
  monthlyAccountingFee?: number;
  workingCapitalMonths?: number;
}

export interface StaffCostDetail {
  netSalary: number;
  grossSalary: number;
  sgkEmployerCost: number;
  totalEmployerCost: number;
}

export interface BusinessSetupCalculationResult {
  totalInitialInvestment: number;
  equipmentTotal: number;
  leaseInitialTotal: number; // 1 Peşin + 1 Depozito (2x Kira)
  fitoutTotal: number;
  initialInventoryTotal: number;
  softwareLicenseInitial: number;
  legalFeesTotal: number;
  workingCapitalReserve: number;
  statutoryCapital: number;
  
  monthlyOperatingCost: number;
  monthlyRent: number;
  monthlyStaffCost: number;
  staffCostDetails: { role: string; count: number; detail: StaffCostDetail }[];
  monthlyUtilities: number;
  monthlyAccounting: number;
  monthlySoftware: number;

  breakEvenMetric: SetupBreakEvenMetric;
  dailyBreakEvenCount: number;
}
