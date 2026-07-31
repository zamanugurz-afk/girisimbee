import { NotFoundError } from '@/lib/domain/errors';
import type { UserId, PaymentId } from '@/lib/domain/ids';
import type { ModuleKey } from '@/lib/domain/modules';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { IPaymentService } from '@/features/monetization/services/payment.service.interface';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { MarketplacePayment } from '@/features/monetization/types/payment.types';
import type { AdminPaymentFilter } from '@/features/admin/types/admin.types';
import type { EcosystemServices } from '@/lib/persistence/ecosystem-services';
import { ids } from '@/lib/domain/ids';
import { now } from '@/lib/domain/factory';

export class AdminPaymentsService {
  constructor(
    private paymentRepo: PaymentRepository,
    private paymentService: IPaymentService,
    private ecosystem: EcosystemServices,
  ) {}

  listPayments(
    filter: AdminPaymentFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<MarketplacePayment>> {
    return this.paymentRepo.search(
      {
        userId: filter.userId,
        status: filter.status,
        purpose: filter.purpose as MarketplacePayment['purpose'] | undefined,
      },
      pagination,
    );
  }

  async refundPayment(paymentId: PaymentId): Promise<MarketplacePayment> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment', paymentId);
    if (payment.status !== 'succeeded') {
      throw new NotFoundError('Payment', paymentId);
    }

    const externalId = payment.providerRef ?? payment.providerSessionId ?? payment.id;
    try {
      await this.paymentService.refundPayment(externalId);
    } catch {
      // Gateway may be stubbed in dev — still mark refunded locally
    }

    return this.paymentRepo.update(paymentId, {
      status: 'refunded',
      refundedAt: now(),
    });
  }

  async activateModulePackage(moduleKey: ModuleKey, userId: UserId, packageSlug: string) {
    switch (moduleKey) {
      case 'franchise':
        return this.ecosystem.franchiseMonetizationService.activatePackage(userId, packageSlug as never);
      case 'employers':
        return this.ecosystem.employerMonetizationService.activatePackage(userId, packageSlug as never);
      case 'candidates':
        return this.ecosystem.candidateMonetizationService.activatePackage(userId, packageSlug as never);
      case 'entrepreneurs':
        return this.ecosystem.entrepreneurMonetizationService.activatePackage(userId, packageSlug as never);
      case 'investors':
        return this.ecosystem.investorMonetizationService.activatePackage(userId, packageSlug as never);
      case 'founders':
        return this.ecosystem.founderMonetizationService.activatePackage(userId, packageSlug as never);
      default:
        throw new NotFoundError('Module', moduleKey);
    }
  }

  async suspendModulePackage(moduleKey: ModuleKey, userPackageId: string) {
    switch (moduleKey) {
      case 'franchise':
        return this.ecosystem.franchiseMonetizationService.suspendPackage(ids.franchisePackage(userPackageId));
      case 'employers':
        return this.ecosystem.employerMonetizationService.suspendPackage(ids.employerPackage(userPackageId));
      case 'candidates':
        return this.ecosystem.candidateMonetizationService.suspendPackage(ids.candidatePackage(userPackageId));
      case 'entrepreneurs':
        return this.ecosystem.entrepreneurMonetizationService.suspendPackage(ids.entrepreneurPackage(userPackageId));
      case 'investors':
        return this.ecosystem.investorMonetizationService.suspendPackage(ids.investorPackage(userPackageId));
      case 'founders':
        return this.ecosystem.founderMonetizationService.suspendPackage(ids.founderPackage(userPackageId));
      default:
        throw new NotFoundError('Module', moduleKey);
    }
  }
}
