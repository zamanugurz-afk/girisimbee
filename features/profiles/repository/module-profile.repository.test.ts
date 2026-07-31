import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MockModuleProfileRepository } from '@/features/profiles/repository/mock/module-profile.repository.mock';

describe('ModuleProfileRepository (mock)', () => {
  let repo: MockModuleProfileRepository;
  const profileId = ids.profile('p0000001-0001-4000-8000-000000000001');

  beforeEach(() => {
    repo = new MockModuleProfileRepository();
  });

  it('creates profile module onboarding record', async () => {
    const module = await repo.createProfileModule({
      profileId,
      moduleKey: 'entrepreneurs',
    });
    expect(module.moduleKey).toBe('entrepreneurs');
    expect(module.status).toBe('onboarding');

    const found = await repo.findProfileModule(profileId, 'entrepreneurs');
    expect(found?.id).toBe(module.id);
  });

  it('upserts entrepreneur profile', async () => {
    const profile = await repo.upsertEntrepreneurProfile({
      profileId,
      startupName: 'Acme Startup',
      city: 'Istanbul',
      investmentAmount: 500000,
    });
    expect(profile.startupName).toBe('Acme Startup');

    const updated = await repo.upsertEntrepreneurProfile({
      profileId,
      valuation: 2000000,
    });
    expect(updated.startupName).toBe('Acme Startup');
    expect(updated.valuation).toBe(2000000);
  });

  it('upserts candidate profile with CV reference', async () => {
    const docId = ids.document(crypto.randomUUID());
    const profile = await repo.upsertCandidateProfile({
      profileId,
      position: 'Frontend Developer',
      cvDocumentId: docId,
      languages: ['tr', 'en'],
    });
    expect(profile.position).toBe('Frontend Developer');
    expect(profile.cvDocumentId).toBe(docId);
  });

  it('deletes franchise profile', async () => {
    await repo.upsertFranchiseProfile({
      profileId,
      subcategorySlug: 'franchise-buy',
      sector: 'Food',
    });
    await repo.deleteFranchiseProfile(profileId);
    expect(await repo.findFranchiseProfile(profileId)).toBeNull();
  });
});
