/**
 * Client-side pending package payments (simulation).
 * Survives refresh via localStorage; no POS / migration required.
 */
import type { PlacementPackageSlug } from '@/features/monetization/types/listing-placement.types';
import { PLACEMENT_PACKAGE_CONFIG } from '@/features/monetization/types/listing-placement.types';

export type PendingPackagePaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export interface PendingPackagePayment {
  id: string;
  userId: string;
  listingId: string;
  listingTitle?: string;
  packages: PlacementPackageSlug[];
  amountCents: number;
  status: PendingPackagePaymentStatus;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'Girisimbee.pending_package_payments.v1';

function readAll(): PendingPackagePayment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingPackagePayment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: PendingPackagePayment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota
  }
  window.dispatchEvent(new CustomEvent('Girisimbee:pending-payments-changed'));
}

export function listPendingPackagePayments(userId: string): PendingPackagePayment[] {
  return readAll()
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listOpenPendingPackagePayments(userId: string): PendingPackagePayment[] {
  return listPendingPackagePayments(userId).filter(
    (item) => item.status === 'pending' || item.status === 'processing',
  );
}

export function createPendingPackagePayment(input: {
  userId: string;
  listingId: string;
  listingTitle?: string;
  packages: PlacementPackageSlug[];
}): PendingPackagePayment {
  const amountCents = input.packages.reduce(
    (sum, slug) => sum + PLACEMENT_PACKAGE_CONFIG[slug].priceCents,
    0,
  );
  const now = new Date().toISOString();
  const item: PendingPackagePayment = {
    id: `ppay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    listingId: input.listingId,
    listingTitle: input.listingTitle,
    packages: input.packages,
    amountCents,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  writeAll([item, ...readAll()]);
  return item;
}

export function updatePendingPackagePayment(
  id: string,
  status: PendingPackagePaymentStatus,
): PendingPackagePayment | null {
  const all = readAll();
  const index = all.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const updated: PendingPackagePayment = {
    ...all[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  writeAll(all);
  return updated;
}

export function formatPendingPaymentLabel(item: PendingPackagePayment): string {
  const names = item.packages.map((slug) => PLACEMENT_PACKAGE_CONFIG[slug].name).join(' + ');
  return names || 'Paket';
}
