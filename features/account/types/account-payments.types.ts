/** Account panel — payments UI types (mock only).
 * Never store card number, CVV, expiry, or payment-provider credentials.
 */

export type AccountPaymentStatus = 'completed' | 'pending' | 'failed';

export type AccountPaymentsTab = 'all' | AccountPaymentStatus;

export type AccountPaymentPackageType = 'vitrin' | 'acil_vitrin' | 'standart';

export interface AccountPaymentCardData {
  id: string;
  transactionNumber: string;
  packageName: string;
  packageType: AccountPaymentPackageType;
  paidAt: string | null;
  amountTry: number;
  status: AccountPaymentStatus;
  invoiceNumber: string | null;
  /** Related listing when payment comes from package simulation */
  listingId?: string | null;
}

export interface AccountPaymentStatsData {
  totalPayments: number;
  totalSpentTry: number;
  activePackageCount: number;
}
