import type { AdminDashboardStats } from '@/features/admin/services/admin.service.interface';
import type { AdminUserView } from '@/features/admin/services/admin.service.interface';
import type { Listing } from '@/features/listings/types/listing.entity.types';
import type {
  AdminMockListing,
  AdminMockUser,
  AdminListingStatus,
  AdminUserRole,
  AdminUserStatus,
} from '@/features/admin/panel/types/admin-panel.types';
import type { AdminOverviewSnapshot } from '@/features/admin/panel/types/admin-overview.types';
import { resolveListingCardDisplay } from '@/features/listings/utils/listing-card-display';

function formatCount(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

function formatCurrencyFromCents(cents: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function mapUserStatus(status: string): AdminUserStatus {
  if (status === 'suspended' || status === 'deactivated') return 'suspended';
  if (status === 'deleted') return 'deleted';
  return 'active';
}

export function mapUserRole(role: string): AdminUserRole {
  if (role === 'super_admin') return 'super_admin';
  if (role === 'admin') return 'admin';
  return 'user';
}

export function mapAdminUserView(row: AdminUserView): AdminMockUser {
  const email = row.user.email || row.profile?.email || '';
  return {
    id: row.user.id,
    full_name: row.displayName || row.profile?.displayName || email.split('@')[0] || 'Kullanıcı',
    username: row.profile?.username || email.split('@')[0] || '—',
    email,
    role: mapUserRole(row.user.role),
    status: mapUserStatus(row.user.status),
    created_at: row.user.createdAt,
    last_login_at: row.user.lastLoginAt,
  };
}

export function mapListingStatus(status: Listing['status']): AdminListingStatus {
  switch (status) {
    case 'published':
      return 'active';
    case 'pending_review':
      return 'pending';
    case 'draft':
      return 'draft';
    case 'paused':
    case 'rejected':
      return 'suspended';
    case 'archived':
    case 'expired':
    case 'sold':
    case 'deleted':
      return 'deleted';
    default:
      return 'draft';
  }
}

export function mapListingToAdminRow(listing: Listing): AdminMockListing {
  const display = resolveListingCardDisplay(listing);
  return {
    id: listing.id,
    title: listing.title,
    category: display.groupLabel,
    owner: listing.ownerId,
    status: mapListingStatus(listing.status),
    view_count: listing.viewCount ?? 0,
    favorite_count: listing.interestedCount ?? 0,
    created_at: listing.createdAt,
    updated_at: listing.updatedAt,
    is_featured: Boolean(listing.isFeatured),
    is_urgent: Boolean(listing.isUrgent),
  };
}

/** Build overview cards from live dashboard stats. */
export function snapshotFromDashboardStats(
  stats: AdminDashboardStats,
): Pick<AdminOverviewSnapshot, 'cards'> {
  return {
    cards: [
      {
        id: 'total_users',
        label: 'Toplam kullanıcı sayısı',
        value: formatCount(stats.totalUsers),
        hint: `Aktif: ${formatCount(stats.activeUsers)}`,
        accent: 'text-sky-600 dark:text-sky-400',
      },
      {
        id: 'total_listings',
        label: 'Toplam ilan sayısı',
        value: formatCount(stats.totalListings),
        hint: `Taslak: ${formatCount(stats.draftListings)}`,
        accent: 'text-violet-600 dark:text-violet-400',
      },
      {
        id: 'pending_verifications',
        label: 'Başvurular',
        value: formatCount(stats.totalApplications),
        hint: 'Toplam başvuru',
        accent: 'text-amber-600 dark:text-amber-400',
      },
      {
        id: 'daily_revenue',
        label: 'Toplam gelir',
        value: formatCurrencyFromCents(stats.revenueCents),
        hint: 'Başarılı ödemeler',
        accent: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        id: 'active_listings',
        label: 'Aktif ilanlar',
        value: formatCount(stats.publishedListings),
        hint: 'Yayında',
        accent: 'text-green-600 dark:text-green-400',
      },
      {
        id: 'pending_complaints',
        label: 'Bugün aktif',
        value: formatCount(stats.activeToday),
        hint: `Ziyaretçi: ${formatCount(stats.dailyVisitors)}`,
        accent: 'text-rose-600 dark:text-rose-400',
      },
    ],
  };
}
