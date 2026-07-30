import { supabase } from '@/lib/supabase';
import type {
  AIAnalysisDTO,
  AIAnalysisResponse,
  AIAnalysisCreate,
  AIAnalysisUpdate,
  AIAnalysisFilter,
} from '@/types';
import { AIEngine, type AIAnalysisInput } from '@/lib/engines/ai-engine';
import type { ListingResponse, SellerDTO } from '@/types';

export class AIService {
  private table = 'ai_analysis';
  private engine = new AIEngine();

  async getAll(filter?: AIAnalysisFilter): Promise<AIAnalysisResponse[]> {
    let q = supabase
      .from(this.table)
      .select('*, listing:listings(*)');
    if (filter?.listing_id) q = q.eq('listing_id', filter.listing_id);
    if (filter?.min_opportunity !== undefined) q = q.gte('opportunity_score', filter.min_opportunity);
    if (filter?.min_confidence !== undefined) q = q.gte('confidence', filter.min_confidence);
    if (filter?.recommendation) q = q.eq('recommendation', filter.recommendation);
    const { data, error } = await q.order('opportunity_score', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as AIAnalysisResponse[]) ?? [];
  }

  async getByListing(listingId: string): Promise<AIAnalysisResponse | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, listing:listings(*)')
      .eq('listing_id', listingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as AIAnalysisResponse | null;
  }

  async create(input: AIAnalysisCreate): Promise<AIAnalysisDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .upsert(
        {
          listing_id: input.listing_id,
          opportunity_score: input.opportunity_score,
          seller_score: input.seller_score,
          image_score: input.image_score,
          description_score: input.description_score,
          negotiation_score: input.negotiation_score,
          fake_probability: input.fake_probability,
          confidence: input.confidence,
          recommendation: input.recommendation,
          explanation: input.explanation ?? null,
          price_score: input.price_score ?? null,
          risk_score: input.risk_score ?? null,
          overall_score: input.overall_score ?? null,
          confidence_label: input.confidence_label ?? null,
          ai_summary: input.ai_summary ?? null,
          expected_accepted_price: input.expected_accepted_price ?? null,
          negotiation_probability: input.negotiation_probability ?? null,
          content_hash: input.content_hash ?? null,
          analyzed_at: new Date().toISOString(),
        },
        { onConflict: 'listing_id' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AIAnalysisDTO;
  }

  async update(id: string, input: AIAnalysisUpdate): Promise<AIAnalysisDTO> {
    const { data, error } = await supabase
      .from(this.table)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as AIAnalysisDTO;
  }

  async analyzeAndSave(
    listing: ListingResponse,
    marketMedian: number,
    allPrices: number[],
    priceHistory: number[],
    allListings?: Array<{ id: string; title: string; price: number; description: string | null; image_urls: string[] }>,
  ): Promise<{ analysis: AIAnalysisDTO; cached: boolean }> {
    const input = this.buildInput(listing, marketMedian, allPrices, priceHistory, allListings);
    const result = this.engine.analyze(input);

    const existing = await this.getByListing(listing.id);
    if (existing && existing.content_hash && existing.content_hash === result.contentHash) {
      return { analysis: existing, cached: true };
    }

    const analysis = await this.create({
      listing_id: listing.id,
      opportunity_score: result.opportunityScore,
      seller_score: result.sellerScore,
      image_score: result.imageScore,
      description_score: result.descriptionScore,
      negotiation_score: result.negotiationScore,
      fake_probability: result.fakeProbability,
      confidence: result.confidence,
      recommendation: result.recommendation,
      explanation: result.explanation,
      price_score: result.priceScore,
      risk_score: result.riskScore,
      overall_score: result.overallScore,
      confidence_label: result.confidenceLabel,
      ai_summary: result.summary,
      expected_accepted_price: result.expectedAcceptedPrice ?? undefined,
      negotiation_probability: result.negotiationProbability,
      content_hash: result.contentHash,
    });

    return { analysis, cached: false };
  }

  analyzeOnly(
    listing: ListingResponse,
    marketMedian: number,
    allPrices: number[],
    priceHistory: number[],
    allListings?: Array<{ id: string; title: string; price: number; description: string | null; image_urls: string[] }>,
  ) {
    const input = this.buildInput(listing, marketMedian, allPrices, priceHistory, allListings);
    return this.engine.analyze(input);
  }

  private buildInput(
    listing: ListingResponse,
    marketMedian: number,
    allPrices: number[],
    priceHistory: number[],
    allListings?: Array<{ id: string; title: string; price: number; description: string | null; image_urls: string[] }>,
  ): AIAnalysisInput {
    return {
      listing: {
        id: listing.id,
        price: listing.price,
        condition: listing.condition,
        description: listing.description,
        image_urls: listing.image_urls,
        first_seen_at: listing.first_seen_at,
        title: listing.title,
        updated_at: listing.updated_at,
      },
      seller: listing.seller as SellerDTO | null,
      marketMedian,
      allPrices,
      priceHistory,
      allListings,
    };
  }
}

export const aiService = new AIService();
