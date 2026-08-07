/** Account panel — Profilim UI types (mock only). No photo, no city. */

export type AccountProfileGender = 'female' | 'male' | 'unspecified' | 'other';

export interface AccountPanelPersonalInfo {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: AccountProfileGender;
  accountCreatedAt: string;
}

export interface AccountPanelCompanyInfo {
  companyName: string;
  taxOffice: string;
  taxNumber: string;
  website: string;
  linkedIn: string;
}

export interface AccountPanelSocialInfo {
  linkedIn: string;
  x: string;
  instagram: string;
}

export interface AccountPanelProfileData {
  personal: AccountPanelPersonalInfo;
  company: AccountPanelCompanyInfo;
  social: AccountPanelSocialInfo;
}
