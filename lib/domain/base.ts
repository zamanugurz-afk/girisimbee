/**
 * Shared domain kernel — base types for all Girisimbee entities.
 * Designed for PostgreSQL/Supabase at scale (millions of rows).
 */

/** ISO 8601 timestamp string (UTC). */
export type Timestamp = string;

/** Branded ID base — use feature-specific branded IDs. */
export type EntityId = string & { readonly __brand: unique symbol };

export interface Timestamps {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SoftDeletable {
  deletedAt: Timestamp | null;
}

export interface BaseEntity extends Timestamps, SoftDeletable {
  id: EntityId;
}

/** Standard entity lifecycle statuses. */
export type EntityStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'paused'
  | 'archived'
  | 'suspended'
  | 'rejected'
  | 'expired'
  | 'deleted';

export interface StatusAware {
  status: EntityStatus;
}

/** Database index definitions — used in migrations. */
export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
  where?: string;
  type?: 'btree' | 'gin' | 'gist';
}

/** Field-level validation rule metadata. */
export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

/** Entity lifecycle transition map. */
export type LifecycleTransitions<S extends string = EntityStatus> = Record<
  S,
  readonly S[]
>;

export function canTransition<S extends string>(
  transitions: LifecycleTransitions<S>,
  from: S,
  to: S,
): boolean {
  return transitions[from]?.includes(to) ?? false;
}

/** Slug format: lowercase alphanumeric + hyphens. */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Email format. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Turkish phone E.164 or local format. */
export const PHONE_REGEX = /^(\+90|0)?[1-9]\d{9}$/;

export const DOMAIN_DEFAULTS = {
  pageSize: 20,
  maxPageSize: 100,
  slugMaxLength: 120,
  titleMaxLength: 200,
  descriptionMaxLength: 10000,
  tagMaxLength: 50,
} as const;
