import { now } from '@/lib/domain/factory';
import type { MatchId, ProfileId } from '@/lib/domain/ids';
import type { Match } from '@/features/matching/types/match.types';
import type {
  InvestorApplicationMetadata,
  InvestorApplicationNote,
  InvestorApplicationStatus,
  InvestorApplicationStatusEvent,
} from '@/features/investors/types/investor-application.types';
import {
  MATCH_TO_INVESTOR_STATUS,
  INVESTOR_TO_MATCH_STATUS,
} from '@/features/investors/types/investor-application.types';

const METADATA_KEY = 'investor' as const;

export function getInvestorMetadata(match: Match): InvestorApplicationMetadata {
  const raw = match.metadata[METADATA_KEY];
  if (!raw || typeof raw !== 'object') return {};
  const data = raw as InvestorApplicationMetadata;
  return {
    notes: Array.isArray(data.notes) ? data.notes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
    coverMessage: data.coverMessage ?? null,
    withdrawn: data.withdrawn ?? false,
  };
}

export function mergeInvestorMetadata(
  match: Match,
  patch: Partial<InvestorApplicationMetadata>,
): Record<string, unknown> {
  const current = getInvestorMetadata(match);
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
  investorStatus: InvestorApplicationStatus,
  actorProfileId?: ProfileId,
): InvestorApplicationStatusEvent[] {
  const { statusHistory = [] } = getInvestorMetadata(match);
  const event: InvestorApplicationStatusEvent = {
    status: investorStatus,
    at: now(),
    ...(actorProfileId ? { actorProfileId } : {}),
  };
  return [...statusHistory, event];
}

export function appendNote(
  match: Match,
  authorProfileId: ProfileId,
  text: string,
): InvestorApplicationNote[] {
  const { notes = [] } = getInvestorMetadata(match);
  const note: InvestorApplicationNote = {
    id: crypto.randomUUID(),
    authorProfileId,
    text,
    createdAt: now(),
  };
  return [...notes, note];
}

export function toInvestorStatus(match: Match): InvestorApplicationStatus {
  const meta = getInvestorMetadata(match);
  if (meta.withdrawn) return 'withdrawn';
  return MATCH_TO_INVESTOR_STATUS[match.status] ?? 'pending';
}

export function toMatchStatus(
  status: InvestorApplicationStatus,
): Match['status'] | null {
  return INVESTOR_TO_MATCH_STATUS[status];
}

export function initialStatusHistory(
  actorProfileId?: ProfileId,
): InvestorApplicationStatusEvent[] {
  return [{ status: 'pending', at: now(), ...(actorProfileId ? { actorProfileId } : {}) }];
}

export type { MatchId };
