import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, noContent } from '@/lib/api/response';
import { parseAdminListingAction } from '@/lib/api/validation/admin';
import { ids } from '@/lib/domain/ids';

/** PATCH — listing moderation actions */
export const PATCH = withAdmin(async (ctx, request, { params }) => {
  const body = await parseJsonBody(request);
  const action = parseAdminListingAction(body);
  const listingId = ids.listing(params.id);
  const admin = ctx.container.adminService;

  switch (action.action) {
    case 'approve': {
      const listing = await admin.publishListing(listingId);
      return ok({ listing });
    }
    case 'reject': {
      const listing = await admin.rejectListing(listingId, action.reason);
      return ok({ listing });
    }
    case 'feature': {
      const listing = await admin.featureListing(listingId, action.featuredUntil);
      return ok({ listing });
    }
    case 'unfeature': {
      const listing = await admin.unfeatureListing(listingId);
      return ok({ listing });
    }
    case 'mark_urgent': {
      const listing = await admin.markListingUrgent(listingId, action.urgentUntil);
      return ok({ listing });
    }
    case 'remove_urgent': {
      const listing = await admin.removeListingUrgent(listingId);
      return ok({ listing });
    }
    case 'unpublish': {
      const listing = await admin.unpublishListing(listingId);
      return ok({ listing });
    }
    case 'archive': {
      const listing = await admin.archiveListing(listingId);
      return ok({ listing });
    }
    case 'delete':
      await admin.deleteListing(listingId);
      return noContent();
  }
});
