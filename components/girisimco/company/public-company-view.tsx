'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Building2,
  Globe,
  Linkedin,
  MapPin,
  Pencil,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react';
import { ContentCard as ListingCard } from '@/components/girisimco/content-card';
import { VerifiedBadge } from '@/components/girisimco/trust/verified-badge';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import { getCompanyService } from '@/lib/persistence/container';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { ListingCallButton } from '@/components/girisimco/listing/listing-call-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, formatNumber, initials } from '@/lib/utils';
import type { UserId } from '@/lib/domain/ids';
import { COMPANY_SIZE_OPTIONS } from '@/features/companies/validation/company-editor.schema';

interface PublicCompanyPageViewProps {
  data: PublicCompanyView;
}

export function PublicCompanyPageView({ data: initialData }: PublicCompanyPageViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [inviteUsername, setInviteUsername] = useState('');
  const [busy, setBusy] = useState(false);

  const { company } = data;
  const listingItems = listingsToContentItems(
    data.listings,
    new Map(
      data.listings.map((l) => [
        l.id,
        { user: false, investor: false, company: company.isVerified },
      ]),
    ),
  );
  const contactListing = data.listings.find((l) => l.status === 'published');
  const sizeLabel = COMPANY_SIZE_OPTIONS.find((o) => o.value === company.employeeCount)?.label;
  const location = [company.location, company.city, company.country === 'TR' ? 'Türkiye' : company.country]
    .filter(Boolean)
    .join(', ');

  async function toggleFollow() {
    if (!user) {
      toast.error('Takip etmek için giriş yapın');
      return;
    }
    setBusy(true);
    try {
      const service = getCompanyService();
      if (data.isFollowing) {
        await service.unfollow(company.id, user.id as UserId);
        setData((prev) => ({ ...prev, isFollowing: false, followersCount: prev.followersCount - 1 }));
      } else {
        await service.follow(company.id, user.id as UserId);
        setData((prev) => ({ ...prev, isFollowing: true, followersCount: prev.followersCount + 1 }));
      }
    } catch {
      toast.error('İşlem başarısız');
    } finally {
      setBusy(false);
    }
  }

  async function handleInvite() {
    if (!user || !inviteUsername.trim()) return;
    setBusy(true);
    try {
      await getCompanyService().inviteMember(company.id, user.id as UserId, inviteUsername.trim());
      toast.success('Üye davet edildi');
      setInviteUsername('');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Davet gönderilemedi');
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    if (!user) return;
    setBusy(true);
    try {
      await getCompanyService().leaveCompany(company.id, user.id as UserId);
      toast.success('Şirketten ayrıldınız');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!user || !window.confirm('Şirketi silmek istediğinize emin misiniz?')) return;
    setBusy(true);
    try {
      await getCompanyService().delete(company.id, user.id as UserId);
      toast.success('Şirket silindi');
      router.push('/dashboard');
    } catch {
      toast.error('Şirket silinemedi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pt-14">
        <div className="relative h-44 border-b border-border/80 bg-[#F1F5F9] dark:border-white/10 dark:bg-white/5 sm:h-56">
          {company.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-muted dark:border-primary dark:bg-white/10">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">{company.name}</h1>
                  {company.isVerified && <VerifiedBadge kind="company" size="md" />}
                </div>
                <p className="text-sm text-muted-foreground">@{company.slug}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.isOwner && (
                <>
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href={`/company/${company.slug}/dashboard`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Panel
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href={`/company/${company.slug}/settings`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Düzenle
                    </Link>
                  </Button>
                </>
              )}
              {!data.isOwner && user && (
                <Button variant="outline" className="rounded-lg" disabled={busy} onClick={toggleFollow}>
                  {data.isFollowing ? 'Takipten Çık' : 'Takip Et'}
                </Button>
              )}
              {!data.isOwner && contactListing && (
                <ListingCallButton
                  phone={contactListing.contactPhone}
                  className="rounded-lg"
                  label="Ara"
                />
              )}
              {data.isMember && !data.isOwner && (
                <Button variant="outline" className="rounded-lg" disabled={busy} onClick={handleLeave}>
                  Ayrıl
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {location && (
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{location}</span>
            )}
            {company.industry && <span>Sektör: {company.industry}</span>}
            {sizeLabel && <span>Büyüklük: {sizeLabel}</span>}
            {company.foundedYear && <span>Kuruluş: {company.foundedYear}</span>}
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <span><strong className="text-foreground">{formatNumber(data.listings.length)}</strong> ilan</span>
            <span><strong className="text-foreground">{formatNumber(data.followersCount)}</strong> takipçi</span>
            <span><strong className="text-foreground">{formatNumber(data.members.length)}</strong> ekip</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {company.websiteVerified && company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-sm dark:border-white/10">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
            {!company.websiteVerified && company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-sm dark:border-white/10">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
            {company.linkedInUrl && (
              <a href={company.linkedInUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-sm dark:border-white/10">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {company.twitterUrl && (
              <a href={company.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-sm dark:border-white/10">
                X
              </a>
            )}
            {company.emailVerified && company.contactEmail && (
              <span className="rounded-lg border border-border/80 px-3 py-1.5 text-sm text-muted-foreground dark:border-white/10">
                {company.contactEmail}
              </span>
            )}
          </div>

          {company.description && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hakkında</h2>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                {company.description}
              </p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="h-4 w-4" /> Ekip
            </h2>
            {data.members.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Henüz ekip üyesi yok.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.members.map(({ member, profile }) => (
                  <div key={member.id} className="rounded-xl border border-border/80 p-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold dark:bg-white/10">
                        {profile?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          initials(profile?.displayName ?? '?')
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {profile?.displayName ?? 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.role === 'owner' ? 'Sahip' : 'Üye'}</p>
                      </div>
                    </div>
                    {profile?.username && (
                      <Link href={`/profil/${profile.username}`} className="mt-2 block text-xs text-muted-foreground hover:underline">
                        @{profile.username}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            {data.isOwner && (
              <div className="mt-4 flex gap-2">
                <Input
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Kullanıcı adı ile davet et"
                  className="max-w-xs rounded-lg"
                />
                <Button type="button" variant="outline" className="rounded-lg" disabled={busy} onClick={handleInvite}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Davet Et
                </Button>
              </div>
            )}
          </section>

          <section className="mt-10 pb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Aktif İlanlar</h2>
            {listingItems.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border/80 px-6 py-12 text-center dark:border-white/10">
                <p className="text-sm text-muted-foreground">Henüz yayınlanmış ilan bulunmuyor.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listingItems.map((item) => (
                  <ListingCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {data.isOwner && (
            <div className="pb-16">
              <Button variant="destructive" className="rounded-lg" disabled={busy} onClick={handleDelete}>
                Şirketi Sil
              </Button>
            </div>
          )}
        </div>
    </div>
  );
}
