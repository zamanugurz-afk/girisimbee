import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';

const CATEGORY_SLUG = 'isletme-devri';

export const metadata: Metadata = buildCategoryMetadata(CATEGORY_SLUG);

export default function IsletmeDevriBrowsePage() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <CategoryMarketplacePage
        categorySlug={CATEGORY_SLUG}
        eyebrow="Ortaklık ve Devir"
        title="İşletme Devri İlanları"
        description="Kafe, restoran, mağaza, e-ticaret ve faal şirket devir fırsatlarını keşfedin."
        emptyTitle="Henüz işletme devri ilanı bulunmuyor"
        emptyDescription="Kriterlerinize uygun yeni işletme devir fırsatları yayınlandığında burada listelenecektir."
        emptyCta={{ label: 'Tüm İlanları Keşfet', href: '/kesfet' }}
        relatedCategorySlugs={['franchise', 'ortak-bul']}
        resultNoun="işletme"
      />
    </div>
  );
}
