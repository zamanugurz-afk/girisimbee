export default function Loading() {
  return (
    <div className="gc-header-offset min-h-[50vh] bg-[#F7F8FB]">
      <div className="mx-auto max-w-[1280px] space-y-4 px-5 py-8 lg:px-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-white/80" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-white/80" />
          ))}
        </div>
      </div>
    </div>
  );
}
