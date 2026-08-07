import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  'dist',
  '.git',
  'build-debug',
  'build-after',
  'build-verify',
]);
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (EXTS.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}
function rel(p) {
  return toPosix(path.relative(root, p));
}

const allFiles = walk(root);
const byRel = new Map(allFiles.map((f) => [rel(f), f]));

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('@/') && !spec.startsWith('.')) return null;
  let base;
  if (spec.startsWith('@/')) base = path.join(root, spec.slice(2));
  else base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    base + '.ts',
    base + '.tsx',
    base + '.js',
    base + '.jsx',
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return rel(c);
  }
  return null;
}

const importRe =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function getImports(fileAbs) {
  let src;
  try {
    src = fs.readFileSync(fileAbs, 'utf8');
  } catch {
    return [];
  }
  src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const specs = new Set();
  let m;
  importRe.lastIndex = 0;
  while ((m = importRe.exec(src))) {
    const spec = m[1] || m[2];
    if (spec) specs.add(spec);
  }
  return [...specs];
}

function isSourceTainted(fileAbs, src) {
  const r = rel(fileAbs);
  if (r.startsWith('scripts/') || r.includes('.test.') || r.includes('.spec.')) return null;
  if (r.startsWith('supabase/functions/')) return null;

  const hasNextHeaders = /from\s+['"]next\/headers['"]/.test(src);
  const usesCookies = /\bcookies\s*\(/.test(src);
  const usesHeaders = hasNextHeaders && /\bheaders\s*\(/.test(src);
  const usesCreateServerClient = /\bcreateServerClient\b/.test(src);
  const usesRouteHandlerClient = /\bcreateRouteHandlerClient\b/.test(src);
  const usesServerComponentClient = /\bcreateServerComponentClient\b/.test(src);
  const importsServerSupabase = /from\s+['"]@\/lib\/supabase\/server['"]/.test(src);
  const usesGetUser = /\.auth\.getUser\s*\(/.test(src);
  const usesGetSession = /\.auth\.getSession\s*\(/.test(src);
  // next-auth style auth() — not supabase.auth
  const usesAuthFn = /(?:^|[^\w.])auth\s*\(/.test(src) && /from\s+['"][^'"]*auth[^'"]*['"]/.test(src);
  const isClient =
    src.trimStart().startsWith("'use client'") ||
    src.trimStart().startsWith('"use client"');

  if (usesCookies && hasNextHeaders) return 'cookies()';
  if (usesHeaders) return 'headers()';
  if (usesCreateServerClient) return 'createServerClient';
  if (usesRouteHandlerClient) return 'createRouteHandlerClient';
  if (usesServerComponentClient) return 'createServerComponentClient';
  if (usesAuthFn) return 'auth()';
  if (!isClient && importsServerSupabase && (usesGetUser || usesGetSession)) {
    return usesGetUser ? 'getUser()' : 'getSession()';
  }
  // Any server module that constructs the cookie-bound client is tainted.
  if (importsServerSupabase && /createClient\s*\(/.test(src) && !isClient) {
    return 'createClient(server)';
  }
  return null;
}

const sourceReason = new Map();
for (const f of allFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const reason = isSourceTainted(f, src);
  if (reason) sourceReason.set(rel(f), reason);
}

// Explicit shared hubs
const hubs = {
  'lib/supabase/server.ts': 'cookies()+createServerClient',
  'lib/perf/nav-profile-root.tsx': 'headers()',
  'lib/perf/instrument-supabase.ts': 'createServerClient',
  'lib/api/with-auth.ts': 'getUser() via createClient(server)',
  'lib/api/action-handler.ts': 'getUser() via createClient(server)',
  'lib/api/with-admin.ts': 'createClient(server)',
  'features/authentication/lib/get-session.ts': 'createClient(server)',
  'lib/supabase/middleware.ts': 'createServerClient',
};
for (const [k, v] of Object.entries(hubs)) sourceReason.set(k, v);

const importCache = new Map();
function importsOf(relPath) {
  if (importCache.has(relPath)) return importCache.get(relPath);
  const abs = byRel.get(relPath);
  if (!abs) {
    importCache.set(relPath, []);
    return [];
  }
  const resolved = [];
  for (const s of getImports(abs)) {
    const r = resolveImport(abs, s);
    if (r) resolved.push(r);
  }
  importCache.set(relPath, resolved);
  return resolved;
}

function reachesTaint(startRel) {
  const seen = new Set();
  const stack = [startRel];
  while (stack.length) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);
    if (sourceReason.has(cur)) return { hit: cur, reason: sourceReason.get(cur) };
    for (const dep of importsOf(cur)) {
      if (!seen.has(dep)) stack.push(dep);
    }
  }
  return null;
}

function hasOptOut(relPath) {
  const abs = byRel.get(relPath);
  if (!abs) return false;
  const src = fs.readFileSync(abs, 'utf8');
  return (
    /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/.test(src) ||
    /export\s+const\s+revalidate\s*=\s*0\b/.test(src)
  );
}

const targets = allFiles
  .map(rel)
  .filter((r) => {
    if (!r.startsWith('app/')) return false;
    const base = path.posix.basename(r);
    return (
      base === 'page.tsx' ||
      base === 'page.ts' ||
      base === 'layout.tsx' ||
      base === 'layout.ts' ||
      base === 'route.ts' ||
      base === 'route.js'
    );
  })
  .sort();

const affected = [];
const optedOut = [];
const reasons = new Map();

for (const t of targets) {
  const hit = reachesTaint(t);
  if (!hit) continue;
  reasons.set(t, `${hit.reason} via ${hit.hit}`);
  if (hasOptOut(t)) {
    optedOut.push(t);
    continue;
  }
  affected.push(t);
}

console.log('---AFFECTED---');
for (const f of affected) console.log(f);
console.log('---COUNT---');
console.log(affected.length);
console.log('---OPTED_OUT---');
for (const f of optedOut) console.log(f);
console.log('---SOURCE_HUBS---');
for (const [k, v] of [...sourceReason.entries()].sort()) console.log(`${k} :: ${v}`);
