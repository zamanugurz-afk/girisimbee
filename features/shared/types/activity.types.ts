/**
 * Activity — immutable audit & live activity feed events.
 *
 * Purpose: Power "Canlı aktivite" feed, analytics, audit trail.
 * Relations: actor User; polymorphic target entity.
 * Lifecycle: append-only (no updates; soft delete for GDPR erasure only)
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { ActivityId, UserId } from '@/lib/domain/ids';

export type ActivityVerb =
  | 'listing.created'
  | 'listing.published'
  | 'listing.viewed'
  | 'application.submitted'
  | 'application.accepted'
  | 'message.sent'
  | 'user.registered'
  | 'user.verified'
  | 'company.created'
  | 'favorite.added'
  | 'match.created';

export type ActivityEntityType =
  | 'listing'
  | 'application'
  | 'user'
  | 'company'
  | 'conversation'
  | 'favorite';

export interface Activity extends Timestamps, SoftDeletable {
  id: ActivityId;
  actorId: UserId | null;
  verb: ActivityVerb;
  entityType: ActivityEntityType;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
  isPublic: boolean;
}

export type CreateActivityInput = Pick<
  Activity,
  'verb' | 'entityType' | 'entityId' | 'summary'
> & {
  actorId?: UserId | null;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
};

export interface ActivityFilter {
  actorId?: UserId;
  verb?: ActivityVerb | ActivityVerb[];
  entityType?: ActivityEntityType;
  entityId?: string;
  isPublic?: boolean;
  after?: string;
  before?: string;
  includeDeleted?: boolean;
}

export const ACTIVITY_INDEXES: IndexDefinition[] = [
  { name: 'activities_created_at_idx', columns: ['created_at'] },
  { name: 'activities_actor_id_idx', columns: ['actor_id'], where: 'actor_id IS NOT NULL' },
  { name: 'activities_entity_idx', columns: ['entity_type', 'entity_id'] },
  { name: 'activities_public_created_at_idx', columns: ['is_public', 'created_at'], where: 'is_public = true' },
  { name: 'activities_verb_idx', columns: ['verb'] },
];

export const ACTIVITY_VALIDATION: ValidationRule[] = [
  { field: 'verb', rule: 'required', message: 'Aktivite tipi gerekli.' },
  { field: 'summary', rule: 'required|max:500', message: 'Özet gerekli.' },
];
