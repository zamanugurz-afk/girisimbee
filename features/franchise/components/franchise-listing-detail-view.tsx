import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import {
  DetailCard,
  DetailSection,
  FactGrid,
  FactRow,
  DetailSectionIf,
} from '@/components/girisimco/listing/detail-primitives';
import type { ExternalContactInfo } from '@/lib/domain/marketplace-enums';
import {
  formatMoney,
  formatPercentage,
  formatSupportFlags,
  formatBoolean,
} from '@/features/franchise/lib/franchise-listing.mapper';
import type { FranchiseListingDetailViewModel } from '@/features/franchise/types/franchise-listing.types';
import { toDisplayValue } from '@/features/listings/utils/display-value';
import { ListingCallButton } from '@/components/girisimco/listing/listing-call-button';

interface ExternalContactPanelProps {
  contact: ExternalContactInfo;
}

/** V1: phone-only contact on franchise detail. */
export function ExternalContactPanel({ contact }: ExternalContactPanelProps) {
  const phone = contact.phone?.trim() || null;

  return (
    <DetailCard>
      <h3 className="text-sm font-semibold text-foreground">İletişim</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        İlan sahiplerine yalnızca telefon ile ulaşabilirsiniz.
      </p>
      <div className="mt-4">
        <ListingCallButton phone={phone} fullWidth />
      </div>
    </DetailCard>
  );
}

function MediaLink({ href, label }: { href: string; label: string }) {
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
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
    website: listing.contactWebsite ?? details.website ?? null,
  };

  const locationParts = [listing.city, listing.district ?? details.districts].filter((part) => toDisplayValue(part));
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

  const availableCities = details.availableCities?.join(', ') ?? '';
  const coverImage = details.coverImageUrl ?? details.brandLogoUrl;

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
          {details.companyName && (
            <p className="mt-1 text-sm text-muted-foreground">{details.companyName}</p>
          )}
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

        {coverImage && (
          <div className="mt-8 overflow-hidden rounded-xl border border-border/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={listing.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <DetailCard>
              <DetailSection title="Açıklama">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {listing.longDescription || listing.shortDescription}
                </p>
              </DetailSection>
            </DetailCard>

            {flow === 'give' && (
              <>
                <DetailCard>
                  <DetailSection title="Marka Bilgileri">
                    <FactGrid>
                      <FactRow label="Şirket" value={toDisplayValue(details.companyName)} />
                      <FactRow label="Kuruluş Yılı" value={toDisplayValue(details.establishmentYear)} />
                      <FactRow label="Sektör" value={toDisplayValue(listing.industry)} />
                      <FactRow label="Şube Sayısı" value={toDisplayValue(details.branchCount)} />
                      <FactRow label="Web Sitesi" value={toDisplayValue(details.website ?? listing.contactWebsite)} />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailCard>
                  <DetailSection title="Yatırım Bilgileri">
                    <FactGrid>
                      <FactRow label="Toplam Yatırım Bütçesi" value={formatMoney(details.totalInvestment)} />
                      <FactRow label="İsim Hakkı Bedeli" value={formatMoney(details.franchiseFee)} />
                      <FactRow label="Kar Marjı" value={formatPercentage(details.profitMargin)} />
                      <FactRow label="Cirodan Alınan Pay" value={formatPercentage(details.royaltyFee)} />
                      <FactRow label="Yatırımın Geri Dönüş Süresi" value={toDisplayValue(details.returnPeriod)} />
                      <FactRow label="Ortalama Kurulum Süresi" value={toDisplayValue(details.averageSetupDuration)} />
                      <FactRow
                        label="Minimum M²"
                        value={details.minSquareMeters != null ? `${details.minSquareMeters} m²` : ''}
                      />
                      <FactRow label="Minimum Sermaye" value={formatMoney(details.minCapitalRequirement)} />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailCard>
                  <DetailSection title="Lokasyon">
                    <FactGrid>
                      <FactRow label="Uygun Şehirler" value={availableCities} />
                      <FactRow label="İlçeler" value={toDisplayValue(details.districts)} />
                      <FactRow label="Min. Nüfus" value={toDisplayValue(details.minPopulation)} />
                      <FactRow label="Mağaza Büyüklüğü" value={toDisplayValue(details.storeSize)} />
                      <FactRow label="AVM" value={formatBoolean(details.mallAvailable)} />
                      <FactRow label="Cadde Mağazası" value={formatBoolean(details.streetStoreAvailable)} />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailCard>
                  <DetailSection title="İş Modeli">
                    <FactGrid>
                      <FactRow label="Kategori" value={toDisplayValue(details.businessCategory)} />
                      <FactRow label="Çalışan Sayısı" value={toDisplayValue(details.employeeCount)} />
                      <FactRow label="Günlük Kapasite" value={toDisplayValue(details.dailyCustomerCapacity)} />
                      <FactRow label="Çalışma Saatleri" value={toDisplayValue(details.workingHours)} />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailSectionIf title="Destek Seçenekleri" visible={Boolean(formatSupportFlags(details))}>
                  <DetailCard>
                    <p className="text-sm text-foreground">{formatSupportFlags(details)}</p>
                  </DetailCard>
                </DetailSectionIf>

                <DetailCard>
                  <DetailSection title="Franchise Gereksinimleri">
                    <FactGrid>
                      <FactRow label="Deneyim" value={toDisplayValue(details.experienceRequirement)} />
                      <FactRow label="Eğitim" value={toDisplayValue(details.educationRequirement)} />
                      <FactRow
                        label="Şirket Kuruluşu"
                        value={formatBoolean(details.companyEstablishmentRequired, 'Gerekli', 'Gerekmez')}
                      />
                      <FactRow label="Teminat" value={toDisplayValue(details.guaranteeRequirement)} />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailSectionIf
                  title="Medya ve Belgeler"
                  visible={Boolean(
                    details.introductionVideoUrl
                    || details.presentationPdfUrl
                    || details.sampleContractUrl
                    || (details.branchPhotoUrls && details.branchPhotoUrls.length > 0),
                  )}
                >
                  <DetailCard>
                    <div className="space-y-3">
                      {details.introductionVideoUrl && (
                        <MediaLink href={details.introductionVideoUrl} label="Tanıtım videosu" />
                      )}
                      {details.presentationPdfUrl && (
                        <MediaLink href={details.presentationPdfUrl} label="Franchise sunumu (PDF)" />
                      )}
                      {details.sampleContractUrl && (
                        <MediaLink href={details.sampleContractUrl} label="Örnek sözleşme" />
                      )}
                      {details.branchPhotoUrls && details.branchPhotoUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3">
                          {details.branchPhotoUrls.map((url) => (
                            <div key={url} className="overflow-hidden rounded-lg border border-border/80">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="Şube görseli" className="aspect-[4/3] w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DetailCard>
                </DetailSectionIf>
              </>
            )}

            {flow === 'buy' && (
              <DetailCard>
                <DetailSection title="Detaylar">
                  <FactGrid>
                    <FactRow label="Sektör" value={toDisplayValue(listing.industry)} />
                    <FactRow label="Yatırım Aralığı" value={investmentRange} />
                    <FactRow
                      label="Tercih Edilen Lokasyon"
                      value={toDisplayValue(details.tercihEdilenLokasyon)}
                    />
                  </FactGrid>
                </DetailSection>
              </DetailCard>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <ExternalContactPanel contact={contact} />
          </aside>
        </div>
      </div>
    </div>
  );
}
