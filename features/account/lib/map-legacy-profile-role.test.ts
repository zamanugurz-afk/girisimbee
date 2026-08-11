import { describe, expect, it } from 'vitest';
import {
  mapLegacyProfileRoleToCanonical,
  resolveSignupProfileRole,
} from '@/features/account/lib/map-legacy-profile-role';

describe('mapLegacyProfileRoleToCanonical', () => {
  it('maps moderator → admin (app LEGACY_ROLE_MAP aligned)', () => {
    expect(mapLegacyProfileRoleToCanonical('moderator')).toBe('admin');
  });

  it('maps member → user', () => {
    expect(mapLegacyProfileRoleToCanonical('member')).toBe('user');
  });

  it('maps verified / company → user', () => {
    expect(mapLegacyProfileRoleToCanonical('verified')).toBe('user');
    expect(mapLegacyProfileRoleToCanonical('company')).toBe('user');
  });

  it('keeps user / admin / super_admin', () => {
    expect(mapLegacyProfileRoleToCanonical('user')).toBe('user');
    expect(mapLegacyProfileRoleToCanonical('admin')).toBe('admin');
    expect(mapLegacyProfileRoleToCanonical('super_admin')).toBe('super_admin');
  });

  it('normalizes superadmin aliases', () => {
    expect(mapLegacyProfileRoleToCanonical('superadmin')).toBe('super_admin');
    expect(mapLegacyProfileRoleToCanonical('super-admin')).toBe('super_admin');
  });

  it('defaults unknown / null to user', () => {
    expect(mapLegacyProfileRoleToCanonical(null)).toBe('user');
    expect(mapLegacyProfileRoleToCanonical('')).toBe('user');
    expect(mapLegacyProfileRoleToCanonical('weird')).toBe('user');
  });
});

describe('resolveSignupProfileRole', () => {
  it('ignores metadata role=admin', () => {
    expect(resolveSignupProfileRole('admin')).toBe('user');
  });

  it('ignores metadata role=super_admin', () => {
    expect(resolveSignupProfileRole('super_admin')).toBe('user');
  });

  it('ignores OAuth metadata role=admin', () => {
    expect(resolveSignupProfileRole('admin')).toBe('user');
  });
});
