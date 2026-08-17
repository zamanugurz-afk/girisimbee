import type { Metadata } from 'next';
import { VenturePartnershipLanding } from '@/components/girisimco/home/venture-partnership-landing';
import { VENTURE_PARTNERSHIP_HUB } from '@/components/girisimco/home/home-marketplace.data';

export const metadata: Metadata = {
  title: `${VENTURE_PARTNERSHIP_HUB.title} | Girisimbee`,
  description: VENTURE_PARTNERSHIP_HUB.description,
};

export default function VenturePartnershipPage() {
  return <VenturePartnershipLanding />;
}
