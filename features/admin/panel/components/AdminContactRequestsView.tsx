'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/features/admin/panel/constants/admin-nav.constants';

type ContactRequestRow = {
  id: string;
  listing_id: string;
  requester_user_id: string;
  owner_user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  accepted_at: string | null;
  conversation_id: string | null;
};

type GrantRow = {
  id: string;
  contact_request_id: string;
  disclosed_fields: string[];
  granted_at: string;
  revoked_at: string | null;
};

export function AdminContactRequestsView() {
  const [requests, setRequests] = useState<ContactRequestRow[]>([]);
  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/contact-requests');
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          data?: {
            requests?: ContactRequestRow[];
            disclosureGrants?: GrantRow[];
            tables?: string[];
          };
        };
        if (!res.ok) throw new Error(json.error ?? 'Yüklenemedi');
        if (cancelled) return;
        setRequests(json.data?.requests ?? []);
        setGrants(json.data?.disclosureGrants ?? []);
        setTables(json.data?.tables ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Yüklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 p-5 sm:p-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">İletişim Talepleri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contact-request kayıtları, disclosure grant’leri ve ilgili tablolar.
        </p>
      </header>

      <section className="rounded-2xl border border-border/80 bg-card p-4 dark:border-white/10">
        <h2 className="text-sm font-semibold">İlgili tablolar</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {tables.map((t) => (
            <li key={t}>
              <code>{t}</code>
            </li>
          ))}
          <li>
            Şikayet kuyruğu: <Link className="text-primary underline" href={ADMIN_ROUTES.moderation}>Moderasyon</Link>
            {' '}(<code>marketplace_reports</code>)
          </li>
        </ul>
      </section>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Talepler ({requests.length})</h2>
            <div className="overflow-x-auto rounded-2xl border border-border/80 dark:border-white/10">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Durum</th>
                    <th className="px-3 py-2">İlan</th>
                    <th className="px-3 py-2">Talepçi</th>
                    <th className="px-3 py-2">Sahip</th>
                    <th className="px-3 py-2">Mesaj</th>
                    <th className="px-3 py-2">Oluşturma</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-t border-border/60 dark:border-white/10">
                      <td className="px-3 py-2 font-medium">{r.status}</td>
                      <td className="px-3 py-2">
                        <Link href={`/ilan/${r.listing_id}`} className="text-primary underline">
                          {r.listing_id.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono">{r.requester_user_id.slice(0, 8)}…</td>
                      <td className="px-3 py-2 font-mono">{r.owner_user_id.slice(0, 8)}…</td>
                      <td className="max-w-[220px] truncate px-3 py-2">{r.message ?? '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Disclosure grants ({grants.length})</h2>
            <div className="overflow-x-auto rounded-2xl border border-border/80 dark:border-white/10">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Talep</th>
                    <th className="px-3 py-2">Alanlar</th>
                    <th className="px-3 py-2">Veriliş</th>
                    <th className="px-3 py-2">İptal</th>
                  </tr>
                </thead>
                <tbody>
                  {grants.map((g) => (
                    <tr key={g.id} className="border-t border-border/60 dark:border-white/10">
                      <td className="px-3 py-2 font-mono">{g.contact_request_id.slice(0, 8)}…</td>
                      <td className="px-3 py-2">{(g.disclosed_fields ?? []).join(', ')}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(g.granted_at).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-3 py-2">{g.revoked_at ? 'Evet' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
