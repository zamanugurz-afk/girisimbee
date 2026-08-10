import { describe, expect, it } from 'vitest';
import {
  isAllowedContactRequestTransition,
  isDirectClientStatusUpdateAllowed,
} from '@/features/contact-requests/lib/contact-request-transitions';

describe('contact request DB transition matrix', () => {
  it('blocks all direct client status updates', () => {
    expect(isDirectClientStatusUpdateAllowed()).toBe(false);
  });

  it('allows requester pending → cancelled only', () => {
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'cancelled',
        actor: 'requester',
      }),
    ).toBe(true);
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'accepted',
        actor: 'requester',
      }),
    ).toBe(false);
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'rejected',
        actor: 'requester',
      }),
    ).toBe(false);
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'expired',
        actor: 'requester',
      }),
    ).toBe(false);
  });

  it('allows owner pending → accepted|rejected only', () => {
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'accepted',
        actor: 'owner',
      }),
    ).toBe(true);
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'rejected',
        actor: 'owner',
      }),
    ).toBe(true);
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'cancelled',
        actor: 'owner',
      }),
    ).toBe(false);
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'expired',
        actor: 'owner',
      }),
    ).toBe(false);
  });

  it('allows service/admin pending → expired', () => {
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'expired',
        actor: 'service',
      }),
    ).toBe(true);
    expect(
      isAllowedContactRequestTransition({
        from: 'pending',
        to: 'expired',
        actor: 'admin',
      }),
    ).toBe(true);
  });

  it('freezes terminal states', () => {
    for (const from of ['accepted', 'rejected', 'cancelled', 'expired'] as const) {
      expect(
        isAllowedContactRequestTransition({
          from,
          to: 'pending',
          actor: 'owner',
        }),
      ).toBe(false);
      expect(
        isAllowedContactRequestTransition({
          from,
          to: from === 'accepted' ? 'rejected' : 'accepted',
          actor: 'owner',
        }),
      ).toBe(false);
    }
  });
});
