import Link from 'next/link';
import { Mail, MapPin, Phone, Globe, MessageCircle } from 'lucide-react';
import {
  DetailCard,
  DetailSection,
  FactGrid,
  FactRow,
  DetailSectionIf,
} from '@/components/girisimco/listing/detail-primitives';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import { hasExternalContact } from '@/features/shared/lib/external-contact';
import {
  formatMoney,
  formatSupportFlags,
} from '@/features/franchise/lib/franchise-listing.mapper';
import type { FranchiseListingDetailViewModel } from '@/features/franchise/types/franchise-listing.types';
import { toDisplayValue } from '@/features/listings/utils/display-value';
import { Button } from '@/components/ui/button';

interface ExternalContactPanelProps {
  contact: ExternalContactInfo;
}

export function ExternalContactPanel({ contact }: ExternalContactPanelProps) {
  if (!hasExternalContact(contact)) {
    return (
      <DetailCard>
        <p className="text-sm text-muted-foreground">İletişim bilgisi paylaşılmamış.</p>
      </DetailCard>
    );
  }

  const whatsappHref = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <DetailCard>
      <h3 className="text-sm font-semibold text-foreground">İletişim</h3>
      <div className="mt-4 space-y-2">
        {contact.phone && (
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <a href={`tel:${contact.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              {contact.phone}
            </a>
          </Button>
        )}
        {whatsappHref && (
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        )}
        {contact.email && (
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <a href={`mailto:${contact.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              {contact.email}
            </a>
          </Button>
        )}
        {contact.website && (
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <a
              href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="mr-2 h-4 w-4" />
              Web sitesi
            </a>
          </Button>
        )}
      </div>
    </DetailCard>
  );
}

interface FranchiseListingDetailViewProps {
  data: FranchiseListingDetailViewModel;
  backHref: string;
  backLabel: string;
}

export function FranchiseListingDetailView({ data, backHref, backLabel }: FranchiseListingDetailViewProps) {
  const { listing, flow, details } = data;
  const contact = {
    phone: listing.contactPhone,
    whatsapp: listing.contactWhatsapp,
    email: listing.contactEmail,
    website: listing.contactWebsite,
  };

  const locationParts = [listing.city, listing.district].filter((part) => toDisplayValue(part));
  const location = locationParts.join(', ');
  const publishedAt = listing.publishedAt
    ? new Date(listing.publishedAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const investmentRange =
    flow === 'buy' && (details.minimumYatirim != null || details.maksimumYatirim != null)
      ? [formatMoney(details.minimumYatirim), formatMoney(details.maksimumYatirim)]
          .filter(Boolean)
          .join(' – ')
      : '';

  return (
    <div className="gc-header-offset">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">
          ← {backLabel}
        </Link>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {flow === 'buy' ? 'Bayilik Arayışı' : 'Franchise Fırsatı'}
          </p>
          <h1 className="gc-page-heading mt-1 text-gc-xl">{listing.title}</h1>
          {location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          )}
          {publishedAt && (
            <p className="mt-1 text-xs text-muted-foreground">Yayın: {publishedAt}</p>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <DetailCard>
              <DetailSection title="Açıklama">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {listing.longDescription || listing.shortDescription}
                </p>
              </DetailSection>
            </DetailCard>

            <DetailCard>
              <DetailSection title="Detaylar">
                <FactGrid>
                  <FactRow label="Sektör" value={toDisplayValue(listing.industry)} />
                  {flow === 'buy' && (
                    <>
                      <FactRow label="Yatırım Aralığı" value={investmentRange} />
                      <FactRow
                        label="Tercih Edilen Lokasyon"
                        value={toDisplayValue(details.tercihEdilenLokasyon)}
                      />
                    </>
                  )}
                  {flow === 'give' && (
                    <>
                      <FactRow label="Franchise Bedeli" value={formatMoney(details.franchiseBedeli)} />
                      <FactRow label="Minimum Sermaye" value={formatMoney(details.minimumSermaye)} />
                      <FactRow
                        label="Tahmini Aylık Ciro"
                        value={formatMoney(details.tahminiAylikCiro)}
                      />
                    </>
                  )}
                </FactGrid>
              </DetailSection>
            </DetailCard>

            <DetailSectionIf
              title="Destek Seçenekleri"
              visible={flow === 'give' && Boolean(formatSupportFlags(details))}
            >
              <DetailCard>
                <p className="text-sm text-foreground">{formatSupportFlags(details)}</p>
              </DetailCard>
            </DetailSectionIf>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <ExternalContactPanel contact={contact} />
          </aside>
        </div>
      </div>
    </div>
  );
}
