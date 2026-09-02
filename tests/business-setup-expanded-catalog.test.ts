import { describe, it, expect } from 'vitest';
import {
  BUSINESS_TEMPLATES,
  BUSINESS_SETUP_TEMPLATES,
  getBusinessTemplateById,
  calculateDynamicEquipmentQty,
} from '@/features/business-setup/data/business-setup-templates';
import {
  MASTER_SECTORS_LIST,
  getMasterSectorById,
  getSortedMasterSectors,
} from '@/features/common/master-sectors-registry';
import {
  getSectorLegalRoadmap,
  ALL_LEGAL_ROADMAPS,
} from '@/features/legal-assistant/data/legal-application-roadmap';
import {
  getSectorIncentiveProfile,
  ALL_SECTOR_INCENTIVE_PROFILES,
} from '@/features/grants-incentives/data/grants-incentives-data';
import { calculateBusinessSetupBudget } from '@/features/business-setup/services/business-setup-calculator.service';

describe('İş Kurma Asistanı & Master 55 Sektör Genişletilmiş Katalog Doğrulama', () => {
  it('tüm 55 işletme şablonunun eksiksiz ve hatasız yüklendiğini doğrular', () => {
    expect(BUSINESS_SETUP_TEMPLATES.length).toBeGreaterThanOrEqual(55);
    expect(Object.keys(BUSINESS_TEMPLATES).length).toBeGreaterThanOrEqual(55);

    // Specifically test user mentioned sectors and new additions
    const expectedKeys = [
      'waffle-cikolata',
      'bubble-tea-bar',
      'butik-burger',
      'dondurma-gelato',
      'kahvalti-borek-salonu',
      'corbaci-paca',
      'guzellik-lazer-merkezi',
      'nail-art-protez-tirnak',
      'diyetisyen-beslenme-klinigi',
      'yeni-nesil-berber',
      'nalbur-yapi-market',
      'kuyumcu-sarraf',
      'zuccaciye-ev-esyalari',
      'dijital-baski-matbaa',
      'dil-okulu-kurs',
      'turizm-seyahat-acentesi',
      'parti-cocuk-oyun-evi',
      'oto-kiralama-rentacar',
      'oto-yedek-parca',
      'dijital-pazarlama-ajansi',
      'mobilya-dekorasyon',
      'cilingir-anahtar',
      'oto-tamir-mekanik',
      'sigorta-acentesi',
      'eczane-medikal',
      'dis-klinigi',
    ];

    for (const key of expectedKeys) {
      const template = getBusinessTemplateById(key);
      expect(template).toBeDefined();
      expect(template.id).toBe(key);
      expect(template.name).toBeTruthy();
      expect(template.emoji).toBeTruthy();
      expect(template.categoryGroup).toBeTruthy();
      expect(template.defaultM2).toBeGreaterThan(0);
      expect(template.legalBasis).toBeTruthy();
      expect(template.statutoryCapital).toBeGreaterThan(0);
      expect(template.mandatoryLegalItems.length).toBeGreaterThan(0);
      expect(template.equipments.length).toBeGreaterThan(0);
      expect(template.initialInventoryCost).toBeGreaterThan(0);
      expect(template.softwareLicenseCost.name).toBeTruthy();
      expect(template.recommendedStaff.length).toBeGreaterThan(0);
      expect(template.breakEvenMetric.label).toBeTruthy();
      expect(template.breakEvenMetric.unitPrice).toBeGreaterThan(0);
      expect(template.revenueModel.avgTicketPrice).toBeGreaterThan(0);
      expect(template.revenueModel.grossMarginPercent).toBeGreaterThan(0);
    }
  });

  it('her sektör için Bütçe Hesaplama Motorunun (calculateBusinessSetupBudget) hatasız çalıştığını doğrular', () => {
    for (const template of BUSINESS_SETUP_TEMPLATES) {
      const budget = calculateBusinessSetupBudget({
        template,
        city: 'İstanbul',
        district: 'Kadıköy',
        m2: template.defaultM2,
        isCustomRent: false,
        customMonthlyRent: null,
        depositMonths: 1,
        includeBrokerFee: true,
        includeFitout: true,
        customFitoutCostPerM2: template.fitoutCostPerM2 || 3000,
        includeInventory: true,
        isCustomInventory: false,
        customInventoryCost: null,
        includeSoftwareLicense: true,
        equipments: template.equipments.map((eq) => {
          const dynamicQty = calculateDynamicEquipmentQty(eq, template.defaultM2);
          return {
            ...eq,
            minQty: dynamicQty.minQty,
            defaultQty: dynamicQty.defaultQty,
            selected: true,
            qty: dynamicQty.defaultQty,
          };
        }),
        staff: template.recommendedStaff,
        legalFees: template.mandatoryLegalItems.map((item) => ({ ...item, selected: true })),
        workingCapitalMonths: 3,
        customDailyVolume: null,
        customAvgTicketPrice: null,
      });

      expect(budget).toBeDefined();
      expect(budget.totalInitialInvestment).toBeGreaterThan(0);
      expect(budget.monthlyOperatingCost).toBeGreaterThan(0);
      expect(budget.revenueProjection.monthlyGrossRevenue).toBeGreaterThan(0);
      expect(budget.dailyBreakEvenCount).toBeGreaterThan(0);
    }
  });

  it('Hukuk Asistanı ve Hibe Teşvik modülleri ile 55 sektörün %100 senkronize olduğunu doğrular', () => {
    expect(MASTER_SECTORS_LIST.length).toBeGreaterThanOrEqual(55);

    for (const ms of MASTER_SECTORS_LIST) {
      // 1. Legal Roadmap verification
      const roadmap = getSectorLegalRoadmap(ms.id);
      expect(roadmap).toBeDefined();
      expect(roadmap.steps.length).toBe(5);
      expect(roadmap.totalEstimatedLegalCost).toBeGreaterThan(0);

      // 2. Incentive profile verification
      const incentive = getSectorIncentiveProfile(ms.id);
      expect(incentive).toBeDefined();
      expect(incentive.naceCode).toBeTruthy();
      expect(incentive.availableGrants.length).toBeGreaterThan(0);
    }
  });
});
