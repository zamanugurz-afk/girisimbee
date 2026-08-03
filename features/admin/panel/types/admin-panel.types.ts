import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type AdminNavItem = {
  id: string;
  label: string;
  href: string;
  exact?: boolean;
  icon?: LucideIcon;
};

export type AdminStatItem = {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
};

export type AdminTableColumn<T> = {
  /** Unique column id; defaults to `key` when omitted */
  id?: string;
  key: keyof T & string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
};

export type AdminUserRole = 'user' | 'admin' | 'super_admin';
export type AdminUserStatus = 'active' | 'suspended' | 'deleted';

export type AdminMockUser = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  created_at: string;
  last_login_at: string | null;
};

export type AdminListingStatus =
  | 'draft'
  | 'active'
  | 'pending'
  | 'suspended'
  | 'deleted';

export type AdminMockListing = {
  id: string;
  title: string;
  category: string;
  owner: string;
  status: AdminListingStatus;
  view_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_urgent: boolean;
};

export type AdminPlacementType = 'vitrin' | 'acil_vitrin';
export type AdminPlacementStatus = 'active' | 'pending' | 'expired' | 'cancelled';

export type AdminMockPlacement = {
  id: string;
  listing_id: string;
  listing_title: string;
  owner: string;
  placement_type: AdminPlacementType;
  status: AdminPlacementStatus;
  started_at: string;
  expires_at: string;
};

export type AdminMockNotification = {
  id: string;
  title: string;
  audience: string;
  channel: 'in_app' | 'email' | 'sms';
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
};

export type AdminMockReportRow = {
  id: string;
  metric: string;
  period: string;
  value: string;
  change: string;
};

export type AdminReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type AdminReportMetrics = {
  total_users: number;
  total_listings: number;
  daily_listings: number;
  total_views: number;
  total_favorites: number;
  total_placements: number;
  total_urgent_placements: number;
  daily_revenue: number;
  monthly_revenue: number;
};

export type AdminReportChartPoint = {
  label: string;
  views: number;
  listings: number;
  revenue: number;
};

export type AdminTopListingRow = {
  id: string;
  title: string;
  owner: string;
  view_count: number;
  favorite_count: number;
};

export type AdminTopUserRow = {
  id: string;
  full_name: string;
  username: string;
  listing_count: number;
  last_active_at: string;
};

export type AdminReportSnapshot = {
  period: AdminReportPeriod;
  metrics: AdminReportMetrics;
  chart: AdminReportChartPoint[];
  top_viewed_listings: AdminTopListingRow[];
  top_favorited_listings: AdminTopListingRow[];
  top_active_users: AdminTopUserRow[];
};

export type AdminMockSetting = {
  id: string;
  key: string;
  label: string;
  value: string;
  editableBy: 'admin' | 'super_admin';
};

export type AdminComplaintType =
  | 'user_complaint'
  | 'listing_complaint'
  | 'fraud'
  | 'spam'
  | 'inappropriate';

export type AdminComplaintStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export type AdminMockComplaint = {
  id: string;
  report_type: AdminComplaintType;
  target_id: string;
  reporter: string;
  reason: string;
  description: string;
  status: AdminComplaintStatus;
  created_at: string;
  assignee: string | null;
};

export type AdminLogCategory =
  | 'authentication'
  | 'listing'
  | 'payment'
  | 'moderation'
  | 'security'
  | 'system';

export type AdminLogStatus = 'success' | 'warning' | 'error';

export type AdminMockLog = {
  id: string;
  category: AdminLogCategory;
  event_type: string;
  actor: string;
  target: string;
  ip_address: string;
  status: AdminLogStatus;
  created_at: string;
  details: string;
};

export type AdminVerificationType =
  | 'identity'
  | 'phone'
  | 'email'
  | 'company'
  | 'investor'
  | 'franchise';

export type AdminVerificationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export type AdminMockVerification = {
  id: string;
  user_id: string;
  full_name: string;
  verification_type: AdminVerificationType;
  status: AdminVerificationStatus;
  created_at: string;
  updated_at: string;
  note: string | null;
};

export type AdminPaymentPackageType = 'standart' | 'vitrin' | 'acil_vitrin';
export type AdminPaymentMethod = 'card' | 'bank_transfer' | 'wallet';
export type AdminPaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type AdminPaymentSection =
  | 'payments'
  | 'refunds'
  | 'commissions'
  | 'invoices'
  | 'failed'
  | 'pending';

export type AdminMockPayment = {
  id: string;
  user_id: string;
  user_name: string;
  listing_id: string;
  package_type: AdminPaymentPackageType;
  amount: number;
  commission_amount: number;
  currency: string;
  payment_method: AdminPaymentMethod;
  invoice_number: string;
  status: AdminPaymentStatus;
  created_at: string;
  updated_at: string;
};

export type AdminSupportSection =
  | 'tickets'
  | 'live_chat'
  | 'email_inbox'
  | 'faq'
  | 'operators'
  | 'auto_replies';

export type AdminSupportCategory =
  | 'technical'
  | 'payment'
  | 'account'
  | 'listing'
  | 'investor_verification'
  | 'franchise_verification'
  | 'user_complaint'
  | 'other';

export type AdminSupportPriority = 'low' | 'normal' | 'high' | 'critical';

export type AdminSupportStatus =
  | 'open'
  | 'waiting'
  | 'assigned'
  | 'resolved'
  | 'closed';

export type AdminMockSupportTicket = {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  operator_id: string | null;
  operator_name: string | null;
  subject: string;
  category: AdminSupportCategory;
  priority: AdminSupportPriority;
  status: AdminSupportStatus;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  channel: 'ticket' | 'live_chat' | 'email';
  notes: string[];
  replies: string[];
  first_response_minutes: number | null;
};

export type AdminSupportStats = {
  open_count: number;
  waiting_count: number;
  resolved_count: number;
  avg_response_minutes: number;
  operator_performance: string;
  daily_ticket_count: number;
};

export type AdminContentSection =
  | 'blog'
  | 'help'
  | 'faq'
  | 'announcements'
  | 'banners'
  | 'menus'
  | 'footer'
  | 'seo';

export type AdminBlogStatus = 'draft' | 'published' | 'archived';

export type AdminMockBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  status: AdminBlogStatus;
  published_at: string | null;
  created_at: string;
};

export type AdminMockFaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'draft' | 'published' | 'archived';
};

export type AdminMockAnnouncement = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  priority: 'low' | 'normal' | 'high';
  status: 'draft' | 'active' | 'expired';
};

export type AdminMockBanner = {
  id: string;
  title: string;
  image_url: string;
  redirect_url: string;
  position: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type AdminMockMenuItem = {
  id: string;
  label: string;
  href: string;
  order: number;
  is_visible: boolean;
};

export type AdminMockFooterLink = {
  id: string;
  group: 'platform' | 'company' | 'support' | 'legal';
  label: string;
  href: string;
  order: number;
  is_visible: boolean;
};

export type AdminMockSeoSettings = {
  title: string;
  description: string;
  keywords: string;
  canonical_url: string;
  robots: string;
  og_title: string;
  og_description: string;
  og_image: string;
};

export type AdminMockHelpArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  updated_at: string;
};
