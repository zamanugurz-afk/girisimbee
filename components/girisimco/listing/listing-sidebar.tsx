import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StartConversationButton } from '@/features/messaging/components/start-conversation-button';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import {
  DetailCard,
  FactGrid,
  FactRow,
} from '@/components/girisimco/listing/detail-primitives';
import type { ListingDetail } from '@/features/listings';

interface ListingSidebarProps {
  listing: ListingDetail;
}

export function ListingSidebar({ listing }: ListingSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
      {/* Company summary */}
      <DetailCard>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-xl dark:bg-white/5">
            {listing.company.emoji}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {listing.company.name}
            </p>
            <p className="text-xs text-muted-foreground">{listing.company.city}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {listing.company.summary}
        </p>
      </DetailCard>

      {/* Quick facts */}
      <DetailCard>
        <h3 className="text-sm font-semibold text-foreground">Hızlı Bilgiler</h3>
        <div className="mt-3">
          <FactGrid>
            <FactRow label="Yatırım" value={listing.investment.requested} />
            <FactRow label="Hisse" value={listing.investment.equity} />
            <FactRow label="Aşama" value={listing.investment.stage} />
            <FactRow label="Sektör" value={listing.investment.industry} />
          </FactGrid>
        </div>
      </DetailCard>

      {/* Tags */}
      <DetailCard padding="sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Etiketler</h3>
        <div className="flex flex-wrap gap-1.5">
          {listing.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-lg border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground dark:border-white/10 dark:bg-white/5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </DetailCard>

      {/* Publisher */}
      <DetailCard>
        <h3 className="text-sm font-semibold text-foreground">Yayınlayan</h3>
        <div className="mt-4 flex items-start gap-3">
          {listing.publisher.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.publisher.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <Avatar className="h-11 w-11">
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{ backgroundColor: listing.category.accent }}
              >
                {listing.publisher.initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground">
                {listing.publisher.name}
              </p>
              {listing.publisher.verified && listing.publisher.trust && (
                <VerifiedBadgeGroup
                  user={listing.publisher.trust.user}
                  company={listing.publisher.trust.company}
                  investor={listing.publisher.trust.investor}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{listing.publisher.subtitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {listing.publisher.type === 'company' ? 'Şirket ilanı' : 'Kişisel ilan'}
            </p>
          </div>
        </div>
        {listing.publisher.href !== '#' && (
          <Button
            asChild
            variant="outline"
            className="mt-4 w-full rounded-xl border-border/80 text-sm dark:border-white/10"
          >
            <Link href={listing.publisher.href}>
              {listing.publisher.type === 'company' ? 'Şirket Profili' : 'Profili Gör'}
            </Link>
          </Button>
        )}
      </DetailCard>

      {/* Recent activity */}
      <DetailCard padding="sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Son Aktivite
        </h3>
        {listing.activity.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">Henüz aktivite yok.</p>
        ) : (
          <ul className="space-y-0">
            {listing.activity.map((item, i) => (
              <li key={item.id}>
                <div className="flex items-center justify-between gap-2 py-2.5">
                  <p className="text-xs text-foreground">{item.text}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{item.time}</span>
                </div>
                {i < listing.activity.length - 1 && (
                  <Separator className="bg-muted dark:bg-white/10" />
                )}
              </li>
            ))}
          </ul>
        )}
      </DetailCard>

      {/* Contact */}
      {listing.listingId && listing.ownerUserId ? (
        <StartConversationButton
          listingId={listing.listingId}
          ownerUserId={listing.ownerUserId}
          fullWidth
        />
      ) : (
        <Button
          size="lg"
          disabled
          className="h-12 w-full rounded-xl bg-primary text-sm font-medium text-white opacity-50 dark:bg-white dark:text-primary-foreground"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          İletişime Geç
        </Button>
      )}
      <p className="text-center text-[11px] text-muted-foreground">
        Tüm iletişim ücretsiz
      </p>
    </aside>
  );
}
