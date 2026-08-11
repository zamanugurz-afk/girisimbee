import type { AppRole } from '@/features/authorization/role.constants';
import { LEGACY_ROLE_MAP } from '@/features/authorization/role.constants';

/**
 * Mirrors 20260802030000 role remap CASE for unit tests.
 * Canonical store: user | admin | super_admin.
 */
export function mapLegacyProfileRoleToCanonical(
  role: string | null | undefined,
): AppRole {
  if (role == null || String(role).trim() === '') return 'user';
  const key = String(role).trim().toLowerCase();
  if (key === 'admin') return 'admin';
  if (key === 'super_admin' || key === 'superadmin' || key === 'super-admin') {
    return 'super_admin';
  }
  if (key === 'moderator') return 'admin';
  if (key === 'user' || key === 'member' || key === 'verified' || key === 'company') {
    return 'user';
  }
  const mapped = LEGACY_ROLE_MAP[key];
  return mapped ?? 'user';
}

/** Signup / OAuth must never accept privileged roles from client metadata. */
export function resolveSignupProfileRole(
  _metadataRole: string | null | undefined,
): 'user' {
  void _metadataRole;
  return 'user';
}
