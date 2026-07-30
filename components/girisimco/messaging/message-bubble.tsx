import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '@/features/messaging/types/message.types';
import type { UserId } from '@/lib/domain/ids';
import { formatMessageTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isRead = message.status === 'read';

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%]',
          isOwn
            ? 'rounded-br-md bg-primary text-white dark:bg-white dark:text-primary-foreground'
            : 'rounded-bl-md border border-border/80 bg-muted/40 text-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white',
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
        {message.attachmentUrls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachmentUrls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs underline opacity-80"
              >
                Ek
              </a>
            ))}
          </div>
        )}
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            isOwn ? 'text-white/70 dark:text-primary-foreground/60' : 'text-muted-foreground',
          )}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn &&
            (isRead ? (
              <CheckCheck className="h-3 w-3" aria-label="Okundu" />
            ) : (
              <Check className="h-3 w-3" aria-label="Gönderildi" />
            ))}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicatorPlaceholder({ userId: _userId }: { userId?: UserId }) {
  return null;
}
