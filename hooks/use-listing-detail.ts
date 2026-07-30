'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFavorites } from '@/lib/queries';
import { buildPriceHistorySummary, loadListingDetail } from '@/lib/listing-detail-loader';
import type {
  ListingResponse,
  AIAnalysisResponse,
  MarketStatisticsResponse,
  SellerDTO,
  PriceHistoryDTO,
  FavoriteDTO,
} from '@/types';

export interface SimilarListing {
  listing: ListingResponse;
  analysis: AIAnalysisResponse | undefined;
  priceDiff: number;
  aiScore: number;
}

export interface ListingDetailData {
  listing: ListingResponse | null;
  analysis: AIAnalysisResponse | undefined;
  marketStats: MarketStatisticsResponse | undefined;
  seller: SellerDTO | undefined;
  priceHistory: PriceHistoryDTO[];
  isFavorite: boolean;
  favorite: FavoriteDTO | undefined;

  similarListings: SimilarListing[];
  betterAlternatives: SimilarListing[];

  marketComparison: {
    label: string;
    price: number;
    diff: number;
    diffPct: number;
  }[];

  priceHistorySummary: {
    lowestEver: number;
    highestEver: number;
    changeCount: number;
    currentTrend: 'up' | 'down' | 'stable';
    changePct: number;
  };

  negotiation: {
    suggestedOffer: number;
    maxRecommendedOffer: number;
    acceptProbability: number;
    expectedAcceptedPrice: number;
    difficulty: 'easy' | 'medium' | 'hard';
    firstMessage: string;
    secondMessage: string;
    cashOffer: number;
    pickupOffer: number;
    bundleOffer: number;
  };

  riskFlags: Array<{
    label: string;
    level: 'green' | 'yellow' | 'red';
    detail: string;
  }>;

  timeline: Array<{
    label: string;
    date: string;
    type: 'created' | 'price' | 'description' | 'seen' | 'status';
  }>;

  isLoading: boolean;
  isError: boolean;
}

function difficultyFor(score: number): 'easy' | 'medium' | 'hard' {
  if (score >= 70) return 'easy';
  if (score >= 40) return 'medium';
  return 'hard';
}

function formatTryLocal(value: number): string {
  return value.toLocaleString('tr-TR');
}

function emptyData(isLoading = false, isError = false): ListingDetailData {
  return {
    listing: null,
    analysis: undefined,
    marketStats: undefined,
    seller: undefined,
    priceHistory: [],
    isFavorite: false,
    favorite: undefined,
    similarListings: [],
    betterAlternatives: [],
    marketComparison: [],
    priceHistorySummary: {
      lowestEver: 0,
      highestEver: 0,
      changeCount: 0,
      currentTrend: 'stable',
      changePct: 0,
    },
    negotiation: {
      suggestedOffer: 0,
      maxRecommendedOffer: 0,
      acceptProbability: 0,
      expectedAcceptedPrice: 0,
      difficulty: 'medium',
      firstMessage: '',
      secondMessage: '',
      cashOffer: 0,
      pickupOffer: 0,
      bundleOffer: 0,
    },
    riskFlags: [],
    timeline: [],
    isLoading,
    isError,
  };
}

export function useListingDetail(listingId: string | null): ListingDetailData {
  const detailQ = useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: () => loadListingDetail(listingId!),
    enabled: !!listingId,
    staleTime: 60_000,
  });

  const favoritesQ = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    staleTime: 30_000,
  });

  return useMemo(() => {
    if (!listingId) return emptyData(false);

    if (detailQ.isLoading) return emptyData(true);
    if (detailQ.isError || !detailQ.data) {
      return emptyData(false, detailQ.isError);
    }

    const {
      listing,
      analysis,
      marketStats,
      seller,
      priceHistory,
      similarListings,
      betterAlternatives,
    } = detailQ.data;

    const favorites = favoritesQ.data ?? [];
    const favorite = favorites.find((f) => f.listing_id === listingId);

    const median = marketStats?.median_price ?? listing.price;
    const avg = marketStats?.average_price ?? listing.price;
    const marketComparison = [
      { label: 'Bu İlan', price: listing.price, diff: 0, diffPct: 0 },
      {
        label: 'Piyasa Ortalaması',
        price: Math.round(avg),
        diff: Math.round(listing.price - avg),
        diffPct:
          avg > 0 ? Math.round(((listing.price - avg) / avg) * 1000) / 10 : 0,
      },
      {
        label: 'Piyasa Medyanı',
        price: Math.round(median),
        diff: Math.round(listing.price - median),
        diffPct:
          median > 0 ? Math.round(((listing.price - median) / median) * 1000) / 10 : 0,
      },
      {
        label: 'En Ucuz İlan',
        price: marketStats?.minimum_price ?? listing.price,
        diff: Math.round(listing.price - (marketStats?.minimum_price ?? listing.price)),
        diffPct:
          marketStats && marketStats.minimum_price > 0
            ? Math.round(
                ((listing.price - marketStats.minimum_price) / marketStats.minimum_price) * 1000,
              ) / 10
            : 0,
      },
      {
        label: 'En Pahalı İlan',
        price: marketStats?.maximum_price ?? listing.price,
        diff: Math.round(listing.price - (marketStats?.maximum_price ?? listing.price)),
        diffPct:
          marketStats && marketStats.maximum_price > 0
            ? Math.round(
                ((listing.price - marketStats.maximum_price) / marketStats.maximum_price) * 1000,
              ) / 10
            : 0,
      },
    ];

    const priceHistorySummary = buildPriceHistorySummary(priceHistory, listing.price);

    const negScore = analysis?.negotiation_score ?? 50;
    const suggestedOffer = analysis?.suggested_offer ?? Math.round(listing.price * 0.93);
    const maxRecommendedOffer = Math.round(listing.price * (0.95 + (negScore / 100) * 0.04));
    const acceptProbability =
      analysis?.negotiation_probability ?? Math.min(95, Math.max(20, negScore + 10));
    const expectedAcceptedPrice =
      analysis?.expected_accepted_price ?? Math.round(suggestedOffer * 1.03);
    const difficulty = difficultyFor(negScore);

    const negotiation = {
      suggestedOffer,
      maxRecommendedOffer,
      acceptProbability,
      expectedAcceptedPrice,
      difficulty,
      firstMessage: `Merhaba, ${listing.product?.name ?? 'ürün'} ilanınızla ilgileniyorum. ${formatTryLocal(suggestedOffer)} TL nakit ödeme ile bugün teslim alabilir miyim?`,
      secondMessage: `Anlıyorum. ${formatTryLocal(Math.round(suggestedOffer * 1.02))} TL'ye çıkabilirim, yine de bugün teslim alıyorum. Kutusu ve aksesuarları tam mı?`,
      cashOffer: Math.round(suggestedOffer * 0.97),
      pickupOffer: Math.round(suggestedOffer * 0.98),
      bundleOffer: Math.round(suggestedOffer * 0.95),
    };

    return {
      listing,
      analysis,
      marketStats,
      seller,
      priceHistory,
      isFavorite: !!favorite,
      favorite,
      similarListings,
      betterAlternatives,
      marketComparison,
      priceHistorySummary,
      negotiation,
      riskFlags: buildRiskFlags(listing, analysis, seller, marketStats),
      timeline: buildTimeline(listing, priceHistory),
      isLoading: false,
      isError: false,
    };
  }, [listingId, detailQ.data, detailQ.isLoading, detailQ.isError, favoritesQ.data]);
}

function buildRiskFlags(
  listing: ListingResponse,
  analysis: AIAnalysisResponse | undefined,
  seller: SellerDTO | undefined,
  marketStats: MarketStatisticsResponse | undefined,
): Array<{ label: string; level: 'green' | 'yellow' | 'red'; detail: string }> {
  const flags: Array<{ label: string; level: 'green' | 'yellow' | 'red'; detail: string }> = [];

  const median = marketStats?.median_price ?? listing.price;
  const priceDiffPct = median > 0 ? ((listing.price - median) / median) * 100 : 0;

  if (priceDiffPct <= -15) {
    flags.push({
      label: 'Çok Düşük Fiyat',
      level: 'red',
      detail: `Piyasa medyanından %${Math.abs(priceDiffPct).toFixed(1)} ucuz — dikkatli olun`,
    });
  } else if (priceDiffPct <= -5) {
    flags.push({
      label: 'Düşük Fiyat',
      level: 'green',
      detail: `Piyasa medyanından %${Math.abs(priceDiffPct).toFixed(1)} ucuz — iyi fırsat`,
    });
  } else if (priceDiffPct > 10) {
    flags.push({
      label: 'Yüksek Fiyat',
      level: 'yellow',
      detail: `Piyasa medyanından %${priceDiffPct.toFixed(1)} pahalı`,
    });
  }

  const sellerAgeYears = seller?.member_since
    ? new Date().getFullYear() - seller.member_since
    : 0;
  if (sellerAgeYears < 1) {
    flags.push({
      label: 'Çok Yeni Satıcı',
      level: 'red',
      detail: 'Satıcı 1 yıldan kıdemsiz — güvenilirlik düşük',
    });
  } else if (sellerAgeYears < 2) {
    flags.push({
      label: 'Yeni Satıcı',
      level: 'yellow',
      detail: `${sellerAgeYears} yıllık satıcı — dikkatli olun`,
    });
  } else {
    flags.push({
      label: 'Tecrübeli Satıcı',
      level: 'green',
      detail: `${sellerAgeYears} yıllık üye — güvenilirlik yüksek`,
    });
  }

  const descLength = listing.description?.length ?? 0;
  if (descLength < 30) {
    flags.push({
      label: 'Zayıf Açıklama',
      level: 'yellow',
      detail: 'Açıklama çok kısa — detay eksik olabilir',
    });
  } else {
    flags.push({
      label: 'Yeterli Açıklama',
      level: 'green',
      detail: `${descLength} karakter — yeterli detay`,
    });
  }

  const imgCount = listing.image_urls.length;
  if (imgCount < 2) {
    flags.push({
      label: 'Az Fotoğraf',
      level: 'yellow',
      detail: `${imgCount} fotoğraf — daha fazla görsel isteyin`,
    });
  } else {
    flags.push({
      label: 'Yeterli Fotoğraf',
      level: 'green',
      detail: `${imgCount} fotoğraf mevcut`,
    });
  }

  if (analysis && analysis.fake_probability >= 40) {
    flags.push({
      label: 'Olası Dolandırıcılık',
      level: 'red',
      detail: `AI sahtekarlık olasılığı %${analysis.fake_probability} — riskli`,
    });
  } else if (analysis && analysis.fake_probability >= 20) {
    flags.push({
      label: 'Orta Risk',
      level: 'yellow',
      detail: `AI sahtekarlık olasılığı %${analysis.fake_probability}`,
    });
  } else {
    flags.push({
      label: 'Düşük Risk',
      level: 'green',
      detail: 'AI risk analizi temiz',
    });
  }

  if (!listing.is_active) {
    flags.push({
      label: 'Pasif İlan',
      level: 'red',
      detail: 'İlan şu an aktif değil — kaldırılmış olabilir',
    });
  }

  return flags;
}

function buildTimeline(
  listing: ListingResponse,
  priceHistory: PriceHistoryDTO[],
): Array<{
  label: string;
  date: string;
  type: 'created' | 'price' | 'description' | 'seen' | 'status';
}> {
  const events: Array<{
    label: string;
    date: string;
    type: 'created' | 'price' | 'description' | 'seen' | 'status';
  }> = [];

  events.push({ label: 'İlan oluşturuldu', date: listing.first_seen_at, type: 'created' });

  for (const ph of priceHistory) {
    events.push({
      label: `Fiyat değişti — ${formatTryLocal(ph.price)} ₺`,
      date: ph.detected_at,
      type: 'price',
    });
  }

  if (listing.updated_at !== listing.first_seen_at) {
    events.push({
      label: 'Açıklama güncellendi',
      date: listing.updated_at,
      type: 'description',
    });
  }

  events.push({ label: 'Son görüldü', date: listing.last_seen_at, type: 'seen' });
  events.push({
    label: listing.is_active ? 'Aktif durumda' : 'Pasif durumda',
    date: listing.last_seen_at,
    type: 'status',
  });

  return events.sort((a, b) => +new Date(a.date) - +new Date(b.date));
}
