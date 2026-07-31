import { GirisimcoLogo } from '@/components/girisimco/logo';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
      <GirisimcoLogo />
      <div className="flex flex-col items-center gap-2">
        <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#60A5FA] via-[#5B5CF6] to-[#6C63FF]" />
        </div>
        <p className="text-gc-xs text-muted-foreground">Yükleniyor…</p>
      </div>
    </div>
  );
}
