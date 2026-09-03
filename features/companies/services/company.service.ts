import type { CompanyId, UserId } from '@/lib/domain/ids';
import type { Company, CreateCompanyInput, UpdateCompanyInput, CompanyFilter } from '@/features/companies/types/company.types';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { ICompanyService } from '@/features/companies/services/company.service.interface';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { CompanyMemberRepository, CompanyFollowRepository } from '@/features/companies/repositories/company-social.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import { ValidationError, ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import { slugify } from '@/lib/domain/factory';

export class CompanyService implements ICompanyService {
  constructor(
    private repo: CompanyRepository,
    private memberRepo: CompanyMemberRepository,
    private followRepo: CompanyFollowRepository,
    private listingRepo: ListingRepository,
    private profileRepo: ProfileRepository,
  ) {}

  async create(input: CreateCompanyInput): Promise<Company> {
    const slug = (input.slug || slugify(input.name)).trim().toLowerCase();
    if (await this.repo.isSlugTaken(slug)) {
      throw new ValidationError('Kullanıcı adı kullanımda', {
        slug: ['Bu kullanıcı adı zaten alınmış.'],
      });
    }

    const company = await this.repo.create({ ...input, slug });
    await this.memberRepo.addMember(company.id, company.ownerId, 'owner');
    return this.activate(company.id);
  }

  getById(id: CompanyId): Promise<Company | null> {
    return this.repo.findById(id);
  }

  getBySlug(slug: string): Promise<Company | null> {
    return this.repo.findBySlug(slug);
  }

  listByOwner(ownerId: UserId): Promise<Company[]> {
    return this.repo.findByOwnerId(ownerId);
  }

  async listForUser(userId: UserId): Promise<Company[]> {
    const owned = await this.repo.findByOwnerId(userId);
    return owned;
  }

  async isSlugAvailable(slug: string, excludeCompanyId?: CompanyId): Promise<boolean> {
    return !(await this.repo.isSlugTaken(slug.trim().toLowerCase(), excludeCompanyId));
  }

  async update(id: CompanyId, actorId: UserId, input: UpdateCompanyInput): Promise<Company> {
    await this.assertCanManage(id, actorId);
    if (input.slug) {
      const slug = input.slug.trim().toLowerCase();
      if (await this.repo.isSlugTaken(slug, id)) {
        throw new ValidationError('Kullanıcı adı kullanımda', {
          slug: ['Bu kullanıcı adı zaten alınmış.'],
        });
      }
      input = { ...input, slug };
    }
    return this.repo.update(id, input);
  }

  activate(id: CompanyId): Promise<Company> {
    return this.repo.transitionStatus(id, 'active');
  }

  suspend(id: CompanyId): Promise<Company> {
    return this.repo.transitionStatus(id, 'suspended');
  }

  search(filter: CompanyFilter, pagination?: PaginationParams): Promise<PaginatedResult<Company>> {
    return this.repo.search(filter, pagination);
  }

  async delete(id: CompanyId, actorId: UserId): Promise<void> {
    const company = await this.repo.findById(id);
    if (!company) throw new NotFoundError('Company', id);
    if (company.ownerId !== actorId) throw new ForbiddenError();
    return this.repo.delete(id);
  }

  async inviteMember(companyId: CompanyId, actorId: UserId, username: string): Promise<void> {
    await this.assertOwner(companyId, actorId);
    const profile = await this.profileRepo.findByUsername(username.trim().toLowerCase());
    if (!profile) {
      throw new ValidationError('Kullanıcı bulunamadı', { username: ['Bu kullanıcı adına sahip profil yok.'] });
    }
    await this.memberRepo.addMember(companyId, profile.userId, 'member');
  }

  async leaveCompany(companyId: CompanyId, userId: UserId): Promise<void> {
    const company = await this.repo.findById(companyId);
    if (!company) throw new NotFoundError('Company', companyId);
    if (company.ownerId === userId) throw new ForbiddenError('Şirket sahibi ayrılamaz.');
    await this.memberRepo.removeMember(companyId, userId);
  }

  async follow(companyId: CompanyId, userId: UserId): Promise<void> {
    await this.followRepo.follow(userId, companyId);
  }

  async unfollow(companyId: CompanyId, userId: UserId): Promise<void> {
    await this.followRepo.unfollow(userId, companyId);
  }

  async getPublicView(slug: string, viewerId?: UserId): Promise<PublicCompanyView | null> {
    const company = await this.repo.findBySlug(slug);
    if (!company || company.deletedAt) return null;

    const isOwner = viewerId === company.ownerId;
    const isMember = viewerId ? await this.memberRepo.isMember(company.id, viewerId) : false;

    if (!isOwner && !isMember && company.status !== 'active') {
      return null;
    }

    const [members, listingsResult, followersCount, isFollowing] = await Promise.all([
      this.memberRepo.findByCompanyId(company.id),
      this.listingRepo.search(
        { companyId: company.id, status: 'published' },
        { page: 1, limit: 12 },
      ),
      this.followRepo.countByCompanyId(company.id),
      viewerId ? this.followRepo.isFollowing(viewerId, company.id) : Promise.resolve(false),
    ]);

    let companyListings = listingsResult.data;
    if (companyListings.length === 0 && company.ownerId) {
      try {
        const ownerListings = await this.listingRepo.search(
          { ownerId: company.ownerId, status: 'published' },
          { page: 1, limit: 50 },
        );
        const compLower = company.name.trim().toLowerCase();
        const matched = ownerListings.data.filter((l) => {
          const cName = String(l.customFields?.companyName || l.customFields?.businessName || '').trim().toLowerCase();
          return cName === compLower;
        });
        if (matched.length > 0) {
          companyListings = matched;
        }
      } catch {
        // fallback ignored
      }
    }

    const memberViews = await Promise.all(
      members.map(async (member) => ({
        member,
        profile: await this.profileRepo.findByUserId(member.userId),
      })),
    );

    return {
      company,
      members: memberViews,
      listings: companyListings,
      followersCount,
      isOwner,
      isMember,
      isFollowing,
    };
  }

  async assertCanManage(companyId: CompanyId, userId: UserId): Promise<void> {
    const company = await this.repo.findById(companyId);
    if (!company) throw new NotFoundError('Company', companyId);
    if (company.ownerId !== userId) throw new ForbiddenError();
  }

  async assertOwner(companyId: CompanyId, userId: UserId): Promise<void> {
    const company = await this.repo.findById(companyId);
    if (!company) throw new NotFoundError('Company', companyId);
    if (company.ownerId !== userId) throw new ForbiddenError();
  }
}
