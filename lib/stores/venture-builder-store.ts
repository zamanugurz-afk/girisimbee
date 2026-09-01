'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  VentureIdeaDraft,
  DEFAULT_VENTURE_DRAFT,
  VentureCollateral,
  VentureBudgetBreakdown,
  VentureFinancialProjection,
  VentureCategory,
} from '@/lib/types/venture-builder';

interface VentureBuilderState {
  currentStep: number;
  draft: VentureIdeaDraft;
  submittedIdeas: VentureIdeaDraft[];
  
  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Data updates
  updateBasicInfo: (data: {
    title?: string;
    category?: VentureCategory;
    oneLiner?: string;
    whyItWorks?: string;
    targetAudience?: string;
    authorName?: string;
    authorCity?: string;
    authorEmail?: string;
    authorPhone?: string;
  }) => void;
  
  updateCollateral: (collateral: Partial<VentureCollateral>) => void;
  updateBudget: (budget: Partial<VentureBudgetBreakdown>) => void;
  updateFinancials: (financials: Partial<VentureFinancialProjection>) => void;
  
  // Lifecycle
  submitDraftForReview: () => VentureIdeaDraft;
  resetDraft: () => void;
}

export const useVentureBuilderStore = create<VentureBuilderState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      draft: { ...DEFAULT_VENTURE_DRAFT, id: 'vb-' + Date.now() },
      submittedIdeas: [],

      setCurrentStep: (step) => set({ currentStep: Math.max(1, Math.min(5, step)) }),
      
      nextStep: () => set((state) => ({ currentStep: Math.min(5, state.currentStep + 1) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      updateBasicInfo: (data) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...data,
            updatedAt: new Date().toISOString(),
          },
        })),

      updateCollateral: (collateralUpdate) =>
        set((state) => ({
          draft: {
            ...state.draft,
            collateral: {
              ...state.draft.collateral,
              ...collateralUpdate,
            },
            updatedAt: new Date().toISOString(),
          },
        })),

      updateBudget: (budgetUpdate) =>
        set((state) => {
          const updatedBudget = {
            ...state.draft.budget,
            ...budgetUpdate,
          };
          // Recalculate total capital required
          const totalRequiredCapital =
            (updatedBudget.equipmentCost || 0) +
            (updatedBudget.initialStockCost || 0) +
            (updatedBudget.marketingCost || 0) +
            (updatedBudget.operatingBufferCost || 0);

          return {
            draft: {
              ...state.draft,
              budget: {
                ...updatedBudget,
                totalRequiredCapital,
              },
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateFinancials: (finUpdate) =>
        set((state) => {
          const updatedFin = {
            ...state.draft.financials,
            ...finUpdate,
          };

          // Automatic Payback period calculation: Total Capital / (Monthly Net Profit * (Share % / 100))
          const totalCap = state.draft.budget.totalRequiredCapital || 60000;
          const monthlyNet = updatedFin.estimatedMonthlyNetProfit || 40000;
          const share = (updatedFin.offeredInvestorSharePercent || 35) / 100;
          const monthlyInvestorReturn = monthlyNet * share;
          const calculatedPaybackMonths = monthlyInvestorReturn > 0
            ? Math.max(1, Math.round((totalCap / monthlyInvestorReturn) * 10) / 10)
            : 3;

          return {
            draft: {
              ...state.draft,
              financials: {
                ...updatedFin,
                calculatedPaybackMonths,
              },
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      submitDraftForReview: () => {
        const state = get();
        const completedDraft: VentureIdeaDraft = {
          ...state.draft,
          status: 'pending_admin_review',
          updatedAt: new Date().toISOString(),
        };

        set((s) => ({
          submittedIdeas: [completedDraft, ...s.submittedIdeas],
          draft: { ...DEFAULT_VENTURE_DRAFT, id: 'vb-' + Date.now() },
          currentStep: 5,
        }));

        return completedDraft;
      },

      resetDraft: () =>
        set({
          currentStep: 1,
          draft: { ...DEFAULT_VENTURE_DRAFT, id: 'vb-' + Date.now() },
        }),
    }),
    {
      name: 'girisimbee-venture-builder-v1',
    }
  )
);
