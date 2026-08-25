import type { ConversationId, ListingId, UserId, CompanyId } from '@/lib/domain/ids';
import type { Conversation } from '@/features/messaging/types/conversation.types';

export interface ConversationParticipantView {
  userId: UserId;
  displayName: string;
  avatarUrl: string | null;
  username: string | null;
  companyName: string | null;
  userVerified: boolean;
  investorVerified: boolean;
  companyVerified: boolean;
}

export interface ConversationListItem {
  conversation: Conversation;
  otherParticipant: ConversationParticipantView;
  listingTitle: string | null;
  listingSlug?: string | null;
  companyName: string | null;
  unreadCount: number;
}

export interface ConversationThreadMeta {
  conversationId: ConversationId;
  kind: 'listing' | 'support' | 'application';
  listingId: ListingId | null;
  listingTitle: string;
  listingSlug: string | null;
  companyId: CompanyId | null;
  companyName: string | null;
  applicationId?: import('@/lib/domain/ids').ApplicationId | null;
  otherParticipant: ConversationParticipantView;
}

/** Typing indicator — structure ready for realtime wiring. */
export interface TypingIndicatorState {
  conversationId: ConversationId;
  userId: UserId;
  isTyping: boolean;
}

/** Attachment upload slot — architecture ready. */
export interface MessageAttachmentDraft {
  file: File;
  previewUrl: string;
  uploadUrl?: string;
}
