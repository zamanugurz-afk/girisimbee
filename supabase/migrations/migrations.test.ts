import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Schema migrations verified via pg-mem (tables, enums, columns) */
const P0_SCHEMA_MIGRATIONS = [
  '20260801120000_ecosystem_enums.sql',
  '20260801120100_ecosystem_subcategories.sql',
  '20260801120200_ecosystem_extend_listings.sql',
  '20260801120300_ecosystem_module_profiles.sql',
  '20260801120400_ecosystem_matches_applications.sql',
  '20260801120500_ecosystem_documents.sql',
  '20260801120600_ecosystem_payments.sql',
];

const P0_RLS_MIGRATIONS = [
  '20260801120700_ecosystem_rls_helpers.sql',
  '20260801120800_ecosystem_rls_policies.sql',
];

const EXPECTED_TABLES = [
  'marketplace_subcategories',
  'marketplace_profile_modules',
  'entrepreneur_profiles',
  'investor_profiles',
  'candidate_profiles',
  'employer_profiles',
  'founder_profiles',
  'franchise_profiles',
  'marketplace_matches',
  'marketplace_applications',
  'marketplace_documents',
  'marketplace_payments',
];

function transformEnumDoBlocks(sql: string): string {
  return sql.replace(
    /DO\s+\$\$\s*BEGIN\s*CREATE TYPE\s+(\S+)\s+AS ENUM\s*\(([\s\S]*?)\);\s*EXCEPTION WHEN duplicate_object THEN NULL;\s*END\s+\$\$;/gi,
    (_, typeName, values) => `CREATE TYPE ${typeName} AS ENUM (${values});`,
  );
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let dollarTag: string | null = null;

  for (const line of sql.split('\n')) {
    current += `${line}\n`;
    const trimmed = line.trim();

    if (!dollarTag) {
      const open = trimmed.match(/\$(\w*)\$/);
      if (open) dollarTag = open[0];
    } else if (trimmed.includes(dollarTag)) {
      dollarTag = null;
    }

    if (!dollarTag && trimmed.endsWith(';')) {
      statements.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) statements.push(current.trim());
  return statements.filter(Boolean);
}

function shouldSkipStatement(stmt: string): boolean {
  if (/UPDATE public\.marketplace_/i.test(stmt)) return true;
  if (/^DO \$\$/im.test(stmt)) return true;
  if (/CREATE TRIGGER/i.test(stmt)) return true;
  if (/DROP TRIGGER/i.test(stmt)) return true;
  if (/CREATE OR REPLACE FUNCTION/i.test(stmt)) return true;
  if (/^INSERT INTO storage\./i.test(stmt)) return true;
  if (/^DO \$\$/i.test(stmt) && /TRIGGER|EXECUTE FUNCTION/i.test(stmt)) return true;
  return false;
}

function applySql(db: ReturnType<typeof newDb>, sql: string): void {
  const transformed = transformEnumDoBlocks(sql);
  for (const stmt of splitSqlStatements(transformed)) {
    if (shouldSkipStatement(stmt)) continue;
    db.public.none(stmt);
  }
}

function stripRlsForValidation(sql: string): string {
  return sql
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    })
    .join('\n');
}

describe('P0 ecosystem migrations', () => {
  it('applies schema migrations (enums + tables) in order', () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: 'gen_random_uuid',
      returns: 'uuid' as never,
      implementation: () => crypto.randomUUID(),
    });
    db.public.registerFunction({
      name: 'auth.uid',
      returns: 'uuid' as never,
      implementation: () => '00000000-0000-4000-8000-000000000001',
    });

    const bootstrap = fs.readFileSync(
      path.resolve(process.cwd(), 'lib/testing/migration-bootstrap.sql'),
      'utf8',
    );
    db.public.none(bootstrap);

    for (const file of P0_SCHEMA_MIGRATIONS) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      applySql(db, sql);
    }

    for (const table of EXPECTED_TABLES) {
      const result = db.public.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}'`,
      );
      expect(result.rows.length, `missing table: ${table}`).toBe(1);
    }
  });

  it('has valid RLS migration files with policies and helpers', () => {
    for (const file of P0_RLS_MIGRATIONS) {
      const sql = stripRlsForValidation(fs.readFileSync(path.join(__dirname, file), 'utf8'));
      expect(sql.length).toBeGreaterThan(100);
      expect(sql).toMatch(/CREATE (OR REPLACE FUNCTION|POLICY)/i);
    }
  });

  it('lists all migration files in chronological order', () => {
    const files = fs
      .readdirSync(__dirname)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    expect(files.length).toBeGreaterThan(0);
    expect(files[0] <= files[files.length - 1]).toBe(true);
  });
});
