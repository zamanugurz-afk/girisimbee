import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'girisimbee-clean-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const results: Record<string, unknown> = {};

  try {
    const { count: mCount } = await supabase
      .from('marketplace_messages')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    results.messagesDeleted = mCount || 0;

    await supabase
      .from('marketplace_conversation_participants')
      .delete()
      .neq('conversation_id', '00000000-0000-0000-0000-000000000000');

    const { count: cCount } = await supabase
      .from('marketplace_conversations')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    results.conversationsDeleted = cCount || 0;

    const { count: crCount } = await supabase
      .from('marketplace_contact_requests')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    results.contactRequestsDeleted = crCount || 0;

    const { count: jaCount } = await supabase
      .from('marketplace_job_applications')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    results.jobApplicationsDeleted = jaCount || 0;

    await supabase
      .from('marketplace_applications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error), ...results },
      { status: 500 },
    );
  }
}
