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
import type { FranchisePackageRepository } from '@/features/franchise/repositories/franchise-package.repository';
import type { EmployerPackageRepository } from '@/features/employers/repositories/employer-package.repository';
import type { CandidatePackageRepository } from '@/features/candidates/repositories/candidate-package.repository';
import type { EntrepreneurPackageRepository } from '@/features/entrepreneurs/repositories/entrepreneur-package.repository';
import type { InvestorPackageRepository } from '@/features/investors/repositories/investor-package.repository';
import type { FounderPackageRepository } from '@/features/founders/repositories/founder-package.repository';
import { DocumentService } from '@/features/documents/services/document.service';
import { MatchService } from '@/features/matching/services/match.service';
import { ApplicationService } from '@/features/matching/services/application.service';
import { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import { EntrepreneurService } from '@/features/entrepreneurs/services/entrepreneur.service';
import { EntrepreneurApplicationService } from '@/features/entrepreneurs/services/entrepreneur-application.service';
import { EntrepreneurMonetizationService } from '@/features/entrepreneurs/services/entrepreneur-monetization.service';
import { InvestorService } from '@/features/investors/services/investor.service';
import { InvestorApplicationService } from '@/features/investors/services/investor-application.service';
import { InvestorMonetizationService } from '@/features/investors/services/investor-monetization.service';
import { FounderApplicationService } from '@/features/founders/services/founder-application.service';
import { FounderMonetizationService } from '@/features/founders/services/founder-monetization.service';
import { CandidateService } from '@/features/candidates/services/candidate.service';
import { CandidateCvService } from '@/features/candidates/services/candidate-cv.service';
import { CandidateApplicationService } from '@/features/candidates/services/candidate-application.service';
import { CandidateMonetizationService } from '@/features/candidates/services/candidate-monetization.service';
import { EmployerService } from '@/features/employers/services/employer.service';
import { EmployerApplicationService } from '@/features/employers/services/employer-application.service';
import { EmployerMonetizationService } from '@/features/employers/services/employer-monetization.service';
import { EmployerJobService } from '@/features/employers/services/employer-job.service';
import { FounderService } from '@/features/founders/services/founder.service';
import type { FavoriteRepository } from '@/features/favorites/repositories/favorite.repository';
import { FranchiseService } from '@/features/franchise/services/franchise.service';
import { FranchiseApplicationService } from '@/features/franchise/services/franchise-application.service';
import { FranchiseMonetizationService } from '@/features/franchise/services/franchise-monetization.service';

export interface EcosystemServices {
  documentService: DocumentService;
  matchService: MatchService;
  applicationService: ApplicationService;
  paymentService: MarketplacePaymentService;
  entrepreneurService: EntrepreneurService;
  /** @deprecated Use entrepreneurService */
  entrepreneurListingService: EntrepreneurService;
  entrepreneurApplicationService: EntrepreneurApplicationService;
  entrepreneurMonetizationService: EntrepreneurMonetizationService;
  investorService: InvestorService;
  /** @deprecated Use investorService */
  investorListingService: InvestorService;
  investorApplicationService: InvestorApplicationService;
  investorMonetizationService: InvestorMonetizationService;
  candidateService: CandidateService;
  candidateCvService: CandidateCvService;
  candidateApplicationService: CandidateApplicationService;
  candidateMonetizationService: CandidateMonetizationService;
  employerService: EmployerService;
  employerApplicationService: EmployerApplicationService;
  employerMonetizationService: EmployerMonetizationService;
  employerJobService: EmployerJobService;
  founderService: FounderService;
  founderApplicationService: FounderApplicationService;
  founderMonetizationService: FounderMonetizationService;
  franchiseService: FranchiseService;
  franchiseApplicationService: FranchiseApplicationService;
  franchiseMonetizationService: FranchiseMonetizationService;
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
  franchisePackageRepository: FranchisePackageRepository;
  employerPackageRepository: EmployerPackageRepository;
  candidatePackageRepository: CandidatePackageRepository;
  entrepreneurPackageRepository: EntrepreneurPackageRepository;
  investorPackageRepository: InvestorPackageRepository;
  founderPackageRepository: FounderPackageRepository;
  favoriteRepository: FavoriteRepository;
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

  const franchiseMonetizationService = new FranchiseMonetizationService(
    repos.franchisePackageRepository,
    repos.paymentRepository,
  );

  const employerMonetizationService = new EmployerMonetizationService(
    repos.employerPackageRepository,
    repos.paymentRepository,
  );

  const candidateMonetizationService = new CandidateMonetizationService(
    repos.candidatePackageRepository,
    repos.paymentRepository,
  );

  const entrepreneurMonetizationService = new EntrepreneurMonetizationService(
    repos.entrepreneurPackageRepository,
    repos.paymentRepository,
  );

  const investorMonetizationService = new InvestorMonetizationService(
    repos.investorPackageRepository,
    repos.paymentRepository,
  );

  const founderMonetizationService = new FounderMonetizationService(
    repos.founderPackageRepository,
    repos.paymentRepository,
  );

  const entrepreneurService = new EntrepreneurService(
    repos.moduleProfileRepository,
    repos.listingRepository,
    documentService,
    matchService,
  );

  const entrepreneurApplicationService = new EntrepreneurApplicationService(
    repos.matchRepository,
    matchService,
    repos.listingRepository,
    repos.moduleProfileRepository,
    repos.profileRepository,
    repos.favoriteRepository,
  );

  const investorService = new InvestorService(
    repos.moduleProfileRepository,
    repos.listingRepository,
    matchService,
  );

  const investorApplicationService = new InvestorApplicationService(
    repos.matchRepository,
    matchService,
    repos.listingRepository,
    repos.moduleProfileRepository,
    repos.profileRepository,
    repos.favoriteRepository,
  );

  const founderApplicationService = new FounderApplicationService(
    repos.matchRepository,
    matchService,
    repos.listingRepository,
    repos.moduleProfileRepository,
    repos.profileRepository,
    repos.favoriteRepository,
  );

  const employerService = new EmployerService(
    repos.moduleProfileRepository,
    repos.listingRepository,
  );

  const employerApplicationService = new EmployerApplicationService(
    repos.applicationRepository,
    repos.listingRepository,
    repos.moduleProfileRepository,
    repos.profileRepository,
    applicationService,
    paymentService,
  );

  const employerJobService = new EmployerJobService(employerService, employerApplicationService);

  const candidateCvService = new CandidateCvService(
    repos.moduleProfileRepository,
    documentService,
  );

  const candidateApplicationService = new CandidateApplicationService(
    repos.applicationRepository,
    repos.listingRepository,
    applicationService,
  );

  return {
    documentService,
    matchService,
    applicationService,
    paymentService,
    entrepreneurService,
    entrepreneurListingService: entrepreneurService,
    entrepreneurApplicationService,
    entrepreneurMonetizationService,
    investorService,
    investorListingService: investorService,
    investorApplicationService,
    investorMonetizationService,
    candidateService: new CandidateService(
      repos.moduleProfileRepository,
      applicationService,
      documentService,
    ),
    candidateCvService,
    candidateApplicationService,
    candidateMonetizationService,
    employerService,
    employerApplicationService,
    employerMonetizationService,
    employerJobService,
    founderService: new FounderService(
      repos.moduleProfileRepository,
      repos.listingRepository,
      matchService,
    ),
    founderApplicationService,
    founderMonetizationService,
    franchiseService: new FranchiseService(
      repos.moduleProfileRepository,
      repos.listingRepository,
      applicationService,
    ),
    franchiseApplicationService: new FranchiseApplicationService(
      repos.applicationRepository,
      repos.listingRepository,
      repos.moduleProfileRepository,
      repos.profileRepository,
      repos.favoriteRepository,
    ),
    franchiseMonetizationService,
  };
}
