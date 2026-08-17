import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnv() {
  for (const rel of ['.env.local', '.env']) {
    const full = path.join(projectRoot, rel);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split(/\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const testEmail = 'demo@girisimbee.com';
  const testPassword = 'TestPassword123!';

  console.log(`Checking/creating test user: ${testEmail}...`);

  // Check if user exists
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('List users error:', listError);
    process.exit(1);
  }

  const existing = listData.users.find((u) => u.email === testEmail);

  if (existing) {
    console.log(`User exists (${existing.id}), updating password and email_confirm...`);
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      existing.id,
      {
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Test Kullanıcı',
          first_name: 'Test',
          last_name: 'Kullanıcı',
        },
      }
    );
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('User updated successfully:', updateData.user.id);
    }
  } else {
    console.log('Creating new confirmed test user...');
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Kullanıcı',
        first_name: 'Test',
        last_name: 'Kullanıcı',
      },
    });

    if (createError) {
      console.error('Create error:', createError);
      process.exit(1);
    }
    console.log('Created user successfully:', createData.user.id);
  }
}

main().catch(console.error);
