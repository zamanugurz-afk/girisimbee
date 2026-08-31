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
  isLocked: boolean; // true = Mevzuat/işletme standardı gereği kilitli zorunlu
  unitLabel: string;
  regulatoryNote?: string; // Mevzuat dayanağı (Örn: "Yangın Yönetmeliği Md. 99")
  description?: string;
  isCustom?: boolean;
}

export interface SetupStaffRole {
  role: string;
  count: number;
  avgSalary: number; // Net Maaş
  isMandatory?: boolean;
  allowOwnerFulfillment?: boolean; // İşletme sahibi/ruhsat sahibi bizzat yapabilir (0 seçilebilir)
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

export interface SetupCapitalRequirement {
  minLegalCapital: number; // Yasal asgari sermaye şartı (0 ise sermaye sınırlaması yok)
  legalBasis: string; // İlgili yasa veya yönetmelik
  description: string;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  emoji: string;
  categoryGroup: string;
  defaultM2: number;
  fitoutCostPerM2: number; // Tadilat & Dekorasyon m² maliyeti
  initialInventoryCost: number; // İlk Mal / İlaç / Emtia / Hammadde Alım Bütçesi
  initialInventoryDescription: string;
  capitalRequirement: SetupCapitalRequirement;
  mandatoryLegalItems: SetupLegalFeeItem[];
  equipments: SetupEquipment[];
  recommendedStaff: SetupStaffRole[];
  breakEvenMetric: SetupBreakEvenMetric;
  monthlyUtilitiesEstimate: number;
  monthlyAccountingFee: number;
  monthlySoftwareFee: number;
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
  initialInventoryTotal: number; // İlk Stok / Emtia / İlaç Tutarı
  legalFeesTotal: number;
  workingCapitalReserve: number;
  minLegalCapital: number;
  
  monthlyOperatingCost: number;
  monthlyRent: number;
  monthlyStaffCost: number;
  staffCostDetails: { role: string; count: number; detail: StaffCostDetail }[];
  monthlyUtilities: number;
  monthlyAccounting: number;
  monthlySoftware: number;
  
  dailyBreakEvenCount: number;
  monthlyBreakEvenRevenue: number;
  breakEvenMetric: SetupBreakEvenMetric;
}
