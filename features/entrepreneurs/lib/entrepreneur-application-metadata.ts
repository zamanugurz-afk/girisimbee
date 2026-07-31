import { now } from '@/lib/domain/factory';
import type { MatchId, ProfileId } from '@/lib/domain/ids';
import type { Match } from '@/features/matching/types/match.types';
import type {
  EntrepreneurApplicationMetadata,
  EntrepreneurApplicationNote,
  EntrepreneurApplicationStatus,
  EntrepreneurApplicationStatusEvent,
} from '@/features/entrepreneurs/types/entrepreneur-application.types';
import {
  MATCH_TO_ENTREPRENEUR_STATUS,
  ENTREPRENEUR_TO_MATCH_STATUS,
} from '@/features/entrepreneurs/types/entrepreneur-application.types';

const METADATA_KEY = 'entrepreneur' as const;

export function getEntrepreneurMetadata(match: Match): EntrepreneurApplicationMetadata {
  const raw = match.metadata[METADATA_KEY];
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as EntrepreneurApplicationMetadata;
  return {
    notes: Array.isArray(data.notes) ? data.notes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
    coverMessage: data.coverMessage ?? null,
    withdrawn: data.withdrawn ?? false,
  };
}

export function mergeEntrepreneurMetadata(
  match: Match,
  patch: Partial<EntrepreneurApplicationMetadata>,
): Record<string, unknown> {
  const current = getEntrepreneurMetadata(match);
  return {
    ...match.metadata,
    [METADATA_KEY]: {
      ...current,
      ...patch,
      notes: patch.notes ?? current.notes,
      statusHistory: patch.statusHistory ?? current.statusHistory,
    },
  };
}

export function appendStatusHistory(
  match: Match,
  entrepreneurStatus: EntrepreneurApplicationStatus,
  actorProfileId?: ProfileId,
): EntrepreneurApplicationStatusEvent[] {
  const { statusHistory = [] } = getEntrepreneurMetadata(match);
  const event: EntrepreneurApplicationStatusEvent = {
    status: entrepreneurStatus,
    at: now(),
    ...(actorProfileId ? { actorProfileId } : {}),
  };
  return [...statusHistory, event];
}

export function appendNote(
  match: Match,
  authorProfileId: ProfileId,
  text: string,
): EntrepreneurApplicationNote[] {
  const { notes = [] } = getEntrepreneurMetadata(match);
  const note: EntrepreneurApplicationNote = {
    id: crypto.randomUUID(),
    authorProfileId,
    text,
    createdAt: now(),
  };
  return [...notes, note];
}

export function toEntrepreneurStatus(match: Match): EntrepreneurApplicationStatus {
  const meta = getEntrepreneurMetadata(match);
  if (meta.withdrawn) return 'withdrawn';
  return MATCH_TO_ENTREPRENEUR_STATUS[match.status] ?? 'pending';
}

export function toMatchStatus(
  status: EntrepreneurApplicationStatus,
): Match['status'] | null {
  return ENTREPRENEUR_TO_MATCH_STATUS[status];
}

export function initialStatusHistory(
  actorProfileId?: ProfileId,
): EntrepreneurApplicationStatusEvent[] {
  return [{ status: 'pending', at: now(), ...(actorProfileId ? { actorProfileId } : {}) }];
}

export type { MatchId };
