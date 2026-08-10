import { withAdmin } from '@/lib/api/with-admin';
import { ok } from '@/lib/api/response';
import { createServiceRoleClient } from '@/lib/supabase/service';

/** GET — admin list of contact requests + disclosure grants summary */
export const GET = withAdmin(async () => {
  const supabase = createServiceRoleClient();

  const [{ data: requests, error: reqError }, { data: grants, error: grantError }] =
    await Promise.all([
      supabase
        .from('marketplace_listing_contact_requests')
        .select(
          'id, listing_id, requester_user_id, owner_user_id, status, message, created_at, accepted_at, rejected_at, conversation_id, expires_at',
        )
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('marketplace_contact_disclosure_grants')
        .select(
          'id, contact_request_id, listing_id, owner_user_id, requester_user_id, disclosed_fields, granted_at, revoked_at',
        )
        .order('granted_at', { ascending: false })
        .limit(200),
    ]);

  if (reqError) throw reqError;
  if (grantError && !/does not exist|PGRST/i.test(grantError.message)) throw grantError;

  return ok({
    requests: requests ?? [],
    disclosureGrants: grants ?? [],
    tables: [
      'marketplace_listing_contact_requests',
      'marketplace_contact_disclosure_grants',
      'marketplace_reports',
    ],
  });
});
