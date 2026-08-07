export function DashboardPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="relative border-b border-border/60 px-5 py-6 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366f1]/[0.05] via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative">
        <h1 className="gc-page-heading">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
