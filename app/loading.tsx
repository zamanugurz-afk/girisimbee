export default function Loading() {
  return (
    <div className="gc-header-offset min-h-[60vh] bg-[#F7F8FB]">
      <div className="mx-auto max-w-[1280px] space-y-6 px-5 py-8 lg:px-8">
        <div className="h-40 animate-pulse rounded-2xl bg-white/80" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/80" />
          ))}
        </div>
      </div>
    </div>
  );
}
