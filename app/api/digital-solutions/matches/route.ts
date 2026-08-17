import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { createDigitalSolutionMatchService } from '@/features/digital-solution-matching/service';
import { assertNoDigitalSolutionContactLeak } from '@/features/digital-solution-matching/adapters/public-card';

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const container = getServerContainer(supabase);
    const service = createDigitalSolutionMatchService(container);

    const result = await service.getDigitalSolutionMatches(user.id);
    assertNoDigitalSolutionContactLeak(result);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching digital solution matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
