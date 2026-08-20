export function DashboardPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="relative border-b border-slate-200/80 bg-white/60 px-5 py-6 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-xs">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/[0.04] via-transparent to-primary/[0.03]"
        aria-hidden
      />
      <div className="relative">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
