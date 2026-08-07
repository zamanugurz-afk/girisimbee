import { redirect, notFound } from 'next/navigation';
import { getServerSession } from '@/features/authentication/lib/get-session';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ConversationThreadView } from '@/components/girisimco/messaging/conversation-thread-view';
import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence';
import type { ConversationId, UserId } from '@/lib/domain/ids';

export const metadata = {
  title: 'Konuşma — GirisimBee',
};

interface PageProps {
  params: { id: string };
}

export default async function ConversationPage({ params }: PageProps) {
  const user = await getServerSession();
  if (!user) redirect(AUTH_ROUTES.login);

  const container = getServerContainer(createClient());
  const conversation = await container.messagingService.getConversation(
    params.id as ConversationId,
    user.id as UserId,
  );
  if (!conversation) notFound();

  return <ConversationThreadView conversationId={params.id as ConversationId} />;
}
