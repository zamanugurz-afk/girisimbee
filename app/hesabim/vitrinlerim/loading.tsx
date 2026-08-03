export default function HesabimVitrinlerimLoading() {
  return (
    <>
      <div className="border-b border-border/80 px-5 py-6 dark:border-white/10 sm:px-8">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-6 px-5 py-8 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10"
            >
              <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        {[0, 1].map((key) => (
          <div
            key={key}
            className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10"
          >
            <div className="h-5 w-[55%] max-w-md animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-4 w-40 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
        <p className="text-center text-sm text-muted-foreground">Vitrinler yükleniyor…</p>
      </div>
    </>
  );
}
