import type { AdminContentSection } from '@/features/admin/panel/types/admin-panel.types';

export const ADMIN_CONTENT_SECTIONS: readonly {
  id: AdminContentSection;
  label: string;
}[] = [
  { id: 'blog', label: 'Blog' },
  { id: 'help', label: 'Yardım Merkezi' },
  { id: 'faq', label: 'SSS' },
  { id: 'announcements', label: 'Duyurular' },
  { id: 'banners', label: 'Banner yönetimi' },
  { id: 'menus', label: 'Menü yönetimi' },
  { id: 'footer', label: 'Footer yönetimi' },
  { id: 'seo', label: 'SEO yönetimi' },
] as const;

export const ADMIN_BLOG_STATUS_LABELS = {
  draft: 'Taslak',
  published: 'Yayında',
  archived: 'Arşiv',
} as const;

export const ADMIN_FOOTER_GROUP_LABELS = {
  platform: 'Platform',
  company: 'Şirket',
  support: 'Destek',
  legal: 'Yasal',
} as const;

export const ADMIN_CONTENT_PAGE_SIZE = 6;
