export type AdminSystemStatusItem = {
  id: 'online_users' | 'active_listings' | 'pending_verifications' | 'pending_payments';
  label: string;
  value: number;
};

export type AdminSystemStatus = {
  label: string;
  items: AdminSystemStatusItem[];
};
