import type { BusinessTemplate, SetupEquipment, SetupStaffRole, SetupLegalFeeItem, BusinessSetupCalculationResult } from '../types/business-setup.types';
import { getDistrictRentalRate, calculateLeaseInitialCost } from '../data/district-rental-rates';

export interface SetupCalculationParams {
  template: BusinessTemplate;
  city: string;
  district?: string;
  m2: number;
  customMonthlyRent?: number | null;
  includeFitout: boolean;
  customFitoutCostPerM2?: number | null;
  equipments: (SetupEquipment & { selected: boolean; qty: number })[];
  staff: SetupStaffRole[];
  legalFees: (SetupLegalFeeItem & { selected: boolean })[];
  workingCapitalMonths?: number;
  customUtilities?: number | null;
  customAccounting?: number | null;
  customSoftware?: number | null;
}

export function calculateBusinessSetupBudget(params: SetupCalculationParams): BusinessSetupCalculationResult {
  const {
    template,
    city,
    district,
    m2,
    customMonthlyRent,
    includeFitout,
    customFitoutCostPerM2,
    equipments,
    staff,
    legalFees,
    workingCapitalMonths = 3,
    customUtilities,
    customAccounting,
    customSoftware,
  } = params;

  // 1. Ekipman / Demirbaş Maliyeti
  const equipmentTotal = equipments.reduce((sum, eq) => {
    if (!eq.selected) return sum;
    return sum + eq.unitCost * (eq.qty || eq.defaultQty);
  }, 0);

  // 2. Kira ve Taşınma Peşinatı
  const calculatedM2Rate = getDistrictRentalRate(city, district);
  const monthlyRent = customMonthlyRent != null && customMonthlyRent > 0
    ? customMonthlyRent
    : Math.round(m2 * calculatedM2Rate);

  const leaseCosts = calculateLeaseInitialCost(monthlyRent);
  const leaseInitialTotal = leaseCosts.totalLeaseUpfront; // 1 Peşin + 2 Depozito + 1 Emlak Komisyonu

  // 3. Tadilat & Dekorasyon
  const fitoutRate = customFitoutCostPerM2 != null ? customFitoutCostPerM2 : template.fitoutCostPerM2;
  const fitoutTotal = includeFitout ? Math.round(m2 * fitoutRate) : 0;

  // 4. Resmi Ruhsat & Harçlar
  const legalFeesTotal = legalFees.reduce((sum, fee) => {
    if (!fee.selected) return sum;
    return sum + fee.cost;
  }, 0);

  // 5. Aylık Personel Gideri (Net Maaş + %22.5 SGK / İşveren Payı Yaklaşımı)
  const monthlyStaffCost = staff.reduce((sum, s) => {
    const roleCost = s.count * s.avgSalary * 1.225; // Brüt işveren maliyeti
    return sum + roleCost;
  }, 0);

  // 6. Aylık Sabit İşletme Giderleri
  const monthlyUtilities = customUtilities != null ? customUtilities : template.monthlyUtilitiesEstimate;
  const monthlyAccounting = customAccounting != null ? customAccounting : template.monthlyAccountingFee;
  const monthlySoftware = customSoftware != null ? customSoftware : template.monthlySoftwareFee;
  const monthlyStopaj = Math.round(monthlyRent * 0.20); // %20 Kira Stopajı

  const monthlyOperatingCost = Math.round(
    monthlyRent +
    monthlyStopaj +
    monthlyStaffCost +
    monthlyUtilities +
    monthlyAccounting +
    monthlySoftware
  );

  // 7. İşletme Sermayesi Güvence Fonu (Varsayılan 3 ay)
  const workingCapitalReserve = Math.round(monthlyOperatingCost * (workingCapitalMonths || 0));

  // 8. Toplam İlk Kurulum Yatırımı
  const totalInitialInvestment = Math.round(
    equipmentTotal +
    leaseInitialTotal +
    fitoutTotal +
    legalFeesTotal +
    workingCapitalReserve
  );

  // 9. Başabaş Noktası (Break-Even)
  const breakEvenMetric = template.breakEvenMetric;
  const monthlyBreakEvenRevenue = monthlyOperatingCost;
  const dailyRequiredGross = monthlyOperatingCost / 30;
  const dailyBreakEvenCount = Math.ceil(dailyRequiredGross / (breakEvenMetric.unitPrice || 1));

  return {
    totalInitialInvestment,
    equipmentTotal,
    leaseInitialTotal,
    fitoutTotal,
    legalFeesTotal,
    workingCapitalReserve,

    monthlyOperatingCost,
    monthlyRent,
    monthlyStaffCost: Math.round(monthlyStaffCost),
    monthlyUtilities,
    monthlyAccounting,
    monthlySoftware,

    dailyBreakEvenCount,
    monthlyBreakEvenRevenue,
    breakEvenMetric,
  };
}
