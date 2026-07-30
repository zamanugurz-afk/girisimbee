import { SyncService } from './sync-service';

/**
 * Scheduler — runs sync cycles at configurable intervals.
 *
 * Supports intervals: 5, 10, 15, 30 minutes.
 * Uses a single timer that re-arms after each sync completes.
 * If a sync is still running when the next interval fires,
 * the cycle is skipped (no overlapping runs).
 *
 * In a browser context, this uses setTimeout. In an edge function
 * or serverless context, syncs are triggered by external cron
 * calling the sync edge function endpoint.
 */
export class SyncScheduler {
  private syncService: SyncService;
  private intervalMinutes: number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private keywords: string[];
  private onSyncComplete?: (status: string) => void;

  constructor(
    syncService: SyncService,
    intervalMinutes: number = 10,
    keywords: string[] = [],
    onSyncComplete?: (status: string) => void,
  ) {
    this.syncService = syncService;
    this.intervalMinutes = intervalMinutes;
    this.keywords = keywords;
    this.onSyncComplete = onSyncComplete;
  }

  /** Start the scheduler. Runs an immediate sync, then re-arms. */
  start(): void {
    if (this.timer) return;
    this.scheduleNext(0);
  }

  /** Stop the scheduler. */
  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /** Change the sync interval. Takes effect on the next cycle. */
  setInterval(minutes: number): void {
    this.intervalMinutes = minutes;
  }

  /** Update search keywords for subsequent syncs. */
  setKeywords(keywords: string[]): void {
    this.keywords = keywords;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get interval(): number {
    return this.intervalMinutes;
  }

  private scheduleNext(delayMs: number): void {
    this.timer = setTimeout(() => this.tick(), delayMs);
  }

  private async tick(): Promise<void> {
    if (this.running) {
      this.scheduleNext(this.intervalMinutes * 60 * 1000);
      return;
    }

    this.running = true;
    try {
      const result = await this.syncService.runSync(this.keywords, this.intervalMinutes);
      this.onSyncComplete?.(result.status);
    } catch {
      this.onSyncComplete?.('error');
    } finally {
      this.running = false;
      this.scheduleNext(this.intervalMinutes * 60 * 1000);
    }
  }
}

/** Valid sync interval options in minutes. */
export const SYNC_INTERVALS = [5, 10, 15, 30] as const;
export type SyncInterval = (typeof SYNC_INTERVALS)[number];
