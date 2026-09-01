import { describe, it, expect, beforeEach } from 'vitest';
import { useVentureBuilderStore } from '@/lib/stores/venture-builder-store';
import { DEFAULT_VENTURE_DRAFT } from '@/lib/types/venture-builder';

describe('Venture Builder ("Fikrim Var, Bütçem Yok") Module', () => {
  beforeEach(() => {
    useVentureBuilderStore.getState().resetDraft();
  });

  it('initializes with default venture draft and step 1', () => {
    const state = useVentureBuilderStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.draft.category).toBe('Deneyim & Etkinlik');
    expect(state.draft.collateral.workspaceType).toBe('home');
    expect(state.draft.collateral.vehicleType).toBe('personal_car');
  });

  it('handles step navigation within 1-5 boundary', () => {
    const store = useVentureBuilderStore.getState();
    store.nextStep();
    expect(useVentureBuilderStore.getState().currentStep).toBe(2);

    store.nextStep();
    store.nextStep();
    store.nextStep();
    store.nextStep(); // Exceeds 5
    expect(useVentureBuilderStore.getState().currentStep).toBe(5);

    store.prevStep();
    expect(useVentureBuilderStore.getState().currentStep).toBe(4);
  });

  it('updates basic info and custom categories', () => {
    const store = useVentureBuilderStore.getState();
    store.updateBasicInfo({
      title: 'Mobil Kafe & Çekirdek Aboneliği',
      category: 'Yiyecek & İçecek',
      oneLiner: 'Plazalara yerinde kahve servisi',
      whyItWorks: 'Sabah kahve kuyruklarına çözüm',
    });

    const updated = useVentureBuilderStore.getState().draft;
    expect(updated.title).toBe('Mobil Kafe & Çekirdek Aboneliği');
    expect(updated.category).toBe('Yiyecek & İçecek');
    expect(updated.oneLiner).toBe('Plazalara yerinde kahve servisi');
  });

  it('updates collateral (vehicle, workspace, hours)', () => {
    const store = useVentureBuilderStore.getState();
    store.updateCollateral({
      workspaceType: 'garage_workshop',
      vehicleType: 'light_commercial',
      hoursPerWeek: 50,
    });

    const updated = useVentureBuilderStore.getState().draft.collateral;
    expect(updated.workspaceType).toBe('garage_workshop');
    expect(updated.vehicleType).toBe('light_commercial');
    expect(updated.hoursPerWeek).toBe(50);
  });

  it('automatically calculates total required capital from budget items', () => {
    const store = useVentureBuilderStore.getState();
    store.updateBudget({
      equipmentCost: 40000,
      initialStockCost: 20000,
      marketingCost: 15000,
      operatingBufferCost: 5000,
    });

    const updatedBudget = useVentureBuilderStore.getState().draft.budget;
    expect(updatedBudget.totalRequiredCapital).toBe(80000);
  });

  it('automatically calculates payback period for investor based on net profit and share %', () => {
    const store = useVentureBuilderStore.getState();
    store.updateBudget({
      equipmentCost: 60000,
      initialStockCost: 20000,
      marketingCost: 10000,
      operatingBufferCost: 10000,
    }); // Total = 100,000 TL

    store.updateFinancials({
      estimatedMonthlyRevenue: 120000,
      estimatedMonthlyNetProfit: 50000,
      offeredInvestorSharePercent: 40, // 50,000 * 40% = 20,000 TL/month return
    });

    const updatedFin = useVentureBuilderStore.getState().draft.financials;
    // 100,000 TL capital / 20,000 TL monthly return = 5 months
    expect(updatedFin.calculatedPaybackMonths).toBe(5);
  });

  it('handles draft submission and sets status to pending_admin_review', () => {
    const store = useVentureBuilderStore.getState();
    store.updateBasicInfo({
      title: 'Özel Gün Epoksi Çiçek Tablosu',
      authorName: 'Uğur Zaman',
      authorCity: 'Ankara',
    });

    const submitted = store.submitDraftForReview();
    expect(submitted.status).toBe('pending_admin_review');
    expect(submitted.title).toBe('Özel Gün Epoksi Çiçek Tablosu');

    const state = useVentureBuilderStore.getState();
    expect(state.submittedIdeas.length).toBeGreaterThan(0);
    expect(state.submittedIdeas[0].status).toBe('pending_admin_review');
  });
});
