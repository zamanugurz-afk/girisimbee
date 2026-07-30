import { SiteLogo, getFooterLinks, MVP_COPY } from '@/features/shared';

export function Footer() {
  const footerLinks = getFooterLinks();

  return (
    <footer className="border-t border-border/80 bg-background py-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <SiteLogo />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Yatırım, iş ve ortaklık platformu
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/80">{MVP_COPY.communicationNote}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold tracking-wide text-foreground">{title}</h4>
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-5">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Girisimco
          </p>
        </div>
      </div>
    </footer>
  );
}
