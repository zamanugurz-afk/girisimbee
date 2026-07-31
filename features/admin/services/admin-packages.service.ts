import type { ModuleKey } from '@/lib/domain/modules';
import { MODULE_KEYS } from '@/lib/domain/modules';
import type { UserId } from '@/lib/domain/ids';
import type { IListingPackageService } from '@/features/monetization/services/listing-package.service';
import type { EcosystemServices } from '@/lib/persistence/ecosystem-services';
import type { AdminPackageCatalogView } from '@/features/admin/types/admin.types';

const MODULE_CATALOG_KEYS = [
  'franchise',
  'employers',
  'candidates',
  'entrepreneurs',
  'investors',
  'founders',
] as const satisfies readonly ModuleKey[];

export class AdminPackagesService {
  constructor(
    private listingPackageService: IListingPackageService,
    private ecosystem: EcosystemServices,
  ) {}

  async listAllCatalogs(): Promise<AdminPackageCatalogView[]> {
    const listingCatalog = await this.listingPackageService.listCatalog();
    const moduleCatalogs = await Promise.all(
      MODULE_CATALOG_KEYS.map(async (moduleKey) => ({
        moduleKey,
        catalog: await this.resolveCatalog(moduleKey),
        activeEntitlements: [] as unknown[],
      })),
    );

    return [
      ...moduleCatalogs,
      { moduleKey: 'franchise' as ModuleKey, catalog: listingCatalog, activeEntitlements: [] },
    ];
  }

  async listModuleCatalog(moduleKey: ModuleKey): Promise<AdminPackageCatalogView> {
    const all = await this.listAllCatalogs();
    const match = all.find((c) => c.moduleKey === moduleKey);
    if (match) return match;

    if (!MODULE_KEYS.includes(moduleKey)) {
      throw new Error(`Unknown module: ${moduleKey}`);
    }

    const catalog = await this.resolveCatalog(moduleKey);
    const activeEntitlements = await this.resolveActiveEntitlements(moduleKey);
    return { moduleKey, catalog, activeEntitlements };
  }

  async listActiveEntitlements(moduleKey: ModuleKey, userId?: UserId) {
    return this.resolveActiveEntitlements(moduleKey, userId);
  }

  activateModulePackage(moduleKey: ModuleKey, userId: UserId, packageSlug: string) {
    return this.ecosystemPaymentAdmin(moduleKey).activate(userId, packageSlug);
  }

  suspendModulePackage(moduleKey: ModuleKey, userPackageId: string) {
    return this.ecosystemPaymentAdmin(moduleKey).suspend(userPackageId);
  }

  private async resolveCatalog(moduleKey: ModuleKey): Promise<unknown[]> {
    switch (moduleKey) {
      case 'franchise':
        return this.ecosystem.franchiseMonetizationService.listCatalog();
      case 'employers':
        return this.ecosystem.employerMonetizationService.listCatalog();
      case 'candidates':
        return this.ecosystem.candidateMonetizationService.listCatalog();
      case 'entrepreneurs':
        return this.ecosystem.entrepreneurMonetizationService.listCatalog();
      case 'investors':
        return this.ecosystem.investorMonetizationService.listCatalog();
      case 'founders':
        return this.ecosystem.founderMonetizationService.listCatalog();
      default:
        return this.listingPackageService.listCatalog();
    }
  }

  private async resolveActiveEntitlements(_moduleKey: ModuleKey, _userId?: UserId): Promise<unknown[]> {
    return [];
  }

  private ecosystemPaymentAdmin(moduleKey: ModuleKey) {
    const svc = {
      franchise: this.ecosystem.franchiseMonetizationService,
      employers: this.ecosystem.employerMonetizationService,
      candidates: this.ecosystem.candidateMonetizationService,
      entrepreneurs: this.ecosystem.entrepreneurMonetizationService,
      investors: this.ecosystem.investorMonetizationService,
      founders: this.ecosystem.founderMonetizationService,
    }[moduleKey];

    if (!svc) throw new Error(`No monetization service for ${moduleKey}`);

    return {
      activate: (userId: UserId, packageSlug: string) => svc.activatePackage(userId, packageSlug as never),
      suspend: (userPackageId: string) => svc.suspendPackage(userPackageId as never),
    };
  }
}
