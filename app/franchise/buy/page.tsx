import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';
import {
  FRANCHISE_BROWSE_DESCRIPTION,
  FRANCHISE_BROWSE_TITLE,
  FRANCHISE_EMPTY_DESCRIPTION,
  FRANCHISE_EMPTY_TITLE,
} from '@/features/franchise/presentation/franchise-copy';

const CATEGORY_SLUG = 'bayilik-al';

export const metadata: Metadata = {
  ...buildCategoryMetadata(CATEGORY_SLUG),
  title: 'Franchise Fırsatları | Girisimbee',
  description: FRANCHISE_BROWSE_DESCRIPTION,
};

export default function FranchiseBuyPage() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <CategoryMarketplacePage
        categorySlug={CATEGORY_SLUG}
        title={FRANCHISE_BROWSE_TITLE}
        description={FRANCHISE_BROWSE_DESCRIPTION}
        emptyTitle={FRANCHISE_EMPTY_TITLE}
        emptyDescription={FRANCHISE_EMPTY_DESCRIPTION}
        emptyCta={{ label: 'Tüm İlanları Keşfet', href: '/kesfet' }}
        relatedCategorySlugs={['isletme-devri', 'ortak-bul']}
        resultNoun="fırsat"
      />
    </div>
  );
}
