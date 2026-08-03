export default function HesabimFavorilerimLoading() {
  return (
    <>
      <div className="border-b border-border/80 px-5 py-6 dark:border-white/10 sm:px-8">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-4 px-5 py-8 sm:px-8">
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10"
          >
            <div className="h-5 w-[70%] max-w-md animate-pulse rounded-md bg-muted" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 h-4 w-56 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
        <p className="text-center text-sm text-muted-foreground">Favoriler yükleniyor…</p>
      </div>
    </>
  );
}
