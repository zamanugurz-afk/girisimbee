import { AccountHeader } from '@/features/account/components/AccountHeader';

/** Skeleton placeholder for account sub-pages (no business logic yet). */
export function AccountPlaceholderPage({
  title,
  description = 'Bu bölüm yakında eklenecek.',
}: {
  title: string;
  description?: string;
}) {
  return (
    <>
      <AccountHeader title={title} description={description} />
      <div className="px-5 py-8 sm:px-8">
        <div className="rounded-xl border border-dashed border-border/80 p-8 text-center dark:border-white/10">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </>
  );
}
