import { now } from '@/lib/domain/factory';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/domain/errors';
import type { ConversationId, ListingId, UserId } from '@/lib/domain/ids';
import type { Conversation, CreateConversationInput } from '@/features/messaging/types/conversation.types';
import type { Message, CreateMessageInput } from '@/features/messaging/types/message.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { IMessagingService } from '@/features/messaging/services/messaging.service.interface';
import type { ConversationRepository } from '@/features/messaging/repositories/conversation.repository';
import type { MessageRepository } from '@/features/messaging/repositories/message.repository';
import type { ListingRepository } from '@/features/listings/repositories/listing.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { ContactRequestRepository } from '@/features/contact-requests/repositories/contact-request.repository';
import type {
  ConversationListItem,
  ConversationParticipantView,
  ConversationThreadMeta,
} from '@/features/messaging/types/messaging-view.types';
import { createConversationSchema, createMessageSchema } from '@/features/messaging/validation/messaging.schema';

export class MessagingService implements IMessagingService {
  constructor(
    private conversationRepo: ConversationRepository,
    private messageRepo: MessageRepository,
    private listingRepo: ListingRepository,
    private profileRepo: ProfileRepository,
    private companyRepo: CompanyRepository,
    private contactRequestRepo?: ContactRequestRepository,
  ) {}

  private assertParticipant(conversation: Conversation, userId: UserId): void {
    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenError('Not a conversation participant');
    }
  }

  private otherParticipantId(conversation: Conversation, userId: UserId): UserId {
    return (
      conversation.participantIds.find((id) => id !== userId)
      ?? conversation.participantIds[0]
      ?? userId
    );
  }

  private async resolveParticipantView(
    userId: UserId,
    context?: { companyId?: import('@/lib/domain/ids').CompanyId | null },
  ): Promise<ConversationParticipantView> {
    const [profile, company] = await Promise.all([
      this.profileRepo.findByUserId(userId),
      context?.companyId ? this.companyRepo.findById(context.companyId) : Promise.resolve(null),
    ]);
    return {
      userId,
      displayName: profile?.displayName ?? 'Kullanıcı',
      avatarUrl: profile?.avatarUrl ?? null,
      username: profile?.username ?? null,
      companyName: company?.name ?? profile?.companyName ?? null,
      userVerified: profile?.isVerified ?? false,
      investorVerified: profile?.investorVerified ?? false,
      companyVerified: company?.isVerified ?? false,
    };
  }

  async startConversation(input: CreateConversationInput): Promise<Conversation> {
    const parsed = createConversationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError('Invalid conversation', { _: parsed.error.errors.map((e) => e.message) });
    }
    let companyId = input.companyId ?? null;
    if (input.listingId) {
      try {
        const listing = await this.listingRepo.findById(input.listingId);
        if (listing?.companyId && !companyId) {
          companyId = listing.companyId;
        }
      } catch {
        // Graceful fallback
      }
    }
    const conversation = await this.conversationRepo.create({
      ...input,
      companyId,
    });
    if (input.initialMessage?.trim()) {
      const senderId = input.participantIds[0];
      try {
        await this.sendMessage({
          conversationId: conversation.id,
          senderId,
          body: input.initialMessage.trim(),
        });
      } catch (msgErr) {
        console.warn('[messaging] initial message send warning:', msgErr);
      }
    }
    return (await this.conversationRepo.findById(conversation.id)) ?? conversation;
  }

  async getConversation(id: ConversationId, userId: UserId): Promise<Conversation | null> {
    const conversation = await this.conversationRepo.findById(id);
    if (!conversation) return null;
    this.assertParticipant(conversation, userId);
    return conversation;
  }

  listConversations(userId: UserId, pagination?: PaginationParams): Promise<PaginatedResult<Conversation>> {
    return this.conversationRepo.paginate({ participantId: userId, status: 'open' }, pagination);
  }

  async listConversationItems(
    userId: UserId,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<ConversationListItem>> {
    const result = await this.listConversations(userId, pagination);
    const data = await Promise.all(
      result.data.map(async (conversation) => {
        const otherUserId = this.otherParticipantId(conversation, userId);
        const [otherParticipant, listing, company, unreadCount] = await Promise.all([
          this.resolveParticipantView(otherUserId, { companyId: conversation.companyId }),
          conversation.listingId ? this.listingRepo.findById(conversation.listingId) : Promise.resolve(null),
          conversation.companyId ? this.companyRepo.findById(conversation.companyId) : Promise.resolve(null),
          this.messageRepo.countUnread(conversation.id, userId),
        ]);
        const supportOther =
          conversation.kind === 'support'
            ? {
                ...otherParticipant,
                displayName: 'Girisimbee Destek',
                companyName: 'Destek ekibi',
              }
            : otherParticipant;
        return {
          conversation,
          otherParticipant: supportOther,
          listingTitle:
            conversation.kind === 'support'
              ? 'Girisimbee Destek'
              : (listing?.title ?? null),
          companyName:
            conversation.kind === 'support'
              ? 'Destek ekibi'
              : (company?.name ?? otherParticipant.companyName),
          unreadCount,
        };
      }),
    );
    return { ...result, data };
  }

  async getThreadMeta(conversationId: ConversationId, userId: UserId): Promise<ConversationThreadMeta | null> {
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) return null;
    const otherUserId = this.otherParticipantId(conversation, userId);
    const otherParticipant = await this.resolveParticipantView(otherUserId, {
      companyId: conversation.companyId,
    });

    if (conversation.kind === 'support' || !conversation.listingId) {
      return {
        conversationId,
        kind: 'support',
        listingId: null,
        listingTitle: 'Girisimbee Destek',
        listingSlug: null,
        companyId: null,
        companyName: 'Destek ekibi',
        otherParticipant: {
          ...otherParticipant,
          displayName: 'Girisimbee Destek',
          companyName: 'Destek ekibi',
        },
      };
    }

    const [listing, company] = await Promise.all([
      this.listingRepo.findById(conversation.listingId),
      conversation.companyId ? this.companyRepo.findById(conversation.companyId) : Promise.resolve(null),
    ]);
    if (!listing) return null;
    const kind =
      conversation.kind === 'application' || Boolean(conversation.applicationId)
        ? 'application'
        : 'listing';
    return {
      conversationId,
      kind,
      listingId: conversation.listingId,
      listingTitle: listing.title,
      listingSlug: listing.slug,
      companyId: conversation.companyId,
      companyName: company?.name ?? null,
      applicationId: conversation.applicationId ?? null,
      otherParticipant,
    };
  }

  async sendMessage(input: CreateMessageInput): Promise<Message> {
    const parsed = createMessageSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError('Invalid message', { _: parsed.error.errors.map((e) => e.message) });
    }
    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) throw new NotFoundError('Conversation', input.conversationId);
    this.assertParticipant(conversation, input.senderId);
    if (conversation.kind !== 'support' && !conversation.listingId) {
      throw new ForbiddenError('Listing context required');
    }

    const message = await this.messageRepo.create(input);
    await this.conversationRepo.updateLastMessage(conversation.id, message.body, message.createdAt);
    return message;
  }

  async getMessages(
    conversationId: ConversationId,
    userId: UserId,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Message>> {
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) throw new NotFoundError('Conversation', conversationId);
    return this.messageRepo.findByConversationId(conversationId, pagination);
  }

  async markAsRead(conversationId: ConversationId, userId: UserId): Promise<void> {
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) throw new NotFoundError('Conversation', conversationId);
    const { data } = await this.messageRepo.findByConversationId(conversationId, { page: 1, limit: 1 });
    const latest = data[0];
    if (!latest) return;
    await this.messageRepo.markAsRead(conversationId, userId, latest.id);
    await this.conversationRepo.updateParticipantRead(conversationId, userId, latest.id, now());
  }

  async archive(conversationId: ConversationId, userId: UserId): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) throw new NotFoundError('Conversation', conversationId);
    return this.conversationRepo.update(conversationId, { status: 'archived' });
  }

  async getOrCreateForListing(
    listingId: ListingId,
    ownerId: UserId,
    applicantId: UserId,
    options?: { bypassContactRequestGate?: boolean },
  ): Promise<Conversation> {
    if (ownerId === applicantId) {
      throw new ForbiddenError('Cannot message yourself');
    }
    const listing = await this.listingRepo.findById(listingId);
    if (!listing || listing.status !== 'published' || listing.deletedAt) {
      throw new NotFoundError('Listing', listingId);
    }
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenError('Invalid listing owner');
    }

    const participantIds = [ownerId, applicantId];
    const existing = await this.conversationRepo.findByListingAndParticipants(listingId, participantIds);
    if (existing) return existing;

    if (!options?.bypassContactRequestGate && this.contactRequestRepo) {
      const accepted = await this.contactRequestRepo.findAcceptedForListingParticipants(
        listingId,
        ownerId,
        applicantId,
      );
      if (!accepted) {
        throw new ForbiddenError(
          'Mesajlaşma yalnızca kabul edilmiş iletişim talebinden sonra başlatılabilir.',
        );
      }
    }

    return this.startConversation({
      participantIds,
      listingId,
      companyId: listing.companyId ?? null,
    });
  }

  getUnreadCount(userId: UserId): Promise<number> {
    return this.conversationRepo.countUnreadForUser(userId);
  }
}
