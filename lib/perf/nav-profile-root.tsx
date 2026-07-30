import { headers } from 'next/headers';
import { runWithNavProfile, setMiddlewareMs } from '@/lib/perf/navigation-profile';
import { NavProfileBeacon } from '@/lib/perf/nav-profile-beacon';

export function NavProfileRoot({ children }: { children: React.ReactNode }) {
  const h = headers();
  const pathname = h.get('x-pathname') ?? '/';
  const middlewareHeader = h.get('x-middleware-ms');

  return runWithNavProfile(pathname, () => {
    if (middlewareHeader) setMiddlewareMs(parseFloat(middlewareHeader));
    return (
      <>
        {children}
        <NavProfileBeacon />
      </>
    );
  });
}
