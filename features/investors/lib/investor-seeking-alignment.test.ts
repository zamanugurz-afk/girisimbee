import { describe, expect, it } from 'vitest';
import { buildInvestmentContext } from '@/features/investments/lib/investment-context';
import { buildInvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';
import { resolveInvestorTicket } from '@/features/investors/lib/investor-ticket';
import {
  BUSINESS_MODEL_OPTIONS,
  INVESTOR_SECTOR_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  REVENUE_STATUS_OPTIONS,
  STARTUP_STAGES,
  TARGET_CUSTOMER_OPTIONS,
  TRACTION_STATUS_OPTIONS,
  USE_OF_FUNDS_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import {
  INVESTOR_FIELD_SCHEMA,
  SEEKING_INVESTMENT_FIELD_SCHEMA,
} from '@/features/listings/config/listing-type-config';

function schemaOptions(schema: { fields: Array<{ key: string; options?: readonly string[] }> }, key: string) {
  return schema.fields.find((field) => field.key === key)?.options ?? [];
}

describe('seeking ↔ investor canonical field alignment', () => {
  it('shares the same catalogs for comparable fields', () => {
    expect(schemaOptions(SEEKING_INVESTMENT_FIELD_SCHEMA, 'sector')).toEqual([...INVESTOR_SECTOR_OPTIONS]);
    expect(schemaOptions(INVESTOR_FIELD_SCHEMA, 'sectors')).toEqual([...INVESTOR_SECTOR_OPTIONS]);
    expect(schemaOptions(SEEKING_INVESTMENT_FIELD_SCHEMA, 'stage')).toEqual([...STARTUP_STAGES]);
    expect(schemaOptions(INVESTOR_FIELD_SCHEMA, 'preferredProductStatuses')).toEqual([...PRODUCT_STATUS_OPTIONS]);
    expect(schemaOptions(INVESTOR_FIELD_SCHEMA, 'preferredBusinessModels')).toEqual([...BUSINESS_MODEL_OPTIONS]);
    expect(schemaOptions(INVESTOR_FIELD_SCHEMA, 'preferredTargetCustomers')).toEqual([...TARGET_CUSTOMER_OPTIONS]);
    expect(schemaOptions(INVESTOR_FIELD_SCHEMA, 'revenueExpectation')).toEqual([...REVENUE_STATUS_OPTIONS]);
    expect(schemaOptions(INVESTOR_FIELD_SCHEMA, 'tractionExpectation')).toEqual([...TRACTION_STATUS_OPTIONS]);
    expect(schemaOptions(INVESTOR_FIELD_SCHEMA, 'preferredUseOfFunds')).toEqual([...USE_OF_FUNDS_OPTIONS]);
  });

  it('makes investor criteria comparable to a seeking investment context without scoring', () => {
    const startup = buildInvestmentContext({
      title: 'FaturaAI',
      city: 'İstanbul',
      customFields: {
        sector: 'SaaS / Yazılım',
        stage: 'MVP aşaması',
        productStatus: 'MVP',
        businessModel: ['SaaS'],
        targetCustomer: ['B2B'],
        revenueStatus: 'İlk gelir',
        tractionStatus: 'Pilot',
        investmentAmount: '1.000.000 - 2.500.000 TL',
        useOfFunds: ['Ürün geliştirme'],
      },
    });
    const investor = buildInvestorCriteriaContext({
      title: 'SaaS Melek',
      customFields: {
        investorType: 'Melek yatırımcı',
        sectors: ['SaaS / Yazılım', 'Fintech'],
        preferredStages: ['Fikir aşaması', 'MVP aşaması'],
        preferredProductStatuses: ['MVP', 'Beta'],
        preferredBusinessModels: ['SaaS'],
        preferredTargetCustomers: ['B2B'],
        revenueExpectation: 'İlk gelir',
        tractionExpectation: 'Pilot',
        preferredGeographies: ['İstanbul', 'Türkiye geneli'],
        preferredUseOfFunds: ['Ürün geliştirme', 'Satış'],
        investmentAmount: '1.000.000 - 2.500.000 TL',
      },
    });

    expect(investor.preferredSectors).toContain(startup.sector);
    expect(investor.preferredStages).toContain(startup.stage);
    expect(investor.preferredProductStatuses).toContain(startup.productStatus);
    expect(investor.preferredBusinessModels).toEqual(expect.arrayContaining(startup.businessModel));
    expect(investor.preferredTargetCustomers).toEqual(expect.arrayContaining(startup.targetCustomer));
    expect(investor.revenueExpectation).toBe(startup.revenueStatus);
    expect(investor.tractionExpectation).toBe(startup.tractionStatus);
    expect(investor.preferredUseOfFunds).toEqual(expect.arrayContaining(startup.useOfFunds));
    expect(investor.preferredGeographies).toContain(startup.geography);

    const ticket = resolveInvestorTicket({
      investmentAmount: investor.investmentTicket.amountRange,
    });
    expect(startup.fundingNeed.amountRange).toBe(ticket.amountRange);
    expect(ticket.min).toBe(1_000_000);
    expect(ticket.max).toBe(2_500_000);
  });
});
