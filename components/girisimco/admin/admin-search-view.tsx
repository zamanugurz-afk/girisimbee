'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getAdminService } from '@/lib/persistence/container';
import type { AdminSearchResults } from '@/features/admin/services/admin.service.interface';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AdminSearchView() {
  const service = useMemo(() => getAdminService(), []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      setResults(await service.globalSearch(query.trim()));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Arama başarısız');
    } finally {
      setLoading(false);
    }
  }

  const hasResults =
    results &&
    (results.users.length > 0 || results.companies.length > 0 || results.listings.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kullanıcı, şirket veya ilan ara…"
          className="max-w-md rounded-lg"
          onKeyDown={(e) => e.key === 'Enter' && void search()}
        />
        <Button size="sm" className="rounded-lg" disabled={loading} onClick={() => void search()}>
          {loading ? 'Aranıyor…' : 'Ara'}
        </Button>
      </div>

      {results && !hasResults && (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">Sonuç bulunamadı.</p>
        </div>
      )}

      {results && results.users.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kullanıcılar</h2>
          <ul className="space-y-2">
            {results.users.map(({ user, displayName, profile }) => (
              <li key={user.id} className="rounded-xl border border-border/80 px-4 py-3 dark:border-white/10">
                <p className="font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                {profile?.username && (
                  <Link href={`/profil/${profile.username}`} className="text-xs text-muted-foreground hover:underline">
                    @{profile.username}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {results && results.companies.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Şirketler</h2>
          <ul className="space-y-2">
            {results.companies.map((company) => (
              <li key={company.id} className="rounded-xl border border-border/80 px-4 py-3 dark:border-white/10">
                <Link href={`/company/${company.slug}`} className="font-medium text-foreground hover:underline dark:text-white">
                  {company.name}
                </Link>
                <p className="text-xs text-muted-foreground">@{company.slug}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results && results.listings.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">İlanlar</h2>
          <ul className="space-y-2">
            {results.listings.map((listing) => (
              <li key={listing.id} className="rounded-xl border border-border/80 px-4 py-3 dark:border-white/10">
                <Link href={`/ilan/${listing.slug}`} className="font-medium text-foreground hover:underline dark:text-white">
                  {listing.title}
                </Link>
                <p className="text-xs text-muted-foreground">{listing.status}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
