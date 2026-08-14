export const INVESTMENT_AI_ACTIONS = ['analyze', 'polish'] as const;
export type InvestmentAiAction = (typeof INVESTMENT_AI_ACTIONS)[number];

export const INVESTMENT_AI_POLISH_KINDS = [
  'summary',
  'problem',
  'solution',
  'differentiation',
  'useOfFundsDetail',
] as const;
export type InvestmentAiPolishKind = (typeof INVESTMENT_AI_POLISH_KINDS)[number];

/** Compact, PII-stripped payload sent to OpenAI for analyze. */
export type InvestmentAiSafeContext = {
  startupName: string;
  productName: string;
  sector: string;
  stage: string;
  productStatus: string;
  revenueStatus: string;
  tractionStatus: string;
  businessModel: string[];
  targetCustomer: string[];
  problem: string;
  solution: string;
  differentiation: string;
  traction: {
    monthlyRevenue: string;
    mrr: string;
    arr: string;
    activeCustomers: string;
    totalCustomers: string;
    users: string;
    growthRate: string;
    gmv: string;
  };
  fundingAmount: string;
  equityOffered: string;
  valuation: string;
  useOfFunds: string[];
  useOfFundsDetail: string;
  geography: string;
  founderCount: string;
  teamSize: string;
  founderExpertise: string[];
};

export type InvestmentAiAnalyzeRequest = {
  action: 'analyze';
  context: InvestmentAiSafeContext;
  fingerprint: string;
};

export type InvestmentAiPolishRequest = {
  action: 'polish';
  kind: InvestmentAiPolishKind;
  text: string;
};

export type InvestmentAiRequest = InvestmentAiAnalyzeRequest | InvestmentAiPolishRequest;

export type InvestmentAiAnalysis = {
  professionalInvestmentSummary: string;
  shortInvestmentSummary: string;
  investmentHighlights: string[];
  businessModelSummary: string;
  fundingUseSummary: string;
  strengths: string[];
  profileGaps: string[];
  improvementSuggestions: string[];
};

export type InvestmentAiAnalyzeResult = InvestmentAiAnalysis & {
  action: 'analyze';
  source: 'ai' | 'cache';
  fingerprint: string;
};

export type InvestmentAiPolishResult = {
  action: 'polish';
  source: 'ai' | 'cache' | 'deterministic';
  polished: string;
  fingerprint: string;
};

export type InvestmentAiResult = InvestmentAiAnalyzeResult | InvestmentAiPolishResult;

/** Persisted subset in listings.customFields — only after the user accepts. */
export type InvestmentAiStoredAnalysis = InvestmentAiAnalysis & {
  fingerprint: string;
  accepted?: boolean;
};
