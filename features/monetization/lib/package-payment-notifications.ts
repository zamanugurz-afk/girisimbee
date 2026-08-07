/**
 * Helpers to emit package payment notifications (in-app).
 */
import type { UserId } from '@/lib/domain/ids';
import { ids } from '@/lib/domain/ids';
import { getClientContainer } from '@/lib/persistence/container';
import { PLACEMENT_PACKAGE_CONFIG, formatPlacementPriceTry } from '@/features/monetization/types/listing-placement.types';
import type { PlacementPackageSlug } from '@/features/monetization/types/listing-placement.types';
import type { PendingPackagePayment } from '@/features/monetization/lib/pending-package-payments';

function packageNames(packages: PlacementPackageSlug[]): string {
  return packages.map((slug) => PLACEMENT_PACKAGE_CONFIG[slug].name).join(' + ');
}

export async function notifyPackagePaymentPending(
  userId: string,
  payment: PendingPackagePayment,
): Promise<void> {
  const { notificationService } = getClientContainer();
  await notificationService.send({
    userId: ids.user(userId) as UserId,
    type: 'package_payment_pending',
    title: 'Bekleyen ödeme',
    body: `${packageNames(payment.packages)} — ${formatPlacementPriceTry(payment.amountCents)} ödeme bekleniyor.`,
    actionUrl: payment.listingId ? `/ilan/${payment.listingId}` : null,
    entityType: 'listing',
    entityId: payment.listingId,
    metadata: {
      kind: 'package_payment',
      paymentId: payment.id,
      status: 'pending',
      packages: payment.packages,
      amountCents: payment.amountCents,
    },
  });
}

export async function notifyPackagePaymentSucceeded(
  userId: string,
  payment: PendingPackagePayment,
): Promise<void> {
  const { notificationService } = getClientContainer();
  await notificationService.send({
    userId: ids.user(userId) as UserId,
    type: 'package_payment_succeeded',
    title: 'Ödeme başarılı',
    body: `${packageNames(payment.packages)} ödemesi tamamlandı.`,
    actionUrl: payment.listingId ? `/ilan/${payment.listingId}` : null,
    entityType: 'listing',
    entityId: payment.listingId,
    metadata: {
      kind: 'package_payment',
      paymentId: payment.id,
      status: 'succeeded',
      packages: payment.packages,
      amountCents: payment.amountCents,
    },
  });
}

export async function notifyPackageActivated(
  userId: string,
  payment: PendingPackagePayment,
): Promise<void> {
  const { notificationService } = getClientContainer();
  await notificationService.send({
    userId: ids.user(userId) as UserId,
    type: 'package_activated',
    title: 'Paket aktif',
    body: `${packageNames(payment.packages)} ilanınız için aktifleştirildi. Ana sayfa vitrininde görünebilir.`,
    actionUrl: payment.listingId ? `/ilan/${payment.listingId}` : null,
    entityType: 'listing',
    entityId: payment.listingId,
    metadata: {
      kind: 'package_payment',
      paymentId: payment.id,
      status: 'activated',
      packages: payment.packages,
      amountCents: payment.amountCents,
    },
  });
}
