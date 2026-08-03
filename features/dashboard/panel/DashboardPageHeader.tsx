export function DashboardPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-border/80 px-5 py-6 sm:px-8 dark:border-white/10">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
