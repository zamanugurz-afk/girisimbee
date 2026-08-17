import type { Metadata } from 'next';
import {
  buildCategoryMetadata,
  CategoryMarketplacePage,
} from '@/features/listings/components/category-marketplace-page';
import {
  DIGITAL_AI_BROWSE_DESCRIPTION,
  DIGITAL_AI_BROWSE_EYEBROW,
  DIGITAL_AI_BROWSE_TITLE,
  DIGITAL_AI_EMPTY_BACK_CTA,
  DIGITAL_AI_EMPTY_DESCRIPTION,
  DIGITAL_AI_EMPTY_TITLE,
  DIGITAL_AI_RESULT_NOUN,
} from '@/features/listings/presentation/digital-ai-copy';

const CATEGORY_SLUG = 'dijital-ai';

export const metadata: Metadata = buildCategoryMetadata(CATEGORY_SLUG);

export default function DijitalAiBrowsePage() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <CategoryMarketplacePage
        categorySlug={CATEGORY_SLUG}
        eyebrow={DIGITAL_AI_BROWSE_EYEBROW}
        title={DIGITAL_AI_BROWSE_TITLE}
        description={DIGITAL_AI_BROWSE_DESCRIPTION}
        emptyTitle={DIGITAL_AI_EMPTY_TITLE}
        emptyDescription={DIGITAL_AI_EMPTY_DESCRIPTION}
        emptyCta={DIGITAL_AI_EMPTY_BACK_CTA}
        relatedCategorySlugs={[]}
        resultNoun={DIGITAL_AI_RESULT_NOUN}
      />
    </div>
  );
}
