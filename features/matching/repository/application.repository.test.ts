import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';

describe('ApplicationRepository (mock)', () => {
  let repo: MockApplicationRepository;
  const applicant = ids.profile('p0000001-0001-4000-8000-000000000001');
  const listingId = ids.listing('l0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    repo = new MockApplicationRepository();
  });

  it('creates job application with anonymous snapshot', async () => {
    const app = await repo.create({
      moduleKey: 'candidates',
      listingId,
      applicantProfileId: applicant,
      anonymousSnapshot: {
        city: 'Ankara',
        district: 'Cankaya',
        industry: 'tech',
        experienceYears: 3,
        educationLevel: 'bachelor',
        skills: ['react', 'typescript'],
        profileScore: 75,
      },
    });
    expect(app.status).toBe('submitted');
    expect(app.anonymousSnapshot.profileScore).toBe(75);
  });

  it('transitions to unlocked after payment flow', async () => {
    const app = await repo.create({
      moduleKey: 'candidates',
      listingId,
      applicantProfileId: applicant,
    });
    await repo.transitionStatus(app.id, 'reviewing');
    const unlocked = await repo.transitionStatus(app.id, 'unlocked');
    expect(unlocked.status).toBe('unlocked');
    expect(unlocked.unlockedAt).not.toBeNull();
  });

  it('finds applications for listing and applicant', async () => {
    await repo.create({
      moduleKey: 'franchise',
      listingId,
      applicantProfileId: applicant,
    });
    expect(await repo.findForListing(listingId)).toHaveLength(1);
    expect(await repo.findForApplicant(applicant)).toHaveLength(1);
  });

  it('transitions franchise status without unlock gate', async () => {
    const app = await repo.create({
      moduleKey: 'franchise',
      listingId,
      applicantProfileId: applicant,
    });
    await repo.transitionFranchiseStatus(app.id, 'reviewing');
    const contacted = await repo.transitionFranchiseStatus(app.id, 'contacted');
    expect(contacted.status).toBe('contacted');
    expect(contacted.contactedAt).not.toBeNull();
    const approved = await repo.transitionFranchiseStatus(app.id, 'accepted');
    expect(approved.status).toBe('accepted');
  });

  it('filters applications by submitted date range', async () => {
    const app = await repo.create({
      moduleKey: 'franchise',
      listingId,
      applicantProfileId: applicant,
    });
    await repo.update(app.id, { metadata: { seededAt: '2026-06-01' } });
    const { data: all } = await repo.findMany({ moduleKey: 'franchise' });
    expect(all.length).toBeGreaterThan(0);
    const { data: filtered } = await repo.findMany({
      moduleKey: 'franchise',
      submittedAfter: '2099-01-01T00:00:00.000Z',
    });
    expect(filtered).toHaveLength(0);
  });

  it('soft deletes application', async () => {
    const app = await repo.create({
      moduleKey: 'candidates',
      listingId,
      applicantProfileId: applicant,
    });
    await repo.softDelete(app.id);
    expect(await repo.findById(app.id)).toBeNull();
    expect(await repo.findById(app.id, { includeDeleted: true })).not.toBeNull();
  });
});
