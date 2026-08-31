import type {
  BusinessTemplate,
  SetupEquipment,
  SetupStaffRole,
  SetupLegalFeeItem,
  BusinessSetupCalculationResult,
  StaffCostDetail,
} from '../types/business-setup.types';
import { getDistrictRentalRate, calculateLeaseInitialCost } from '../data/district-rental-rates';

export interface SetupCalculationParams {
  template: BusinessTemplate;
  city: string;
  district?: string;
  m2: number;
  customMonthlyRent?: number | null;
  depositMonths?: number;
  includeBrokerFee?: boolean;
  includeFitout: boolean;
  customFitoutCostPerM2?: number | null;
  includeInventory?: boolean;
  customInventoryCost?: number | null;
  includeSoftwareLicense?: boolean;
  customSoftwareInitialCost?: number | null;
  customSoftwareMonthlyCost?: number | null;
  equipments: (SetupEquipment & { selected: boolean; qty: number })[];
  staff: SetupStaffRole[];
  legalFees: (SetupLegalFeeItem & { selected: boolean })[];
  workingCapitalMonths?: number;
  customUtilities?: number | null;
  customAccounting?: number | null;
}

export function calculateStaffEmployerCost(netSalary: number): StaffCostDetail {
  if (!netSalary || netSalary <= 0) {
    return { netSalary: 0, grossSalary: 0, sgkEmployerCost: 0, totalEmployerCost: 0 };
  }
  const grossSalary = Math.round(netSalary * 1.28);
  const sgkEmployerCost = Math.round(grossSalary * 0.175);
  const totalEmployerCost = grossSalary + sgkEmployerCost;

  return {
    netSalary,
    grossSalary,
    sgkEmployerCost,
    totalEmployerCost,
  };
}

export function calculateBusinessSetupBudget(params: SetupCalculationParams): BusinessSetupCalculationResult {
  const {
    template,
    city,
    district,
    m2,
    customMonthlyRent,
    depositMonths = 1,
    includeBrokerFee = false,
    includeFitout,
    customFitoutCostPerM2,
    includeInventory = true,
    customInventoryCost,
    includeSoftwareLicense = true,
    customSoftwareInitialCost,
    customSoftwareMonthlyCost,
    equipments,
    staff,
    legalFees,
    workingCapitalMonths = 3,
    customUtilities,
    customAccounting,
  } = params;

  // 1. Ekipman / Demirbaş Maliyeti
  const equipmentTotal = equipments.reduce((sum, eq) => {
    if (!eq.selected) return sum;
    return sum + eq.unitCost * (eq.qty || eq.defaultQty);
  }, 0);

  // 2. Kira ve Taşınma Peşinatı (1 Peşin + 1 Depozito = 2x Kira varsayılan)
  const calculatedM2Rate = getDistrictRentalRate(city, district);
  const monthlyRent = customMonthlyRent != null && customMonthlyRent > 0
    ? customMonthlyRent
    : Math.round(m2 * calculatedM2Rate);

  const leaseCosts = calculateLeaseInitialCost(monthlyRent, depositMonths, includeBrokerFee);
  const leaseInitialTotal = leaseCosts.totalLeaseUpfront;

  // 3. Tadilat & Dekorasyon
  const fitoutRate = customFitoutCostPerM2 != null ? customFitoutCostPerM2 : template.fitoutCostPerM2;
  const fitoutTotal = includeFitout ? Math.round(m2 * fitoutRate) : 0;

  // 4. İlk Stok & Emtia / İlaç Alım Bütçesi
  const initialInventoryTotal = includeInventory
    ? (customInventoryCost != null && customInventoryCost >= 0 ? customInventoryCost : template.initialInventoryCost)
    : 0;

  // 5. Sektörel ERP, POS & Lisans Maliyeti
  const softwareLicenseInitial = includeSoftwareLicense
    ? (customSoftwareInitialCost != null && customSoftwareInitialCost >= 0 ? customSoftwareInitialCost : (template.softwareLicense?.initialCost || 0))
    : 0;

  // 6. Resmi Ruhsat & Harçlar
  const legalFeesTotal = legalFees.reduce((sum, fee) => {
    if (!fee.selected) return sum;
    return sum + fee.cost;
  }, 0);

  // 7. Aylık Personel Gideri (Detaylı SGK İşveren Dağılımı)
  const staffCostDetails: { role: string; count: number; detail: StaffCostDetail }[] = [];
  let monthlyStaffCost = 0;

  for (const s of staff) {
    if (s.count > 0 && s.avgSalary > 0) {
      const detail = calculateStaffEmployerCost(s.avgSalary);
      staffCostDetails.push({ role: s.role, count: s.count, detail });
      monthlyStaffCost += s.count * detail.totalEmployerCost;
    }
  }

  // 8. Aylık Sabit İşletme Giderleri
  const monthlyUtilities = customUtilities != null ? customUtilities : template.monthlyUtilitiesEstimate;
  const monthlyAccounting = customAccounting != null ? customAccounting : template.monthlyAccountingFee;
  const monthlySoftware = includeSoftwareLicense
    ? (customSoftwareMonthlyCost != null && customSoftwareMonthlyCost >= 0 ? customSoftwareMonthlyCost : (template.softwareLicense?.monthlyCost || 0))
    : 0;
  const monthlyStopaj = Math.round(monthlyRent * 0.20); // %20 Kira Stopajı

  const monthlyOperatingCost = Math.round(
    monthlyRent +
    monthlyStopaj +
    monthlyStaffCost +
    monthlyUtilities +
    monthlyAccounting +
    monthlySoftware
  );

  // 9. İşletme Sermayesi Güvence Fonu (Varsayılan 3 ay)
  const workingCapitalReserve = Math.round(monthlyOperatingCost * (workingCapitalMonths || 0));

  // 10. Toplam İlk Kurulum Yatırımı
  const totalInitialInvestment = Math.round(
    equipmentTotal +
    leaseInitialTotal +
    fitoutTotal +
    initialInventoryTotal +
    softwareLicenseInitial +
    legalFeesTotal +
    workingCapitalReserve
  );

  return {
    totalInitialInvestment,
    equipmentTotal,
    leaseInitialTotal,
    fitoutTotal,
    initialInventoryTotal,
    softwareLicenseInitial,
    legalFeesTotal,
    workingCapitalReserve,
    minLegalCapital: template.capitalRequirement?.minLegalCapital || 0,

    monthlyOperatingCost,
    monthlyRent,
    monthlyStaffCost: Math.round(monthlyStaffCost),
    staffCostDetails,
    monthlyUtilities,
    monthlyAccounting,
    monthlySoftware,
  };
}
