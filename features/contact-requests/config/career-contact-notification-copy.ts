import type { CareerListingKind } from '@/features/matching-engine/types';

/** Career-only notification copy. Other listing types keep the generic titles. */
export const CAREER_CONTACT_NOTIFICATION = {
  created: {
    title: 'Yeni bir iletişim talebiniz var.',
    body: (requesterName: string, listingTitle: string) =>
      `${requesterName}, “${listingTitle}” için iletişim talebi gönderdi.`,
  },
  accepted: {
    title: 'İletişim talebi kabul edildi.',
    body: 'İletişim talebiniz kabul edildi. Mesajlaşabilir; izin verilen iletişim bilgileri yalnızca size açıldı.',
  },
  rejected: {
    title: 'İletişim talebi reddedildi.',
    body: 'İletişim talebiniz reddedildi.',
  },
} as const;

export function careerContactNotificationCopy(kind: CareerListingKind | null) {
  return kind ? CAREER_CONTACT_NOTIFICATION : null;
}
