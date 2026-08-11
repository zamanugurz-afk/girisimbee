import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = '20260802030000_account_profiles_consents_settings_security.sql';

function readMigration(): string {
  return fs.readFileSync(path.join(__dirname, MIGRATION), 'utf8');
}

describe('20260802030000 auth/profile hardening V2 invariants', () => {
  const sql = readMigration();

  it('forces handle_new_user role to user and ignores metadata role', () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.handle_new_user/i);
    expect(sql).not.toMatch(/raw_user_meta_data->>'role'/);
    expect(sql).toMatch(/VALUES \(\s*NEW\.id,\s*NEW\.id,\s*'user'/s);
    expect(sql).toMatch(/role intentionally NOT updated on conflict/i);
  });

  it('maps moderator → admin and member → user before constraint', () => {
    expect(sql).toMatch(/WHEN lower\(trim\(role\)\) IN \('moderator'\) THEN 'admin'/);
    expect(sql).toMatch(
      /WHEN lower\(trim\(role\)\) IN \('user', 'member', 'verified', 'company'\) THEN 'user'/,
    );
    expect(sql).toMatch(/CHECK \(role IS NULL OR role IN \('user', 'admin', 'super_admin'\)\)/);
  });

  it('installs role immutability guard trigger', () => {
    expect(sql).toMatch(/enforce_profiles_role_guard/);
    expect(sql).toMatch(/profiles\.role cannot be changed by non-admin users/);
    expect(sql).toMatch(/BEFORE INSERT OR UPDATE ON public\.profiles/);
  });

  it('makes security logs append-only for authenticated', () => {
    expect(sql).toMatch(/user_security_logs_insert_own/);
    expect(sql).toMatch(/user_security_logs_select_own/);
    expect(sql).not.toMatch(/CREATE POLICY "user_security_logs_update_own"/);
    expect(sql).not.toMatch(/CREATE POLICY "user_security_logs_delete_own"/);
    expect(sql).toMatch(/GRANT SELECT, INSERT ON TABLE public\.user_security_logs TO authenticated/);
  });

  it('makes user_consents append-only for authenticated', () => {
    expect(sql).toMatch(/user_consents_insert_own/);
    expect(sql).not.toMatch(/CREATE POLICY "user_consents_update_own"/);
    expect(sql).not.toMatch(/CREATE POLICY "user_consents_delete_own"/);
    expect(sql).toMatch(/GRANT SELECT, INSERT ON TABLE public\.user_consents TO authenticated/);
  });

  it('drops public profiles_select_all and keeps own/admin select', () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS "profiles_select_all"/);
    expect(sql).toMatch(/CREATE POLICY "profiles_select_own"/);
    expect(sql).toMatch(/is_account_profile_owner\(id, user_id\) OR public\.is_admin\(\)/);
  });

  it('keeps is_admin including super_admin with locked search_path', () => {
    expect(sql).toMatch(/role IN \('admin', 'super_admin'\)/);
    expect(sql).toMatch(/SET search_path = public/);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.is_admin\(UUID\) FROM PUBLIC/);
  });

  it('appears before legal consent events migration chronologically', () => {
    expect(MIGRATION < '20260810120000_legal_consent_events_and_versions.sql').toBe(true);
  });
});
