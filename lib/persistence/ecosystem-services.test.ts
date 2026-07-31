import { describe, it, expect } from 'vitest';
import { createMemoryContainer } from '@/lib/persistence/container';

describe('ecosystem DI wiring', () => {
  it('wires all P2 services in memory container', () => {
    const container = createMemoryContainer();

    expect(container.ecosystem.documentService).toBeDefined();
    expect(container.ecosystem.matchService).toBeDefined();
    expect(container.ecosystem.applicationService).toBeDefined();
    expect(container.ecosystem.paymentService).toBeDefined();
    expect(container.ecosystem.entrepreneurListingService).toBeDefined();
    expect(container.ecosystem.investorListingService).toBeDefined();
    expect(container.ecosystem.candidateService).toBeDefined();
    expect(container.ecosystem.employerJobService).toBeDefined();
    expect(container.ecosystem.founderService).toBeDefined();
    expect(container.ecosystem.franchiseService).toBeDefined();
    expect(container.paymentService).toBe(container.ecosystem.paymentService);
  });
});
