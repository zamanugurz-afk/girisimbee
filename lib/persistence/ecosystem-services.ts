/**
 * Wires P2 ecosystem services from repositories (used by DI container).
 */
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { ModuleProfileRepository } from '@/features/profiles/repositories/module-profile.repository';
import type { MatchRepository } from '@/features/matching/repositories/match.repository';
import type { ApplicationRepository } from '@/features/matching/repositories/application.repository';
import type { DocumentRepository } from '@/features/documents/repositories/document.repository';
import type { PaymentRepository } from '@/features/monetization/repositories/payment.repository';
import type { ListingPackageRepository } from '@/features/monetization/repositories/listing-package.repository';
import { DocumentService } from '@/features/documents/services/document.service';
import { MatchService } from '@/features/matching/services/match.service';
import { ApplicationService } from '@/features/matching/services/application.service';
import { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import { EntrepreneurListingService } from '@/features/entrepreneurs/services/entrepreneur-listing.service';
import { InvestorListingService } from '@/features/investors/services/investor-listing.service';
import { CandidateService } from '@/features/candidates/services/candidate.service';
import { EmployerJobService } from '@/features/employers/services/employer-job.service';
import { FounderService } from '@/features/founders/services/founder.service';
import { FranchiseService } from '@/features/franchise/services/franchise.service';

export interface EcosystemServices {
  documentService: DocumentService;
  matchService: MatchService;
  applicationService: ApplicationService;
  paymentService: MarketplacePaymentService;
  entrepreneurListingService: EntrepreneurListingService;
  investorListingService: InvestorListingService;
  candidateService: CandidateService;
  employerJobService: EmployerJobService;
  founderService: FounderService;
  franchiseService: FranchiseService;
}

export interface EcosystemRepositories {
  listingRepository: ListingRepository;
  profileRepository: ProfileRepository;
  moduleProfileRepository: ModuleProfileRepository;
  matchRepository: MatchRepository;
  applicationRepository: ApplicationRepository;
  documentRepository: DocumentRepository;
  paymentRepository: PaymentRepository;
  listingPackageRepository: ListingPackageRepository;
}

export function wireEcosystemServices(repos: EcosystemRepositories): EcosystemServices {
  const documentService = new DocumentService(repos.documentRepository);
  const matchService = new MatchService(repos.matchRepository, repos.listingRepository);
  const applicationService = new ApplicationService(
    repos.applicationRepository,
    repos.listingRepository,
    repos.moduleProfileRepository,
    repos.profileRepository,
  );
  const paymentService = new MarketplacePaymentService(
    repos.paymentRepository,
    repos.applicationRepository,
    repos.listingPackageRepository,
  );

  return {
    documentService,
    matchService,
    applicationService,
    paymentService,
    entrepreneurListingService: new EntrepreneurListingService(
      repos.moduleProfileRepository,
      repos.listingRepository,
      documentService,
      matchService,
    ),
    investorListingService: new InvestorListingService(
      repos.moduleProfileRepository,
      repos.listingRepository,
      matchService,
    ),
    candidateService: new CandidateService(
      repos.moduleProfileRepository,
      applicationService,
      documentService,
    ),
    employerJobService: new EmployerJobService(
      repos.moduleProfileRepository,
      repos.listingRepository,
      applicationService,
      paymentService,
    ),
    founderService: new FounderService(
      repos.moduleProfileRepository,
      repos.listingRepository,
      matchService,
    ),
    franchiseService: new FranchiseService(
      repos.moduleProfileRepository,
      repos.listingRepository,
      applicationService,
    ),
  };
}
