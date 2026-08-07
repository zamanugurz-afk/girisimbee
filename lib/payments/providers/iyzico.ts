import type {
  CreateCheckoutParams,
  CheckoutSessionResult,
  IPaymentProvider,
  PaymentVerificationResult,
  RefundResult,
} from '@/lib/payments/interfaces/payment-provider';
import { PaymentProviderError } from '@/lib/payments/interfaces/payment-provider';

interface IyzicoCheckoutFormInitializeResponse {
  status: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

interface IyzicoCheckoutFormRetrieveResponse {
  status: string;
  paymentStatus?: string;
  paymentId?: string;
  price?: number;
  paidPrice?: number;
  currency?: string;
  basketId?: string;
  token?: string;
  errorCode?: string;
  errorMessage?: string;
}

function getIyzicoConfig() {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL ?? 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new PaymentProviderError(
      'IYZICO_API_KEY ve IYZICO_SECRET_KEY ortam değişkenleri gerekli.',
      'iyzico',
    );
  }

  return { apiKey, secretKey, baseUrl };
}

/**
 * iyzico Checkout Form integration.
 * Uses REST API directly — no SDK dependency required for P0.
 * @see https://dev.iyzipay.com/
 */
export class IyzicoPaymentProvider implements IPaymentProvider {
  readonly name = 'iyzico' as const;

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    const { apiKey, secretKey, baseUrl } = getIyzicoConfig();
    const conversationId = crypto.randomUUID();
    const basketId = params.entityId;
    const price = (params.amountCents / 100).toFixed(2);

    const body = {
      locale: 'tr',
      conversationId,
      price,
      paidPrice: price,
      currency: params.currency ?? 'TRY',
      basketId,
      paymentGroup: 'PRODUCT',
      callbackUrl: params.successUrl,
      enabledInstallments: [1],
      buyer: {
        id: params.userId,
        name: params.buyerName ?? 'Girisimbee',
        surname: 'User',
        email: params.buyerEmail ?? 'noreply@girisimbee.com',
        identityNumber: '11111111111',
        registrationAddress: 'Turkey',
        ip: '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: params.buyerName ?? 'Girisimbee User',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Turkey',
      },
      billingAddress: {
        contactName: params.buyerName ?? 'Girisimbee User',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Turkey',
      },
      basketItems: [
        {
          id: basketId,
          name: params.purpose,
          category1: 'Marketplace',
          itemType: 'VIRTUAL',
          price,
        },
      ],
    };

    const response = await this.request<IyzicoCheckoutFormInitializeResponse>(
      `${baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`,
      body,
      apiKey,
      secretKey,
    );

    if (response.status !== 'success' || !response.token || !response.paymentPageUrl) {
      throw new PaymentProviderError(
        response.errorMessage ?? 'iyzico checkout oturumu oluşturulamadı.',
        'iyzico',
        response,
      );
    }

    return {
      sessionId: response.token,
      checkoutUrl: response.paymentPageUrl,
      provider: 'iyzico',
      status: 'pending',
    };
  }

  async verifyWebhook(
    payload: unknown,
    _signature?: string,
  ): Promise<PaymentVerificationResult | null> {
    if (!payload || typeof payload !== 'object') return null;
    const data = payload as Record<string, unknown>;
    const token = typeof data.token === 'string' ? data.token : null;
    if (!token) return null;
    return this.getPaymentStatus(token);
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentVerificationResult | null> {
    const { apiKey, secretKey, baseUrl } = getIyzicoConfig();

    const response = await this.request<IyzicoCheckoutFormRetrieveResponse>(
      `${baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`,
      { locale: 'tr', token: sessionId },
      apiKey,
      secretKey,
    );

    if (response.status !== 'success') return null;

    const paidPrice = response.paidPrice ?? response.price ?? 0;
    const status = response.paymentStatus === 'SUCCESS' ? 'succeeded' : 'failed';

    return {
      provider: 'iyzico',
      providerRef: response.paymentId ?? sessionId,
      sessionId,
      status,
      amountCents: Math.round(Number(paidPrice) * 100),
      currency: response.currency ?? 'TRY',
      userId: null,
      entityType: null,
      entityId: response.basketId ?? null,
      metadata: { rawStatus: response.paymentStatus },
    };
  }

  async refundPayment(providerRef: string): Promise<RefundResult> {
    // iyzico refund requires paymentTransactionId — deferred to P1 with full order context
    void providerRef;
    throw new PaymentProviderError(
      'iyzico iade işlemi P1 aşamasında tamamlanacak.',
      'iyzico',
    );
  }

  private async request<T>(
    url: string,
    body: Record<string, unknown>,
    apiKey: string,
    secretKey: string,
  ): Promise<T> {
    const authorization = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authorization}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new PaymentProviderError(
        `iyzico API hatası: ${res.status} ${res.statusText}`,
        'iyzico',
      );
    }

    return res.json() as Promise<T>;
  }
}
