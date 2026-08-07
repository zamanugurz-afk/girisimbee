import type {
  AccountPanelProfileData,
  AccountProfileGender,
} from '@/features/account/types/account-profile-panel.types';

export const ACCOUNT_PROFILE_GENDER_LABELS: Record<AccountProfileGender, string> = {
  female: 'Kadın',
  male: 'Erkek',
  unspecified: 'Belirtmek istemiyorum',
  other: 'Diğer',
};

/** Mock profile for /hesabim/profilim — no photo, no city, no Supabase */
export const MOCK_ACCOUNT_PANEL_PROFILE: AccountPanelProfileData = {
  personal: {
    firstName: 'Ayşe',
    lastName: 'Yılmaz',
    username: 'ayse-yilmaz',
    phone: '05321234567',
    email: 'ayse.yilmaz@example.com',
    birthDate: '1992-04-18',
    gender: 'female',
    accountCreatedAt: '2026-03-12T09:30:00.000Z',
  },
  company: {
    companyName: 'Yılmaz Girişim Danışmanlık',
    taxOffice: 'Kadıköy',
    taxNumber: '1234567890',
    website: 'https://example.com',
    linkedIn: 'https://linkedin.com/company/example',
  },
  social: {
    linkedIn: 'https://linkedin.com/in/ayse-yilmaz',
    x: 'https://x.com/ayseyilmaz',
    instagram: 'https://instagram.com/ayseyilmaz',
  },
};
