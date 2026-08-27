'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MarketplaceSearchBarProps {
  defaultQuery?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function MarketplaceSearchBar({
  defaultQuery = '',
  placeholder = 'İlan no, başlık veya şirket ara…',
  className,
  autoFocus,
}: MarketplaceSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/ara?q=${encodeURIComponent(q)}` : '/ara');
  };

  return (
    <form onSubmit={submit} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
    </form>
  );
}
