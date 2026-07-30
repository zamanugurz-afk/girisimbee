import { getNavProfileSnapshot } from '@/lib/perf/navigation-profile';
import { isNavProfilingEnabled } from '@/lib/perf/nav-profile-env';

/** Embeds server-side profile JSON for Playwright to read after navigation. */
export function NavProfileBeacon() {
  if (!isNavProfilingEnabled()) return null;

  const profile = getNavProfileSnapshot();
  if (!profile) return null;

  return (
    <script
      id="nav-profile"
      type="application/json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(profile) }}
    />
  );
}
