/**
 * One-shot: repair corrupted Turkish chars in seeded support message/admin_note.
 * Run: node scripts/fix-support-seed-utf8.mjs
 *
 * Uses `npx supabase db query --linked` with a UTF-8 SQL file so PowerShell
 * cannot mangling ı/ğ/ü/ş/ö/ç.
 */
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const MESSAGE_ID = '09e4ce48-4142-4bb1-b87e-2deb9c62344e';
const INQUIRY_ID = 'c89f4cc6-de5a-4a5e-b756-d2167f2b437c';

const fixedBody = [
  'Destek talebiniz hakkında (#c89f4cc6)',
  'Konu: Genel',
  '',
  'Merhaba Uğur, talebinizi aldık. Bundan sonra destek yanıtlarını Mesajlarım üzerinden göreceksiniz. Bu alan artık aktif.',
].join('\n');

const fixedNote = '[seed] Mesajlarım destek sohbeti açıldı';
const fixedPreview = fixedBody.slice(0, 200);

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

const sql = `
UPDATE public.marketplace_messages
SET body = ${sqlString(fixedBody)},
    updated_at = now()
WHERE id = '${MESSAGE_ID}';

UPDATE public.marketplace_support_inquiries
SET admin_note = ${sqlString(fixedNote)},
    updated_at = now()
WHERE id = '${INQUIRY_ID}';

UPDATE public.marketplace_conversations c
SET last_message_preview = ${sqlString(fixedPreview)},
    updated_at = now()
FROM public.marketplace_support_inquiries i
WHERE i.id = '${INQUIRY_ID}'
  AND c.id = i.conversation_id;
`;

const sqlPath = join(tmpdir(), `fix-support-utf8-${Date.now()}.sql`);
writeFileSync(sqlPath, sql, { encoding: 'utf8' });

try {
  const result = spawnSync(
    'npx',
    ['supabase', 'db', 'query', '--linked', '-f', sqlPath],
    { encoding: 'utf8', shell: true, stdio: 'inherit' },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  console.log('OK: Türkçe karakterler düzeltildi.');
} finally {
  try {
    unlinkSync(sqlPath);
  } catch {
    /* ignore */
  }
}
