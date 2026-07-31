import type { ModuleKey } from '@/lib/domain/modules';
import type { EcosystemServices } from '@/lib/persistence/ecosystem-services';
import type { ProfileId } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

export interface ModuleProfileService {
  getProfile: (profileId: ProfileId) => Promise<unknown>;
  upsertProfile: (input: { profileId: ProfileId } & Record<string, unknown>) => Promise<unknown>;
  activateProfile: (profileId: ProfileId, ...args: unknown[]) => Promise<unknown>;
}

export function getModuleProfileService(
  module: ModuleKey,
  ecosystem: EcosystemServices,
): ModuleProfileService {
  switch (module) {
    case 'entrepreneurs':
      return ecosystem.entrepreneurListingService as unknown as ModuleProfileService;
    case 'investors':
      return ecosystem.investorService as unknown as ModuleProfileService;
    case 'candidates':
      return ecosystem.candidateService as unknown as ModuleProfileService;
    case 'employers':
      return ecosystem.employerJobService as unknown as ModuleProfileService;
    case 'founders':
      return ecosystem.founderService as unknown as ModuleProfileService;
    case 'franchise':
      return ecosystem.franchiseService as unknown as ModuleProfileService;
    default:
      throw new ValidationError('Geçersiz modül.', { module: ['Desteklenmeyen modül.'] });
  }
}
