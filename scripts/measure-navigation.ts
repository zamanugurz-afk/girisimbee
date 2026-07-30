/**
 * Navigation timing probe — run while dev server is up:
 *   npx tsx scripts/measure-navigation.ts
 */
const BASE = process.env.NAV_BASE ?? 'http://localhost:3002';

const ROUTES = [
  ['/', 'Home'],
  ['/kesfet', 'Explore'],
  ['/kategori/yatirim-bul', 'Category'],
  ['/dashboard', 'Dashboard'],
  ['/mesajlar', 'Messages'],
  ['/giris', 'Login'],
] as const;

async function measure(path: string): Promise<number> {
  const start = performance.now();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'text/html' },
    redirect: 'manual',
  });
  await res.text();
  if (!res.ok && res.status !== 307 && res.status !== 308) {
    throw new Error(`${path} -> HTTP ${res.status}`);
  }
  return performance.now() - start;
}

async function main() {
  console.log(`Base: ${BASE}\n`);
  console.log('Route                          ms     status');
  console.log('---------------------------------------------');

  let max = 0;
  for (const [path, label] of ROUTES) {
    try {
      const samples: number[] = [];
      for (let i = 0; i < 3; i++) {
        samples.push(await measure(path));
      }
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      max = Math.max(max, avg);
      const ok = avg < 300 ? 'OK' : 'SLOW';
      console.log(`${label.padEnd(28)} ${avg.toFixed(0).padStart(5)}   ${ok}`);
    } catch (e) {
      console.log(`${label.padEnd(28)}  ERR   ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log('---------------------------------------------');
  console.log(`Target: <300ms per navigation (server HTML TTFB)`);
  console.log(`Slowest avg: ${max.toFixed(0)}ms`);
}

main();
