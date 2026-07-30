import { ids } from '@/lib/domain/ids';
import { mockUuid, resetMockCounter, pickIndustry } from '@/lib/domain/mock-utils';
import { createReport, createActivity, createSubscription } from '@/features/shared/factories/moderation.factory';
import type { Report } from '@/features/shared/types/report.types';
import type { Activity, ActivityVerb } from '@/features/shared/types/activity.types';
import type { Subscription } from '@/features/shared/types/subscription.types';
import type { UserId } from '@/lib/domain/ids';

const ACTIVITY_VERBS: ActivityVerb[] = [
  'listing.published', 'application.submitted', 'user.registered', 'company.created', 'favorite.added',
];

export function generateMockReport(index = 1, reporterId?: UserId): Report {
  const reasons = ['spam', 'fraud', 'misleading', 'inappropriate'] as const;
  return createReport({
    id: ids.report(mockUuid('i0000001')),
    reporterId: reporterId ?? ids.user(mockUuid('a0000001')),
    entityType: 'listing',
    entityId: ids.listing(mockUuid('d0000001')),
    reason: reasons[index % reasons.length],
    description: `Rapor açıklaması ${index}`,
    status: index % 3 === 0 ? 'resolved' : 'submitted',
  });
}

export function generateMockActivity(index = 1, actorId?: UserId): Activity {
  const verb = ACTIVITY_VERBS[index % ACTIVITY_VERBS.length];
  const summaries: Record<ActivityVerb, string> = {
    'listing.created': 'Yeni ilan oluşturuldu',
    'listing.published': `${pickIndustry(index)} ilanı yayınlandı`,
    'listing.viewed': 'İlan görüntülendi',
    'application.submitted': 'Yeni başvuru alındı',
    'application.accepted': 'Başvuru kabul edildi',
    'message.sent': 'Yeni mesaj gönderildi',
    'user.registered': 'Yeni kullanıcı kaydoldu',
    'user.verified': 'Kullanıcı doğrulandı',
    'company.created': 'Yeni şirket profili oluşturuldu',
    'favorite.added': 'İlan favorilere eklendi',
    'match.created': 'Yeni eşleşme önerildi',
  };
  return createActivity({
    id: ids.activity(mockUuid('j0000001')),
    actorId: actorId ?? ids.user(mockUuid('a0000001')),
    verb,
    entityType: verb.startsWith('listing') ? 'listing' : verb.startsWith('application') ? 'application' : 'user',
    entityId: ids.listing(mockUuid('d0000001')),
    summary: summaries[verb],
    isPublic: true,
  });
}

export function generateMockSubscription(userId?: UserId): Subscription {
  return createSubscription({
    id: ids.subscription(mockUuid('k0000001')),
    userId: userId ?? ids.user(mockUuid('a0000001')),
    plan: 'free',
    status: 'active',
  });
}

export function generateMockActivities(count: number): Activity[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockActivity(i + 1));
}

export function generateMockReports(count: number): Report[] {
  resetMockCounter();
  return Array.from({ length: count }, (_, i) => generateMockReport(i + 1));
}
