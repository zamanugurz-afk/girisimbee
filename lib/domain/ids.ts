/**
 * Branded ID types — prevent cross-entity ID confusion at compile time.
 */

declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type ProfileId = Brand<string, 'ProfileId'>;
export type CompanyId = Brand<string, 'CompanyId'>;
export type ListingId = Brand<string, 'ListingId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ListingTypeId = Brand<string, 'ListingTypeId'>;
export type ConversationId = Brand<string, 'ConversationId'>;
export type MessageId = Brand<string, 'MessageId'>;
export type ApplicationId = Brand<string, 'ApplicationId'>;
export type FavoriteId = Brand<string, 'FavoriteId'>;
export type NotificationId = Brand<string, 'NotificationId'>;
export type AttachmentId = Brand<string, 'AttachmentId'>;
export type TagId = Brand<string, 'TagId'>;
export type ReportId = Brand<string, 'ReportId'>;
export type ActivityId = Brand<string, 'ActivityId'>;
export type VerificationId = Brand<string, 'VerificationId'>;
export type SubscriptionId = Brand<string, 'SubscriptionId'>;
export type ListingPackageId = Brand<string, 'ListingPackageId'>;
export type FranchisePackageId = Brand<string, 'FranchisePackageId'>;
export type EmployerPackageId = Brand<string, 'EmployerPackageId'>;
export type CandidatePackageId = Brand<string, 'CandidatePackageId'>;
export type EntrepreneurPackageId = Brand<string, 'EntrepreneurPackageId'>;
export type InvestorPackageId = Brand<string, 'InvestorPackageId'>;
export type FounderPackageId = Brand<string, 'FounderPackageId'>;
export type SubcategoryId = Brand<string, 'SubcategoryId'>;
export type MatchId = Brand<string, 'MatchId'>;
export type DocumentId = Brand<string, 'DocumentId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type ProfileModuleId = Brand<string, 'ProfileModuleId'>;

export function id<T extends string>(value: string): Brand<string, T> {
  return value as Brand<string, T>;
}

export const ids = {
  user: (v: string) => v as UserId,
  profile: (v: string) => v as ProfileId,
  company: (v: string) => v as CompanyId,
  listing: (v: string) => v as ListingId,
  category: (v: string) => v as CategoryId,
  listingType: (v: string) => v as ListingTypeId,
  conversation: (v: string) => v as ConversationId,
  message: (v: string) => v as MessageId,
  application: (v: string) => v as ApplicationId,
  favorite: (v: string) => v as FavoriteId,
  notification: (v: string) => v as NotificationId,
  attachment: (v: string) => v as AttachmentId,
  tag: (v: string) => v as TagId,
  report: (v: string) => v as ReportId,
  activity: (v: string) => v as ActivityId,
  verification: (v: string) => v as VerificationId,
  subscription: (v: string) => v as SubscriptionId,
  listingPackage: (v: string) => v as ListingPackageId,
  franchisePackage: (v: string) => v as FranchisePackageId,
  employerPackage: (v: string) => v as EmployerPackageId,
  candidatePackage: (v: string) => v as CandidatePackageId,
  entrepreneurPackage: (v: string) => v as EntrepreneurPackageId,
  investorPackage: (v: string) => v as InvestorPackageId,
  founderPackage: (v: string) => v as FounderPackageId,
  subcategory: (v: string) => v as SubcategoryId,
  match: (v: string) => v as MatchId,
  document: (v: string) => v as DocumentId,
  payment: (v: string) => v as PaymentId,
  profileModule: (v: string) => v as ProfileModuleId,
};
