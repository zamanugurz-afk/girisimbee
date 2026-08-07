import { DigitalAiCapabilityIconBadge } from '@/components/girisimco/listing/digital-ai-capability-icons';
import type { DigitalAiCapability } from '@/features/listings/config/digital-ai-capabilities';
import { cn } from '@/lib/utils';

/** Read-only capability grid — matches create-flow / reference feature cards. */
export function DigitalAiCapabilityGrid({
  capabilities,
  className,
}: {
  capabilities: DigitalAiCapability[];
  className?: string;
}) {
  if (capabilities.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      {capabilities.map((capability) => (
        <article
          key={capability.id}
          className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.28)]"
        >
          <DigitalAiCapabilityIconBadge icon={capability.icon} />
          <h3 className="mt-4 text-[15px] font-semibold leading-snug text-foreground">
            {capability.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {capability.description}
          </p>
        </article>
      ))}
    </div>
  );
}
