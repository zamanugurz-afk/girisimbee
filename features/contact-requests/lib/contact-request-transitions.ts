/**
 * Mirrors DB-allowed contact request status transitions (hardening V2).
 * Used for unit tests — source of truth for production is SQL RPCs + triggers.
 */
export type ContactRequestTransitionStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export type ContactRequestTransitionActor = 'requester' | 'owner' | 'admin' | 'service';

const TERMINAL: ReadonlySet<ContactRequestTransitionStatus> = new Set([
  'accepted',
  'rejected',
  'cancelled',
  'expired',
]);

export function isAllowedContactRequestTransition(input: {
  from: ContactRequestTransitionStatus;
  to: ContactRequestTransitionStatus;
  actor: ContactRequestTransitionActor;
}): boolean {
  if (input.from === input.to) return true;
  if (TERMINAL.has(input.from)) return false;
  if (input.from !== 'pending') return false;

  if (input.to === 'cancelled') {
    return input.actor === 'requester' || input.actor === 'admin' || input.actor === 'service';
  }
  if (input.to === 'accepted' || input.to === 'rejected') {
    return input.actor === 'owner' || input.actor === 'admin' || input.actor === 'service';
  }
  if (input.to === 'expired') {
    return input.actor === 'admin' || input.actor === 'service';
  }
  return false;
}

/** Direct authenticated table UPDATE of status must never be allowed. */
export function isDirectClientStatusUpdateAllowed(): boolean {
  return false;
}
