'use client';

import { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageComposerProps {
  onSend: (body: string, attachmentUrls?: string[]) => Promise<unknown>;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageComposer({
  onSend,
  disabled,
  placeholder = 'Mesajınızı yazın…',
}: MessageComposerProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending || disabled) return;
    setSending(true);
    try {
      const result = await onSend(body.trim(), []);
      if (result) setBody('');
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/80 bg-white p-4 dark:border-white/10 dark:bg-background"
    >
      <div className="flex items-end gap-2">
        <button
          type="button"
          disabled
          title="Ekler yakında"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-50"
          aria-label="Ek ekle (yakında)"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || sending}
          rows={1}
          className="min-h-[44px] max-h-32 resize-none rounded-xl border-border/80"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!body.trim() || disabled || sending}
          className="h-10 w-10 shrink-0 rounded-xl bg-primary dark:bg-white dark:text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
