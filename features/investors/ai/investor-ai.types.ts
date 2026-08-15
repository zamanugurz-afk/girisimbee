export const INVESTOR_AI_ACTIONS = ['analyze', 'polish'] as const;
export type InvestorAiAction = (typeof INVESTOR_AI_ACTIONS)[number];

export const INVESTOR_AI_POLISH_KINDS = ['summary', 'thesis'] as const;
export type InvestorAiPolishKind = (typeof INVESTOR_AI_POLISH_KINDS)[number];

/** Compact, PII-stripped payload sent to OpenAI for analyze. */
export type InvestorAiSafeContext = {
  displayName: string;
  investorType: string;
  preferredSectors: string[];
  preferredStages: string[];
  allStages: boolean;
  ticket: string;
  ticketMin: string;
  ticketMax: string;
  preferredProductStatuses: string[];
  preferredBusinessModels: string[];
  preferredTargetCustomers: string[];
  revenueExpectation: string;
  tractionExpectation: string;
  preferredGeographies: string[];
  equityPreference: string;
  valuationApproach: string;
  preferredUseOfFunds: string[];
  investmentThesis: string;
  mustHaveSignals: string[];
  dealBreakers: string[];
};

export type InvestorAiAnalyzeRequest = {
  action: 'analyze';
  context: InvestorAiSafeContext;
  fingerprint: string;
};

export type InvestorAiPolishRequest = {
  action: 'polish';
  kind: InvestorAiPolishKind;
  text: string;
};

export type InvestorAiRequest = InvestorAiAnalyzeRequest | InvestorAiPolishRequest;

export type InvestorAiAnalysis = {
  professionalInvestorSummary: string;
  shortInvestorSummary: string;
  investmentThesis: string;
  investmentHighlights: string[];
  profileGaps: string[];
  improvementSuggestions: string[];
};

export type InvestorAiAnalyzeResult = InvestorAiAnalysis & {
  action: 'analyze';
  source: 'ai' | 'cache';
  fingerprint: string;
};

export type InvestorAiPolishResult = {
  action: 'polish';
  source: 'ai' | 'cache' | 'deterministic';
  polished: string;
  fingerprint: string;
};

export type InvestorAiResult = InvestorAiAnalyzeResult | InvestorAiPolishResult;

/** Persisted subset in listings.customFields — only after the user accepts. */
export type InvestorAiStoredAnalysis = InvestorAiAnalysis & {
  fingerprint: string;
  accepted?: boolean;
};
