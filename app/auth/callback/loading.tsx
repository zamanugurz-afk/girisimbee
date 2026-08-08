export default function AuthCallbackLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-display text-lg font-semibold text-foreground">
          E-posta doğrulanıyor…
        </p>
        <p className="text-sm text-muted-foreground">
          Lütfen bekleyin, hesabınız hazırlanıyor.
        </p>
      </div>
    </div>
  );
}
