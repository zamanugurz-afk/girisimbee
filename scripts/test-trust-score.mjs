import { calculateTrustScore } from '../lib/engines/trust-score-engine.ts';

function mockListing(overrides = {}) {
  return {
    title: 'PlayStation 5 Slim 1TB',
    description:
      'Faturalı, garantili ve kutulu cihaz. Çok temiz kullanıldı, tüm aksesuarlar mevcut. Detaylı bilgi için mesaj atabilirsiniz.',
    image_urls: Array.from({ length: 8 }, (_, index) => `https://example.com/${index}.jpg`),
    seller: {
      id: 'seller-1',
      provider_id: 'provider-1',
      external_id: 'ext-1',
      display_name: 'Güvenilir Satıcı',
      member_since: 2018,
      listing_count: 120,
      rating: 4.8,
      phone_verified: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`FAIL: ${message}`);
  }
}

const trusted = calculateTrustScore(mockListing());
assert(trusted.score >= 85, `trusted listing should score high, got ${trusted.score}`);
assert(trusted.label === 'excellent', `trusted listing should be excellent, got ${trusted.label}`);
assert(
  trusted.reasons.some((reason) => reason.includes('Invoice available')),
  'trusted listing should mention invoice',
);
assert(
  trusted.reasons.some((reason) => reason.includes('8 photos')),
  'trusted listing should mention photo count',
);

const scam = calculateTrustScore(
  mockListing({
    title: 'ACİL SATILIK PS5 IBAN HAVALE',
    description: 'Kapora atın WhatsApp wp acil son fiyat boş mu oku',
    image_urls: [],
    seller: null,
  }),
);
assert(scam.rejected, 'scam listing should be rejected');
assert(scam.label === 'risky', `scam listing should be risky, got ${scam.label}`);
assert(scam.score <= 20, `scam listing score should be capped low, got ${scam.score}`);

const noisy = calculateTrustScore(
  mockListing({
    title: 'SON FİYAT PS5 SLİM DİSK',
    description: '🔥🔥🔥🔥🔥🔥 acil',
    image_urls: ['https://example.com/1.jpg'],
    seller: {
      ...mockListing().seller,
      rating: 3.1,
      listing_count: 2,
      member_since: new Date().getFullYear(),
    },
  }),
);
assert(noisy.score < trusted.score, 'noisy listing should score lower than trusted listing');
assert(
  noisy.reasons.some((reason) => reason.includes('ALL CAPS title') || reason.includes('emoji')),
  'noisy listing should include style penalties',
);

const fair = calculateTrustScore(
  mockListing({
    description: 'Temiz kullanılmış konsol.',
    image_urls: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    seller: {
      ...mockListing().seller,
      rating: 3.8,
      listing_count: 8,
      member_since: new Date().getFullYear() - 1,
    },
  }),
);
assert(fair.score >= 40 && fair.score < 85, `fair listing score out of range: ${fair.score}`);
assert(['fair', 'poor'].includes(fair.label), `fair listing label unexpected: ${fair.label}`);

console.log(`Trust score tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
