-- Marketplace messaging: conversations, participants, messages

CREATE TABLE IF NOT EXISTS public.marketplace_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.marketplace_companies(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_conversations_listing_id_idx
  ON public.marketplace_conversations (listing_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS marketplace_conversations_company_id_idx
  ON public.marketplace_conversations (company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS marketplace_conversations_last_message_at_idx
  ON public.marketplace_conversations (last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS marketplace_conversations_status_idx
  ON public.marketplace_conversations (status);

CREATE TABLE IF NOT EXISTS public.marketplace_conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.marketplace_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_message_id UUID,
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS marketplace_conversation_participants_user_id_idx
  ON public.marketplace_conversation_participants (user_id);

CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.marketplace_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  attachment_urls JSONB NOT NULL DEFAULT '[]',
  read_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT marketplace_messages_body_length CHECK (char_length(body) >= 1 AND char_length(body) <= 5000)
);

CREATE INDEX IF NOT EXISTS marketplace_messages_conversation_created_idx
  ON public.marketplace_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_messages_sender_id_idx
  ON public.marketplace_messages (sender_id);

-- FK for last_read_message_id (deferred — messages table must exist first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_conversation_participants_last_read_fkey'
  ) THEN
    ALTER TABLE public.marketplace_conversation_participants
      ADD CONSTRAINT marketplace_conversation_participants_last_read_fkey
      FOREIGN KEY (last_read_message_id) REFERENCES public.marketplace_messages(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Helper to avoid RLS recursion on participants
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.marketplace_conversation_participants
    WHERE conversation_id = conv_id AND user_id = uid
  );
$$;

-- RLS
ALTER TABLE public.marketplace_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_conversations_participant_select"
  ON public.marketplace_conversations FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND public.is_conversation_participant(id, auth.uid())
  );

CREATE POLICY "marketplace_conversations_participant_insert"
  ON public.marketplace_conversations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "marketplace_conversations_participant_update"
  ON public.marketplace_conversations FOR UPDATE TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "marketplace_conversation_participants_select"
  ON public.marketplace_conversation_participants FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "marketplace_conversation_participants_insert"
  ON public.marketplace_conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_conversation_participant(conversation_id, auth.uid())
  );

CREATE POLICY "marketplace_conversation_participants_update"
  ON public.marketplace_conversation_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "marketplace_messages_participant_select"
  ON public.marketplace_messages FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );

CREATE POLICY "marketplace_messages_participant_insert"
  ON public.marketplace_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );

CREATE POLICY "marketplace_messages_participant_update"
  ON public.marketplace_messages FOR UPDATE TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));

-- updated_at triggers
DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS marketplace_conversations_updated_at ON public.marketplace_conversations';
  EXECUTE 'CREATE TRIGGER marketplace_conversations_updated_at BEFORE UPDATE ON public.marketplace_conversations FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at()';
  EXECUTE 'DROP TRIGGER IF EXISTS marketplace_messages_updated_at ON public.marketplace_messages';
  EXECUTE 'CREATE TRIGGER marketplace_messages_updated_at BEFORE UPDATE ON public.marketplace_messages FOR EACH ROW EXECUTE FUNCTION public.set_marketplace_updated_at()';
END $$;

-- Realtime for new messages
ALTER TABLE public.marketplace_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
