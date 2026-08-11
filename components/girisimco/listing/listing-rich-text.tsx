import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RichBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

/** Lightweight markdown subset for listing bodies — headings, lists, bold. */
export function parseListingRichText(source: string): RichBlock[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: RichBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) blocks.push({ type: 'p', text });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length > 0) blocks.push({ type: 'ul', items: listItems });
    listItems = [];
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h3', text: trimmed.replace(/^###\s+/, '') });
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: trimmed.replace(/^##\s+/, '') });
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: trimmed.replace(/^#\s+/, '') });
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function ListingRichText({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = parseListingRichText(content);
  if (blocks.length === 0) return null;

  return (
    <div className={cn('space-y-3 text-[15px] leading-relaxed text-muted-foreground', className)}>
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h4
              key={index}
              className="font-display text-[15px] font-semibold tracking-tight text-foreground"
            >
              {renderInline(block.text)}
            </h4>
          );
        }
        if (block.type === 'h3') {
          return (
            <h5
              key={index}
              className="font-display text-[14px] font-semibold tracking-tight text-foreground"
            >
              {renderInline(block.text)}
            </h5>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={index} className="list-disc space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
