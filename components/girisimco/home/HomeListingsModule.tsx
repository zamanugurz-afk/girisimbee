'use client';

import {
  HOME_LISTING_SECTIONS,
  useHomeListingSections,
} from '@/features/home';
import { HomeListingSectionRow } from '@/components/girisimco/home/HomeListingSectionRow';

export function HomeListingsModule() {
  const { sections } = useHomeListingSections();

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-5 py-10 lg:px-8 lg:py-12">
      {HOME_LISTING_SECTIONS.map((config) => {
        const state = sections.find((section) => section.id === config.id);
        if (!state) return null;
        return <HomeListingSectionRow key={config.id} config={config} state={state} />;
      })}
    </div>
  );
}
