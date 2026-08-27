import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';
import {
  DetailCard,
  DetailSection,
  FactGrid,
  FactRow,
  DetailSectionIf,
} from '@/components/girisimco/listing/detail-primitives';
import {
  formatMoney,
  formatPercentage,
  formatSupportFlags,
  formatBoolean,
} from '@/features/franchise/lib/franchise-listing.mapper';
import type { FranchiseListingDetailViewModel } from '@/features/franchise/types/franchise-listing.types';
import { toDisplayValue } from '@/features/listings/utils/display-value';
import { ListingContactCta } from '@/features/contact-requests/components/listing-contact-cta';
import { ListingRichText } from '@/components/girisimco/listing/listing-rich-text';
import {
  FRANCHISE_CONTACT_CTA,
  FRANCHISE_DETAIL_BACK_LABEL,
  FRANCHISE_DETAIL_EYEBROW,
} from '@/features/franchise/presentation/franchise-copy';
import { ListingFranchiseRecommendations } from '@/features/franchise-matching/presentation/listing-franchise-recommendations';

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
  backLabel?: string;
}

export function FranchiseListingDetailView({
  data,
  backHref,
  backLabel = FRANCHISE_DETAIL_BACK_LABEL,
}: FranchiseListingDetailViewProps) {
  const { listing, flow, details } = data;

  const locationParts = [listing.city, listing.district ?? details.districts].filter((part) => toDisplayValue(part));
  const location = locationParts.join(', ');

  const investmentRange =
    flow === 'buy' && (details.minimumYatirim != null || details.maksimumYatirim != null)
      ? [formatMoney(details.minimumYatirim), formatMoney(details.maksimumYatirim)]
          .filter(Boolean)
          .join(' – ')
      : '';

  const availableCities = details.availableCities?.join(', ') ?? '';
  const coverImage = details.coverImageUrl ?? details.brandLogoUrl;
  const description = listing.longDescription || listing.shortDescription || '';

  return (
    <div className="gc-header-offset min-w-0 overflow-x-hidden">
      <div className="mx-auto min-w-0 max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">
          ← {backLabel}
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <header className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {FRANCHISE_DETAIL_EYEBROW}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {listing.title}
              </h1>
              {location && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {location}
                </p>
              )}
            </header>

            {coverImage && (
              <div className="overflow-hidden rounded-xl border border-border/80 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={listing.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}

            {description && (
              <DetailCard>
                <DetailSection title="Açıklama">
                  <ListingRichText content={description} />
                </DetailSection>
              </DetailCard>
            )}

            {flow === 'give' && (
              <>
                <DetailCard>
                  <DetailSection title="Finansal Bilgiler">
                    <FactGrid>
                      <FactRow label="Toplam Yatırım" value={formatMoney(details.totalInvestment)} />
                      <FactRow label="Min. Sermaye" value={formatMoney(details.minCapitalRequirement)} />
                      <FactRow label="İsim Hakkı Bedeli" value={formatMoney(details.franchiseFee)} />
                      <FactRow label="Giriş Bedeli" value={formatMoney(details.entryFee)} />
                      <FactRow label="Kâr Marjı" value={formatPercentage(details.profitMargin)} />
                      <FactRow label="Royalty (Ciro Payı)" value={formatPercentage(details.royaltyFee)} />
                      <FactRow label="Reklam Katkı Payı" value={formatPercentage(details.advertisingFee)} />
                      <FactRow label="Yatırımın Geri Dönüşü" value={toDisplayValue(details.returnPeriod)} />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailCard>
                  <DetailSection title="Operasyonel Bilgiler">
                    <FactGrid>
                      <FactRow label="Kuruluş Yılı" value={toDisplayValue(details.establishmentYear)} />
                      <FactRow label="Şube Sayısı" value={toDisplayValue(details.branchCount)} />
                      <FactRow label="Franchise Modeli" value={toDisplayValue(details.franchiseModel || details.businessCategory)} />
                      {details.originCountry && <FactRow label="Menşei Ülke" value={toDisplayValue(details.originCountry)} />}
                      {details.averageSetupDuration && <FactRow label="Ortalama Kurulum" value={toDisplayValue(details.averageSetupDuration)} />}
                      {details.workingHours && <FactRow label="Çalışma Saatleri" value={toDisplayValue(details.workingHours)} />}
                      <FactRow
                        label="Sunulan Destekler"
                        value={formatSupportFlags(details)}
                      />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailCard>
                  <DetailSection title="Hukuki & Kurumsal Güvence">
                    <FactGrid>
                      <FactRow label="Marka Tescil Durumu" value={toDisplayValue(details.trademarkStatus)} />
                      <FactRow label="Sözleşme & Ön Bilgilendirme" value={toDisplayValue(details.contractProvided)} />
                      <FactRow label="İşletme El Kitabı & Know-How" value={toDisplayValue(details.operatingManualProvided)} />
                      <FactRow
                        label="Bölge Koruması"
                        value={
                          details.exclusiveTerritory != null
                            ? formatBoolean(details.exclusiveTerritory, 'Var (Münhasır Bölge)', 'Yok / Lokasyona Göre')
                            : '—'
                        }
                      />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailCard>
                  <DetailSection title="Lokasyon ve Mağaza Şartları">
                    <FactGrid>
                      <FactRow label="Uygun Şehirler" value={availableCities || 'Tüm Türkiye'} />
                      {details.districts && <FactRow label="İlçeler" value={toDisplayValue(details.districts)} />}
                      <FactRow
                        label="Uygun Mağaza Tipi"
                        value={toDisplayValue(details.storeLocationType || details.storeSize)}
                      />
                      <FactRow
                        label="Min. Alan"
                        value={details.minSquareMeters ? `${details.minSquareMeters} m²` : '—'}
                      />
                    </FactGrid>
                  </DetailSection>
                </DetailCard>

                <DetailCard>
                  <DetailSection title="Aday Şartları">
                    <FactGrid>
                      <FactRow label="Deneyim Şartı" value={toDisplayValue(details.experienceRequirement)} />
                      <FactRow label="Eğitim Şartı" value={toDisplayValue(details.educationRequirement)} />
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
            <ListingContactCta
              listingId={String(listing.id)}
              listingTitle={listing.title}
              categoryId="franchise"
              buttonLabel={FRANCHISE_CONTACT_CTA}
              identityGated
            />
          </aside>
        </div>

        <ListingFranchiseRecommendations listingId={String(listing.id)} />
      </div>
    </div>
  );
}
