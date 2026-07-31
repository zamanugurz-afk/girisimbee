import { withPublic, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';

export const POST = withPublic(async (request) => {
  const payload = await parseJsonBody(request);
  const supabase = createClient();
  const container = getServerContainer(supabase);
  const result = await container.ecosystem.paymentService.verifyWebhook(payload);

  if (!result) {
    return ok({ received: true, processed: false });
  }

  return ok({ received: true, processed: true, payment: result });
});
