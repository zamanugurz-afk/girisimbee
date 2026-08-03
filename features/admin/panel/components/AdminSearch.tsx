'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AdminSearch({
  value,
  onChange,
  placeholder = 'Ara…',
  className,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-2xl border-border/80 bg-background pl-9 dark:border-white/10"
        aria-label={placeholder}
      />
    </div>
  );
}
