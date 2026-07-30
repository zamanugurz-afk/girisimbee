'use client';

import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { NAV_SECTIONS, QUICK_ACTIONS } from '@/config/navigation';
import { OWNER_ROUTE } from '@/config/site';
import { useUI, useFilters } from '@/lib/stores';
import { useSearch, SEARCH_GROUP_LABELS, SEARCH_GROUP_ORDER } from '@/hooks/use-search';
import { openListingSource } from '@/lib/listing-source';
import {
  CornerDownLeft,
  Search as SearchIcon,
  Tag,
  User,
  MapPin,
  Zap,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import type { SearchEntityType, SearchResult } from '@/types';

const RESULT_ICONS: Record<SearchEntityType, LucideIcon> = {
  listing: SearchIcon,
  product: Tag,
  seller: User,
  district: MapPin,
  provider: Zap,
};

export function CommandPalette() {
  const router = useRouter();
  const { commandOpen, setCommandOpen } = useUI();
  const setListingsQuery = useFilters((s) => s.setQuery);
  const { query, setQuery, results, grouped, listings, isLoading, isSearching, reset } = useSearch();

  const go = (href: string) => {
    setCommandOpen(false);
    reset();
    router.push(href);
  };

  const handleOpenChange = (open: boolean) => {
    setCommandOpen(open);
    if (!open) reset();
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.type === 'listing') {
      const listing = listings.find((l) => l.id === result.id);
      setCommandOpen(false);
      reset();
      if (listing) openListingSource(listing);
      return;
    }

    if (result.type === 'district' || result.type === 'seller') {
      setListingsQuery(result.title);
      go(`${OWNER_ROUTE}/listings`);
      return;
    }

    go(result.href);
  };

  const hasResults = (results?.results.length ?? 0) > 0;

  return (
    <CommandDialog open={commandOpen} onOpenChange={handleOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="İlan, ürün, satıcı, ilçe ara…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isSearching ? (
          isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Veriler yükleniyor…
            </div>
          ) : !hasResults ? (
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
          ) : (
            SEARCH_GROUP_ORDER.map((type) => {
              const items = grouped[type];
              if (!items?.length) return null;
              const Icon = RESULT_ICONS[type];
              return (
                <CommandGroup key={type} heading={SEARCH_GROUP_LABELS[type]}>
                  {items.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      value={`${result.type} ${result.title} ${result.subtitle}`}
                      onSelect={() => handleSelectResult(result)}
                    >
                      <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{result.title}</span>
                      <span className="ml-auto pl-2 text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })
          )
        ) : (
          <>
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

            <CommandGroup heading="Sayfalar">
              {NAV_SECTIONS.flatMap((s) => s.items).map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.description}`}
                  onSelect={() => go(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  <span className="ml-auto pl-2 text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Hızlı işlemler">
              {QUICK_ACTIONS.map((qa) => (
                <CommandItem key={qa.label} value={`işlem ${qa.label}`} onSelect={() => go(qa.href)}>
                  <qa.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{qa.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="h-3 w-3" /> açmak için
        </span>
        <span>
          {isSearching && hasResults
            ? `${results?.results.length ?? 0} sonuç · ${results?.duration_ms ?? 0}ms`
            : 'kapatmak için esc'}
        </span>
      </div>
    </CommandDialog>
  );
}
