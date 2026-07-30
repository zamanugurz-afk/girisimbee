/**
 * Central domain seed — generates a coherent dataset across all entities.
 * Deterministic; safe for development and integration tests.
 */
import { resetMockCounter } from '@/lib/domain/mock-utils';
import { generateMockUsers } from '@/features/authentication/mock/user.generator';
import { generateMockProfile } from '@/features/profiles/mock/profile.generator';
import { generateMockCompanies } from '@/features/companies/mock/company.generator';
import { generateMockCategories } from '@/features/categories/mock/category.generator';
import { generateMockListings } from '@/features/listings/mock/listing.generator';
import { generateMockConversations, generateMockMessages } from '@/features/messaging/mock/messaging.generator';
import { generateMockFavorites } from '@/features/favorites/mock/favorite.generator';
import { generateMockNotifications } from '@/features/notifications/mock/notification.generator';
import { generateMockActivities } from '@/features/shared/mock/moderation.generator';
import type { User } from '@/features/authentication/types/user.types';
import type { Profile } from '@/features/profiles/types/profile.types';
import type { Company } from '@/features/companies/types/company.types';
import type { Category } from '@/features/categories/types/category.entity.types';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type { Conversation } from '@/features/messaging/types/conversation.types';
import type { Message } from '@/features/messaging/types/message.types';
import type { Favorite } from '@/features/favorites/types/favorite.types';
import type { Notification } from '@/features/notifications/types/notification.types';
import type { Activity } from '@/features/shared/types/activity.types';

export interface DomainSeed {
  users: User[];
  profiles: Profile[];
  companies: Company[];
  categories: Category[];
  listings: Listing[];
  conversations: Conversation[];
  messages: Message[];
  favorites: Favorite[];
  notifications: Notification[];
  activities: Activity[];
}

export interface DomainSeedOptions {
  userCount?: number;
  listingCount?: number;
  conversationCount?: number;
  messagesPerConversation?: number;
}

const DEFAULT_OPTIONS: Required<DomainSeedOptions> = {
  userCount: 10,
  listingCount: 20,
  conversationCount: 5,
  messagesPerConversation: 4,
};

export function seedDomain(options: DomainSeedOptions = {}): DomainSeed {
  resetMockCounter();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const users = generateMockUsers(opts.userCount);
  const profiles = users.map((u, i) => generateMockProfile(i + 1, u.id));
  const companies = generateMockCompanies(Math.min(5, opts.userCount), users[0]?.id);
  const categories = generateMockCategories();
  const listings = generateMockListings(opts.listingCount, {
    ownerId: users[0]?.id,
    companyId: companies[0]?.id,
    categoryId: categories[0]?.id,
  });

  const conversations = generateMockConversations(opts.conversationCount);
  const messages = conversations.flatMap((c) =>
    generateMockMessages(opts.messagesPerConversation, c.id),
  );

  const favorites = generateMockFavorites(8, users[1]?.id);
  const notifications = generateMockNotifications(12, users[0]?.id);
  const activities = generateMockActivities(15);

  return {
    users,
    profiles,
    companies,
    categories,
    listings,
    conversations,
    messages,
    favorites,
    notifications,
    activities,
  };
}
