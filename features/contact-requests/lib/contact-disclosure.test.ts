import { describe, expect, it } from 'vitest';
import {
  ANONYMOUS_PROFILE_LABEL,
  isIdentityGatedListing,
  redactCareerExperiencePublicFields,
  resolveContactDisclosure,
  sanitizeIdentityGatedCustomFields,
  shouldBlockPublicMemberProfileEnumeration,
  shouldRevealAcceptedOwnerPii,
} from '@/features/contact-requests/lib/contact-disclosure';

const OWNER = 'u0000001-0001-4000-8000-000000000001';
const REQUESTER = 'u0000001-0001-4000-8000-000000000002';

describe('contact-disclosure', () => {
  it('gates candidates and anonymousMode listings', () => {
    expect(isIdentityGatedListing({ moduleKey: 'candidates' })).toBe(true);
    expect(isIdentityGatedListing({ moduleKey: 'employers', anonymousMode: true })).toBe(true);
    expect(isIdentityGatedListing({ moduleKey: 'employers' })).toBe(false);
    expect(isIdentityGatedListing({ moduleKey: 'founders' })).toBe(false);
  });

  it('hides career identity from public / pending / rejected viewers', () => {
    const listing = { moduleKey: 'candidates' as const, ownerId: OWNER, anonymousMode: true };

    expect(
      resolveContactDisclosure({ listing, viewerUserId: null }).canRevealOwnerIdentity,
    ).toBe(false);

    expect(
      resolveContactDisclosure({
        listing,
        viewerUserId: REQUESTER,
        hasAcceptedContactRequest: false,
      }).canRevealOwnerIdentity,
    ).toBe(false);
  });

  it('reveals career identity to owner, admin, and accepted requester', () => {
    const listing = { moduleKey: 'candidates' as const, ownerId: OWNER };

    expect(
      resolveContactDisclosure({ listing, viewerUserId: OWNER }).canRevealOwnerIdentity,
    ).toBe(true);

    expect(
      resolveContactDisclosure({
        listing,
        viewerUserId: REQUESTER,
        viewerIsAdmin: true,
      }).canRevealOwnerIdentity,
    ).toBe(true);

    expect(
      resolveContactDisclosure({
        listing,
        viewerUserId: REQUESTER,
        hasAcceptedContactRequest: true,
      }).canRevealOwnerIdentity,
    ).toBe(true);
  });

  it('keeps employer listing publisher identity public', () => {
    const decision = resolveContactDisclosure({
      listing: { moduleKey: 'employers', ownerId: OWNER },
      viewerUserId: null,
    });
    expect(decision.identityGated).toBe(false);
    expect(decision.canRevealOwnerIdentity).toBe(true);
    expect(decision.canRevealOwnerContactChannels).toBe(false);
  });

  it('only reveals accepted-owner PII for accepted status', () => {
    expect(shouldRevealAcceptedOwnerPii('accepted')).toBe(true);
    expect(shouldRevealAcceptedOwnerPii('pending')).toBe(false);
    expect(shouldRevealAcceptedOwnerPii('rejected')).toBe(false);
    expect(shouldRevealAcceptedOwnerPii('cancelled')).toBe(false);
    expect(shouldRevealAcceptedOwnerPii('expired')).toBe(false);
  });

  it('strips company-shaped keys from experience rows', () => {
    const redacted = redactCareerExperiencePublicFields([
      {
        id: '1',
        sector: 'Satış',
        role: 'Uzman',
        duration: '2 yıl',
        companyName: 'Gizli A.Ş.',
        employer: 'Gizli',
        responsibilities: 'Saha satış',
      },
    ]) as Array<Record<string, unknown>>;

    expect(redacted[0]?.companyName).toBeUndefined();
    expect(redacted[0]?.employer).toBeUndefined();
    expect(redacted[0]?.sector).toBe('Satış');
    expect(ANONYMOUS_PROFILE_LABEL).toMatch(/Anonim/i);
  });

  it('keeps career custom fields while dropping identity keys', () => {
    const sanitized = sanitizeIdentityGatedCustomFields({
      desiredRole: 'Backend Developer',
      experienceLevel: '3 yıl',
      companyName: 'Gizli A.Ş.',
      website: 'https://secret.example',
      cvUrl: 'https://cv.example/x.pdf',
      experiences: [{ role: 'Dev', companyName: 'X', sector: 'Yazılım' }],
      professionalSkills: 'Node.js',
    });

    expect(sanitized.desiredRole).toBe('Backend Developer');
    expect(sanitized.professionalSkills).toBe('Node.js');
    expect(sanitized.companyName).toBeUndefined();
    expect(sanitized.website).toBeUndefined();
    expect(sanitized.cvUrl).toBeUndefined();
    expect((sanitized.experiences as Array<Record<string, unknown>>)[0]?.companyName).toBeUndefined();
    expect((sanitized.experiences as Array<Record<string, unknown>>)[0]?.role).toBe('Dev');
  });

  it('blocks /uye enumeration only for identity-gated-only members', () => {
    expect(
      shouldBlockPublicMemberProfileEnumeration([
        { moduleKey: 'candidates', anonymousMode: true },
      ]),
    ).toBe(true);
    expect(
      shouldBlockPublicMemberProfileEnumeration([
        { moduleKey: 'candidates' },
        { moduleKey: 'employers' },
      ]),
    ).toBe(false);
    expect(shouldBlockPublicMemberProfileEnumeration([])).toBe(false);
  });
});
