import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('Messaging Performance & Post-Login Redirection Verification', () => {
  it('1. GET /api/conversations uses batch queries and has zero sequential auto-heal loop', () => {
    const routeSource = read('app/api/conversations/route.ts');
    // Ensure the heavy N+1 auto_heal loop is removed
    expect(routeSource).not.toContain('[application.auto_heal.failed]');
    expect(routeSource).not.toContain('for (const app of appMap.values())');

    // Ensure batch operations are used
    expect(routeSource).toContain('.in(\'conversation_id\', activeConversationIds)');
    expect(routeSource).toContain('.in(\'user_id\', Array.from(otherUserIdsSet))');
    expect(routeSource).toContain('.in(\'id\', Array.from(listingIdsSet))');
    expect(routeSource).toContain('.in(\'id\', Array.from(companyIdsSet))');
    expect(routeSource).toContain('listingSlug: listingData?.slug ?? null');
  });

  it('2. use-dashboard-conversations resolves listingHref directly from server listingSlug', () => {
    const hookSource = read('features/messaging/hooks/use-dashboard-conversations.ts');
    expect(hookSource).toContain('item.listingSlug');
    expect(hookSource).toContain('/ilan/');
  });

  it('3. DashboardMessageThread renders viewport-aware Dialog with compact CareerProfilePreview', () => {
    const threadSource = read('features/messaging/components/dashboard/DashboardMessageThread.tsx');
    expect(threadSource).toContain('max-w-5xl xl:max-w-6xl max-h-[88vh]');
    expect(threadSource).toContain('compact={true}');
    expect(threadSource).toContain('overflow-y-auto');
  });

  it('4. LoginForm strictly uses getSafeRedirectUrl defaulting to home /', () => {
    const loginSource = read('features/authentication/components/login-form.tsx');
    expect(loginSource).toContain('getSafeRedirectUrl');
    expect(loginSource).toContain('AUTH_ROUTES.home');
  });

  it('5. Auth callback route strictly sanitizes redirect URLs with getSafeRedirectUrl', () => {
    const callbackSource = read('app/auth/callback/route.ts');
    expect(callbackSource).toContain('getSafeRedirectUrl(decoded, AUTH_ROUTES.home)');
  });
});
