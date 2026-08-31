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
  equipments: (SetupEquipment & { selected: boolean; qty: number })[];
  staff: SetupStaffRole[];
  legalFees: (SetupLegalFeeItem & { selected: boolean })[];
  workingCapitalMonths?: number;
  customUtilities?: number | null;
  customAccounting?: number | null;
  customSoftware?: number | null;
}

/**
 * Türkiye Bordro Standartlarına Göre Net Maaştan Toplam İşveren Maliyeti Hesaplama:
 * - Brüt Maaş: Net / ~0.78 (%14 SGK İşçi + %1 İşsizlik + Asgari Ücret Vergi İstisnası Üzeri Gelir Vergisi)
 * - SGK İşveren Payı: Brüt x %15.5 (5 Puanlık Düzenli Ödeme Teşviki Dahil) + %2 İşveren İşsizlik = %17.5
 * - Toplam İşveren Maliyeti: Brüt Maaş + SGK İşveren Primi
 */
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

  // 4. Resmi Ruhsat & Harçlar
  const legalFeesTotal = legalFees.reduce((sum, fee) => {
    if (!fee.selected) return sum;
    return sum + fee.cost;
  }, 0);

  // 5. Aylık Personel Gideri (Detaylı SGK İşveren Dağılımı)
  const staffCostDetails: { role: string; count: number; detail: StaffCostDetail }[] = [];
  let monthlyStaffCost = 0;

  for (const s of staff) {
    if (s.count > 0 && s.avgSalary > 0) {
      const detail = calculateStaffEmployerCost(s.avgSalary);
      staffCostDetails.push({ role: s.role, count: s.count, detail });
      monthlyStaffCost += s.count * detail.totalEmployerCost;
    }
  }

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
    minLegalCapital: template.capitalRequirement?.minLegalCapital || 0,

    monthlyOperatingCost,
    monthlyRent,
    monthlyStaffCost: Math.round(monthlyStaffCost),
    staffCostDetails,
    monthlyUtilities,
    monthlyAccounting,
    monthlySoftware,

    dailyBreakEvenCount,
    monthlyBreakEvenRevenue,
    breakEvenMetric,
  };
}
