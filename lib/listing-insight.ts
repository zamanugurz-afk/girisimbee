import type { DealInsight, Listing } from '@/types';

/** Build a deal insight from real listing data — no mock/random generation. */
export function buildListingInsight(listing: Listing): DealInsight {
  const shouldBuy = listing.dealScore === 'excellent' || listing.dealScore === 'good';
  const reasons: string[] = [];

  if (listing.priceVsMarketPct <= -8) {
    reasons.push(`Price is ${Math.abs(listing.priceVsMarketPct).toFixed(1)}% below the market median.`);
  } else if (listing.priceVsMarketPct <= -3) {
    reasons.push('Price is slightly below the current market median.');
  } else if (listing.priceVsMarketPct >= 8) {
    reasons.push('Price is above the current market median.');
  }

  if (listing.seller.verified) {
    reasons.push('Seller has verified contact details.');
  }

  if (listing.seller.rating >= 4.5) {
    reasons.push(`Seller rating is ${listing.seller.rating.toFixed(1)}/5.`);
  }

  if (listing.dealScore === 'risky' || listing.flagged) {
    reasons.push('Listing flagged for elevated risk — verify before buying.');
  }

  if (listing.condition === 'new' || listing.condition === 'like-new') {
    reasons.push('Condition appears better than average for this category.');
  }

  const confidence =
    listing.dealScore === 'excellent'
      ? 88
      : listing.dealScore === 'good'
        ? 76
        : listing.dealScore === 'fair'
          ? 62
          : listing.dealScore === 'overpriced'
            ? 55
            : 42;

  const fakeProbability =
    listing.dealScore === 'risky' || listing.flagged
      ? Math.min(65, 35 + Math.abs(listing.priceVsMarketPct))
      : Math.max(5, Math.round(Math.abs(listing.priceVsMarketPct) / 4));

  return {
    listingId: listing.id,
    shouldBuy,
    confidence,
    reasons: reasons.length > 0 ? reasons : ['Review price, seller, and listing details before buying.'],
    suggestedOfferTry: shouldBuy
      ? undefined
      : Math.max(100, Math.round(listing.priceTry * 0.92)),
    betterListings: [],
    fakeProbability,
  };
}
