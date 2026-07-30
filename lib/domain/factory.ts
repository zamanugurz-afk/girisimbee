/**
 * Shared factory utilities — deterministic IDs for tests/mocks, timestamps for entities.
 */

let mockCounter = 0;

/** Reset mock counter between test suites. */
export function resetMockCounter(): void {
  mockCounter = 0;
}

/** Deterministic UUID v4-like string for mock data (not cryptographically secure). */
export function mockUuid(prefix = '00000000'): string {
  mockCounter += 1;
  const seq = String(mockCounter).padStart(4, '0');
  return `${prefix.slice(0, 8)}-${seq}-4000-8000-000000000000`;
}

export function now(): string {
  return new Date().toISOString();
}

export function timestamps(at?: string) {
  const ts = at ?? now();
  return { createdAt: ts, updatedAt: ts };
}

export function softDeletable(deletedAt: string | null = null) {
  return { deletedAt };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}
