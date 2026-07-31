/**
 * Shared mock wiring for P2 ecosystem service unit tests.
 */
import { ids } from '@/lib/domain/ids';
import type { UserId, ProfileId } from '@/lib/domain/ids';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { MockModuleProfileRepository } from '@/features/profiles/repository/mock/module-profile.repository.mock';
import { MockMatchRepository } from '@/features/matching/repository/mock/match.repository.mock';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';
import { MockDocumentRepository } from '@/features/documents/repository/mock/document.repository.mock';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';
import { MockListingPackageRepository } from '@/features/monetization/repository/mock/listing-package.repository.mock';
import { wireEcosystemServices } from '@/lib/persistence/ecosystem-services';
import { createProfile } from '@/features/profiles/factories/profile.factory';

export function createEcosystemTestHarness() {
  const listingRepository = new MockListingRepository();
  const profileRepository = new MockProfileRepository();
  const moduleProfileRepository = new MockModuleProfileRepository();
  const matchRepository = new MockMatchRepository();
  const applicationRepository = new MockApplicationRepository();
  const documentRepository = new MockDocumentRepository();
  const paymentRepository = new MockPaymentRepository();
  const listingPackageRepository = new MockListingPackageRepository();

  const services = wireEcosystemServices({
    listingRepository,
    profileRepository,
    moduleProfileRepository,
    matchRepository,
    applicationRepository,
    documentRepository,
    paymentRepository,
    listingPackageRepository,
  });

  return {
    repos: {
      listingRepository,
      profileRepository,
      moduleProfileRepository,
      matchRepository,
      applicationRepository,
      documentRepository,
      paymentRepository,
      listingPackageRepository,
    },
    services,
  };
}

export async function seedProfile(
  profileRepo: MockProfileRepository,
  userId: UserId,
  displayName: string,
): Promise<ProfileId> {
  const profile = await profileRepo.create(
    createProfile({
      userId,
      displayName,
      username: displayName.toLowerCase().replace(/\s+/g, '-'),
    }),
  );
  return profile.id;
}

export const TEST_USER = ids.user('u0000001-0001-4000-8000-000000000001');
export const TEST_USER_2 = ids.user('u0000001-0001-4000-8000-000000000002');
export const TEST_PROFILE = ids.profile('p0000001-0001-4000-8000-000000000001');
export const TEST_PROFILE_2 = ids.profile('p0000001-0001-4000-8000-000000000002');
