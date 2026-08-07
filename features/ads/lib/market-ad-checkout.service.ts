import type { SupabaseClient } from '@supabase/supabase-js';
import { ids, type UserId } from '@/lib/domain/ids';
import type { PaymentProvider } from '@/lib/domain/marketplace-enums';
import { PaymentService } from '@/lib/payments/services/payment-service';
import {
  MARKET_AD_PRICE_TL,
} from '@/features/ads/constants/ad-inquiry.constants';
import {
  createAdInquiry,
  getAdInquiry,
  getAdInquiryByPaymentSession,
  updateAdInquiry,
} from '@/features/ads/lib/ad-inquiry.repository';
import type { CreateMarketAdInquiryInput } from '@/features/ads/types/ad-inquiry.types';
import {
  countPublishedMarketItems,
  createMarketItem,
} from '@/features/admin/market/lib/market-repository';
import {
  MARKET_MAX_PUBLISHED,
  type MarketItem,
} from '@/features/admin/market/types/market.types';
import { sendAdInquiryConfirmation, sendTransactionalEmail } from '@/lib/email/send';

export const MARKET_AD_PRICE_CENTS = MARKET_AD_PRICE_TL * 100;

function resolveProvider(): PaymentProvider {
  if (process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY) return 'iyzico';
  return 'simulated';
}

export type MarketAdCheckoutResult =
  | {
      mode: 'redirect';
      checkoutUrl: string;
      inquiryId: string;
      paymentId: string;
      provider: PaymentProvider;
    }
  | {
      mode: 'instant';
      inquiryId: string;
      paymentId: string;
      marketItem: MarketItem;
      provider: PaymentProvider;
    };

export async function startMarketAdCheckout(params: {
  supabase: SupabaseClient;
  userId: UserId;
  input: CreateMarketAdInquiryInput;
  origin: string;
}): Promise<MarketAdCheckoutResult> {
  const published = await countPublishedMarketItems(params.supabase);
  if (published >= MARKET_MAX_PUBLISHED) {
    throw new Error(
      `MARKET dolu (en fazla ${MARKET_MAX_PUBLISHED} yayın). Özel işbirliği talebi oluşturabilir veya sonra tekrar deneyebilirsiniz.`,
    );
  }

  const inquiry = await createAdInquiry(
    params.supabase,
    params.input,
    params.userId,
    'reviewing',
  );

  void sendAdInquiryConfirmation({
    to: params.input.email,
    fullName: params.input.fullName,
    kind: 'market_ad',
    inquiryId: inquiry.id,
  }).catch(() => undefined);

  const paymentId = crypto.randomUUID();
  const amountCents = MARKET_AD_PRICE_CENTS;
  const provider = resolveProvider();

  const { error: payError } = await params.supabase.from('marketplace_payments').insert({
    id: paymentId,
    user_id: params.userId,
    amount_cents: amountCents,
    currency: 'TRY',
    provider,
    status: 'processing',
    purpose: 'market_ad',
    entity_type: 'ad_inquiry',
    entity_id: inquiry.id,
    metadata: {
      inquiryId: inquiry.id,
      title: params.input.title,
      priceTl: MARKET_AD_PRICE_TL,
    },
  });

  if (payError) {
    throw new Error(
      /market_ad|invalid input value for enum/i.test(payError.message)
        ? 'Ödeme tipi (market_ad) henüz veritabanında yok. market_ad_payment migration’ını uygulayın.'
        : payError.message,
    );
  }

  const callbackUrl = `${params.origin}/api/reklam/payment/callback`;
  const gateway = new PaymentService({ defaultProvider: provider });
  const nameParts = params.input.fullName.trim().split(/\s+/);
  const session = await gateway.createCheckoutSession(
    {
      userId: params.userId,
      amountCents,
      currency: 'TRY',
      purpose: 'market_ad',
      entityType: 'ad_inquiry',
      entityId: inquiry.id,
      successUrl: `${callbackUrl}?inquiryId=${encodeURIComponent(inquiry.id)}`,
      cancelUrl: `${params.origin}/reklam?cancelled=1`,
      buyerEmail: params.input.email,
      buyerName: nameParts[0] ?? params.input.fullName,
      metadata: { paymentId, inquiryId: inquiry.id },
    },
    provider,
  );

  await updateAdInquiry(params.supabase, inquiry.id, {
    paymentId,
    paymentSessionId: session.sessionId,
  });

  await params.supabase
    .from('marketplace_payments')
    .update({
      provider_session_id: session.sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (provider === 'simulated') {
    const marketItem = await fulfillMarketAdPayment({
      supabase: params.supabase,
      inquiryId: inquiry.id,
      sessionId: session.sessionId,
      userId: params.userId,
      skipProviderVerify: true,
    });
    void sendTransactionalEmail({
      to: params.input.email,
      subject: 'MARKET reklamınız yayınlandı — GirisimBee',
      text: `Merhaba ${params.input.fullName},\n\nÖdemeniz alındı ve MARKET kartınız yayınlandı.\n\nKart: ${marketItem.title}\n\nGirisimBee`,
      html: `<p>Merhaba ${params.input.fullName},</p><p>Ödemeniz alındı ve MARKET kartınız yayınlandı.</p><p><strong>${marketItem.title}</strong></p><p>GirisimBee</p>`,
    }).catch(() => undefined);
    return {
      mode: 'instant',
      inquiryId: inquiry.id,
      paymentId,
      marketItem,
      provider,
    };
  }

  return {
    mode: 'redirect',
    checkoutUrl: session.checkoutUrl,
    inquiryId: inquiry.id,
    paymentId,
    provider,
  };
}

export async function fulfillMarketAdPayment(params: {
  supabase: SupabaseClient;
  inquiryId?: string;
  sessionId: string;
  userId?: string | null;
  skipProviderVerify?: boolean;
}): Promise<MarketItem> {
  let inquiry = params.inquiryId
    ? await getAdInquiry(params.supabase, params.inquiryId)
    : await getAdInquiryByPaymentSession(params.supabase, params.sessionId);

  if (!inquiry) {
    throw new Error('Reklam talebi bulunamadı.');
  }

  if (inquiry.marketItemId) {
    const { data } = await params.supabase
      .from('marketplace_market_items')
      .select('*')
      .eq('id', inquiry.marketItemId)
      .maybeSingle();
    if (data) {
      return {
        id: data.id,
        title: data.title,
        description: data.description ?? '',
        imageUrl: data.image_url,
        linkUrl: data.link_url,
        ctaLabel: data.cta_label || 'İncele',
        sortOrder: data.sort_order,
        status: data.status,
        publishedAt: data.published_at,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deletedAt: data.deleted_at,
      };
    }
  }

  if (!params.skipProviderVerify) {
    const provider = resolveProvider();
    const gateway = new PaymentService({ defaultProvider: provider });
    const verified = await gateway.getPaymentStatus(params.sessionId, provider);
    if (!verified || verified.status !== 'succeeded') {
      throw new Error('Ödeme doğrulanamadı veya başarısız.');
    }
  }

  if (!inquiry.title) {
    throw new Error('Reklam başlığı eksik.');
  }

  const published = await countPublishedMarketItems(params.supabase);
  if (published >= MARKET_MAX_PUBLISHED) {
    throw new Error(`MARKET dolu (en fazla ${MARKET_MAX_PUBLISHED} yayın).`);
  }

  const createdBy = params.userId ?? inquiry.createdBy;
  if (!createdBy) {
    throw new Error('Yayın için kullanıcı bilgisi gerekli.');
  }

  const marketItem = await createMarketItem(
    params.supabase,
    {
      title: inquiry.title,
      description: inquiry.description ?? '',
      imageUrl: inquiry.imageUrl,
      linkUrl: inquiry.linkUrl,
      ctaLabel: inquiry.ctaLabel ?? 'İncele',
      sortOrder: 0,
      status: 'published',
    },
    createdBy,
  );

  await updateAdInquiry(params.supabase, inquiry.id, {
    status: 'accepted',
    marketItemId: marketItem.id,
  });

  if (inquiry.paymentId) {
    await params.supabase
      .from('marketplace_payments')
      .update({
        status: 'succeeded',
        provider_ref: params.sessionId,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiry.paymentId);
  }

  return marketItem;
}

/** Ensure UserId branding for callers. */
export function asUserId(id: string): UserId {
  return ids.user(id);
}
