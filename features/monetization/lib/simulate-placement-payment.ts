/**
 * Client-side placement payment simulation — no POS, no DB writes.
 * Real providers (iyzico / stripe / paytr) plug in later via IPaymentProvider.
 */

export type PlacementPaymentSimulationStatus =
  | 'idle'
  | 'selected'
  | 'pending'
  | 'ready';

export const PLACEMENT_SIMULATION_STATUS_LABELS: Record<
  PlacementPaymentSimulationStatus,
  string
> = {
  idle: 'Paket seçilmedi',
  selected: 'Paket seçildi',
  pending: 'Ödeme bekleniyor',
  ready: 'Yayınlanmaya hazır',
};

const PENDING_MS = 900;
const READY_MS = 700;

export async function simulatePlacementPayment(options?: {
  signal?: AbortSignal;
  onStatus?: (status: PlacementPaymentSimulationStatus) => void;
}): Promise<'ready'> {
  const { signal, onStatus } = options ?? {};

  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    });

  onStatus?.('selected');
  await wait(280);
  onStatus?.('pending');
  await wait(PENDING_MS);
  onStatus?.('ready');
  await wait(READY_MS);
  return 'ready';
}
