export default function HesabimProfilimLoading() {
  return (
    <>
      <div className="border-b border-border/80 px-5 py-6 dark:border-white/10 sm:px-8">
        <div className="h-7 w-36 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-6 px-5 py-8 sm:px-8">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10 sm:p-6"
          >
            <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-muted" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-[85%] animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-[65%] animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
        <p className="text-center text-sm text-muted-foreground">Profil yükleniyor…</p>
      </div>
    </>
  );
}
