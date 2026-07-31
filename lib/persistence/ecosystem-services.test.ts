import { describe, it, expect } from 'vitest';
import { createMemoryContainer } from '@/lib/persistence/container';

describe('ecosystem DI wiring', () => {
  it('wires all P2 services in memory container', () => {
    const container = createMemoryContainer();

    expect(container.ecosystem.documentService).toBeDefined();
    expect(container.ecosystem.matchService).toBeDefined();
    expect(container.ecosystem.applicationService).toBeDefined();
    expect(container.ecosystem.paymentService).toBeDefined();
    expect(container.ecosystem.entrepreneurService).toBeDefined();
    expect(container.ecosystem.entrepreneurListingService).toBeDefined();
    expect(container.ecosystem.entrepreneurApplicationService).toBeDefined();
    expect(container.ecosystem.entrepreneurMonetizationService).toBeDefined();
    expect(container.ecosystem.investorService).toBeDefined();
    expect(container.ecosystem.investorListingService).toBeDefined();
    expect(container.ecosystem.investorApplicationService).toBeDefined();
    expect(container.ecosystem.investorMonetizationService).toBeDefined();
    expect(container.ecosystem.investorListingService).toBe(container.ecosystem.investorService);
    expect(container.ecosystem.candidateService).toBeDefined();
    expect(container.ecosystem.candidateCvService).toBeDefined();
    expect(container.ecosystem.candidateApplicationService).toBeDefined();
    expect(container.ecosystem.candidateMonetizationService).toBeDefined();
    expect(container.ecosystem.employerJobService).toBeDefined();
    expect(container.ecosystem.employerService).toBeDefined();
    expect(container.ecosystem.employerApplicationService).toBeDefined();
    expect(container.ecosystem.employerMonetizationService).toBeDefined();
    expect(container.ecosystem.founderService).toBeDefined();
    expect(container.ecosystem.founderApplicationService).toBeDefined();
    expect(container.ecosystem.founderMonetizationService).toBeDefined();
    expect(container.ecosystem.franchiseService).toBeDefined();
    expect(container.ecosystem.franchiseApplicationService).toBeDefined();
    expect(container.ecosystem.franchiseMonetizationService).toBeDefined();
    expect(container.paymentService).toBe(container.ecosystem.paymentService);
  });
});
