import Link from 'next/link';
import {
  SiteLogo,
  getFooterLinks,
  BRAND_TAGLINE,
} from '@/features/shared';
import {
  CONTACT_EMAILS,
  CONTACT_MAILTO,
} from '@/features/shared/constants/contact';

export function Footer() {
  const footerLinks = getFooterLinks();

  return (
    <footer className="border-t border-border/80 bg-background py-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs shrink-0">
            <SiteLogo />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {BRAND_TAGLINE}
            </p>

            <div className="mt-4 space-y-1.5">
              <a
                href={CONTACT_MAILTO.support}
                className="block text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Destek · {CONTACT_EMAILS.support}
              </a>
              <a
                href="/reklam"
                className="block text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Reklam · {CONTACT_EMAILS.ads}
              </a>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-10 lg:max-w-3xl lg:gap-12">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold tracking-wide text-foreground">{title}</h4>
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={`${title}-${link.label}`}>
                      {link.href.startsWith('mailto:') ? (
                        <a
                          href={link.href}
                          className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} GirisimBee. Tüm hakları saklıdır.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            Yatırım · İş · Ortaklık · Franchise · Dijital & AI
          </p>
        </div>
      </div>
    </footer>
  );
}
