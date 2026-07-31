import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok } from '@/lib/api/response';
import { idParamSchema, matchTransitionSchema } from '@/lib/api/validation';
import { ids } from '@/lib/domain/ids';
import { ValidationError } from '@/lib/domain/errors';

export const GET = withAuth(async (ctx, _request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const match = await ctx.container.ecosystem.matchService.requireById(ids.match(id));
  return ok({ match });
});

export const PATCH = withAuth(async (ctx, request, { params }) => {
  const { id } = idParamSchema.parse(params);
  const body = await parseJsonBody(request);
  const { action } = matchTransitionSchema.parse(body);
  const matchId = ids.match(id);
  const { matchService } = ctx.container.ecosystem;

  switch (action) {
    case 'accept': {
      const match = await matchService.accept(matchId, ctx.profileId);
      return ok({ match });
    }
    case 'decline': {
      const match = await matchService.decline(matchId, ctx.profileId);
      return ok({ match });
    }
    case 'contact': {
      const result = await matchService.contact(matchId, ctx.profileId);
      return ok({ match: result.match, contact: result.contact });
    }
    case 'close_won': {
      const match = await matchService.closeWon(matchId, ctx.profileId);
      return ok({ match });
    }
    case 'close_lost': {
      const match = await matchService.closeLost(matchId, ctx.profileId);
      return ok({ match });
    }
    default:
      throw new ValidationError('Geçersiz eylem.', { action: ['Desteklenmeyen eylem.'] });
  }
});
