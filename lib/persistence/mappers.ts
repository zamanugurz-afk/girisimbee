/**
 * Shared row ↔ domain mappers for Supabase persistence.
 */
import type { Timestamps, SoftDeletable } from '@/lib/domain/base';

export function fromTimestamps(row: {
  created_at: string;
  updated_at: string;
}): Timestamps {
  return {
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromSoftDeletable(row: { deleted_at: string | null }): SoftDeletable {
  return { deletedAt: row.deleted_at };
}

export function toSnakeKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    result[camelToSnake(key)] = value;
  }
  return result;
}

export function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function mapRow<T>(row: Record<string, unknown>, fieldMap?: Record<string, string>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = fieldMap?.[key] ?? snakeToCamel(key);
    result[camelKey] = value;
  }
  return result as T;
}
