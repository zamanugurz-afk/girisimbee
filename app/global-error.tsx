'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="tr">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Girişimbee Yükleniyor</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>Sayfa güncellenirken bir bağlantı yenilemesi gerekti.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.625rem 1.25rem', borderRadius: '0.75rem', background: '#F59E0B', color: '#000000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
          >
            Sayfayı Yenile
          </button>
        </div>
      </body>
    </html>
  );
}
