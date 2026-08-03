'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import { AdminTable } from '@/features/admin/panel/components/AdminTable';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminPagination } from '@/features/admin/panel/components/AdminPagination';
import { AdminReportCard } from '@/features/admin/panel/components/AdminReportCard';
import {
  AdminBlogEditorDialog,
  type AdminBlogDraft,
} from '@/features/admin/panel/components/AdminBlogEditorDialog';
import {
  ADMIN_BLOG_STATUS_LABELS,
  ADMIN_CONTENT_PAGE_SIZE,
  ADMIN_CONTENT_SECTIONS,
  ADMIN_FOOTER_GROUP_LABELS,
} from '@/features/admin/panel/constants/admin-content.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import {
  MOCK_ADMIN_ANNOUNCEMENTS,
  MOCK_ADMIN_BANNERS,
  MOCK_ADMIN_BLOG_POSTS,
  MOCK_ADMIN_FAQ_ITEMS,
  MOCK_ADMIN_FOOTER_LINKS,
  MOCK_ADMIN_HELP_ARTICLES,
  MOCK_ADMIN_MENU_ITEMS,
  MOCK_ADMIN_SEO_SETTINGS,
} from '@/features/admin/panel/mock/admin-panel.mock';
import type {
  AdminContentSection,
  AdminMockAnnouncement,
  AdminMockBanner,
  AdminMockBlogPost,
  AdminMockFaqItem,
  AdminMockFooterLink,
  AdminMockHelpArticle,
  AdminMockMenuItem,
  AdminMockSeoSettings,
  AdminTableColumn,
} from '@/features/admin/panel/types/admin-panel.types';

function cloneBlog(): AdminMockBlogPost[] {
  return MOCK_ADMIN_BLOG_POSTS.map((row) => ({ ...row }));
}

export function AdminContentView() {
  const [section, setSection] = useState<AdminContentSection>('blog');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const [posts, setPosts] = useState<AdminMockBlogPost[]>(cloneBlog);
  const [help] = useState<AdminMockHelpArticle[]>(() =>
    MOCK_ADMIN_HELP_ARTICLES.map((row) => ({ ...row })),
  );
  const [faqs] = useState<AdminMockFaqItem[]>(() =>
    MOCK_ADMIN_FAQ_ITEMS.map((row) => ({ ...row })),
  );
  const [announcements] = useState<AdminMockAnnouncement[]>(() =>
    MOCK_ADMIN_ANNOUNCEMENTS.map((row) => ({ ...row })),
  );
  const [banners, setBanners] = useState<AdminMockBanner[]>(() =>
    MOCK_ADMIN_BANNERS.map((row) => ({ ...row })),
  );
  const [menus, setMenus] = useState<AdminMockMenuItem[]>(() =>
    MOCK_ADMIN_MENU_ITEMS.map((row) => ({ ...row })),
  );
  const [footer, setFooter] = useState<AdminMockFooterLink[]>(() =>
    MOCK_ADMIN_FOOTER_LINKS.map((row) => ({ ...row })),
  );
  const [seo, setSeo] = useState<AdminMockSeoSettings>({ ...MOCK_ADMIN_SEO_SETTINGS });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminMockBlogPost | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (row) =>
        row.title.toLowerCase().includes(q)
        || row.slug.toLowerCase().includes(q)
        || row.author.toLowerCase().includes(q)
        || row.status.includes(q),
    );
  }, [posts, query]);

  const filteredHelp = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return help;
    return help.filter(
      (row) =>
        row.title.toLowerCase().includes(q)
        || row.slug.toLowerCase().includes(q)
        || row.category.toLowerCase().includes(q),
    );
  }, [help, query]);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (row) =>
        row.question.toLowerCase().includes(q)
        || row.answer.toLowerCase().includes(q)
        || row.category.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  const filteredAnnouncements = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter(
      (row) =>
        row.title.toLowerCase().includes(q)
        || row.description.toLowerCase().includes(q),
    );
  }, [announcements, query]);

  const filteredBanners = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return banners;
    return banners.filter(
      (row) =>
        row.title.toLowerCase().includes(q)
        || row.position.toLowerCase().includes(q)
        || row.redirect_url.toLowerCase().includes(q),
    );
  }, [banners, query]);

  const filteredMenus = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter(
      (row) =>
        row.label.toLowerCase().includes(q) || row.href.toLowerCase().includes(q),
    );
  }, [menus, query]);

  const filteredFooter = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return footer;
    return footer.filter(
      (row) =>
        row.label.toLowerCase().includes(q)
        || row.href.toLowerCase().includes(q)
        || row.group.includes(q),
    );
  }, [footer, query]);

  const activeRows =
    section === 'blog'
      ? filteredPosts
      : section === 'help'
        ? filteredHelp
        : section === 'faq'
          ? filteredFaqs
          : section === 'announcements'
            ? filteredAnnouncements
            : section === 'banners'
              ? filteredBanners
              : section === 'menus'
                ? filteredMenus
                : section === 'footer'
                  ? filteredFooter
                  : [];

  const pageCount = Math.max(1, Math.ceil(activeRows.length / ADMIN_CONTENT_PAGE_SIZE));
  const pageSafe = Math.min(page, pageCount);
  const pageSlice = <T,>(rows: T[]) =>
    rows.slice((pageSafe - 1) * ADMIN_CONTENT_PAGE_SIZE, pageSafe * ADMIN_CONTENT_PAGE_SIZE);

  function saveBlog(draft: AdminBlogDraft, existingId: string | null) {
    if (existingId) {
      setPosts((prev) =>
        prev.map((row) =>
          row.id === existingId
            ? {
                ...row,
                ...draft,
                published_at:
                  draft.status === 'published'
                    ? row.published_at ?? new Date().toISOString()
                    : null,
              }
            : row,
        ),
      );
      notify('Blog yazısı güncellendi');
      return;
    }
    const id = `blog_${Date.now()}`;
    setPosts((prev) => [
      {
        id,
        ...draft,
        published_at: draft.status === 'published' ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    notify('Blog yazısı oluşturuldu');
  }

  const blogColumns: AdminTableColumn<AdminMockBlogPost>[] = [
    { key: 'id', header: 'id', className: 'font-mono text-xs' },
    { key: 'slug', header: 'slug' },
    { key: 'title', header: 'title', className: 'min-w-[160px]' },
    { key: 'excerpt', header: 'excerpt', className: 'max-w-[200px] truncate' },
    { key: 'author', header: 'author' },
    {
      key: 'status',
      header: 'status',
      render: (row) => ADMIN_BLOG_STATUS_LABELS[row.status],
    },
    {
      key: 'published_at',
      header: 'published_at',
      render: (row) => formatAdminDateTime(row.published_at),
    },
    {
      key: 'created_at',
      header: 'created_at',
      render: (row) => formatAdminDateTime(row.created_at),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <div className="flex max-w-[280px] flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingPost(row);
              setEditorOpen(true);
            }}
          >
            Düzenle
          </Button>
          {row.status !== 'published' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setPosts((prev) =>
                  prev.map((item) =>
                    item.id === row.id
                      ? {
                          ...item,
                          status: 'published',
                          published_at: new Date().toISOString(),
                        }
                      : item,
                  ),
                );
                notify('Yayınlandı');
              }}
            >
              Yayınla
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setPosts((prev) =>
                  prev.map((item) =>
                    item.id === row.id
                      ? { ...item, status: 'draft', published_at: null }
                      : item,
                  ),
                );
                notify('Taslağa alındı');
              }}
            >
              Taslağa al
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => {
              setPosts((prev) => prev.filter((item) => item.id !== row.id));
              notify('Silindi');
            }}
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  const helpColumns: AdminTableColumn<AdminMockHelpArticle>[] = [
    { key: 'id', header: 'id', className: 'font-mono text-xs' },
    { key: 'title', header: 'title' },
    { key: 'slug', header: 'slug' },
    { key: 'category', header: 'category' },
    { key: 'status', header: 'status' },
    {
      key: 'updated_at',
      header: 'updated_at',
      render: (row) => formatAdminDateTime(row.updated_at),
    },
  ];

  const faqColumns: AdminTableColumn<AdminMockFaqItem>[] = [
    { key: 'id', header: 'id', className: 'font-mono text-xs' },
    { key: 'question', header: 'question', className: 'min-w-[180px]' },
    { key: 'answer', header: 'answer', className: 'max-w-[220px] truncate' },
    { key: 'category', header: 'category' },
    { key: 'order', header: 'order', className: 'tabular-nums' },
    { key: 'status', header: 'status' },
  ];

  const announcementColumns: AdminTableColumn<AdminMockAnnouncement>[] = [
    { key: 'id', header: 'id', className: 'font-mono text-xs' },
    { key: 'title', header: 'title' },
    { key: 'description', header: 'description', className: 'max-w-[220px] truncate' },
    { key: 'start_date', header: 'start_date' },
    { key: 'end_date', header: 'end_date' },
    { key: 'priority', header: 'priority' },
    { key: 'status', header: 'status' },
  ];

  const bannerColumns: AdminTableColumn<AdminMockBanner>[] = [
    { key: 'id', header: 'id', className: 'font-mono text-xs' },
    { key: 'title', header: 'title' },
    { key: 'image_url', header: 'image_url', className: 'max-w-[140px] truncate' },
    { key: 'redirect_url', header: 'redirect_url' },
    { key: 'position', header: 'position' },
    { key: 'start_date', header: 'start_date' },
    { key: 'end_date', header: 'end_date' },
    {
      key: 'is_active',
      header: 'is_active',
      render: (row) => (row.is_active ? 'Aktif' : 'Pasif'),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setBanners((prev) =>
              prev.map((item) =>
                item.id === row.id ? { ...item, is_active: !item.is_active } : item,
              ),
            );
            notify(row.is_active ? 'Banner pasife alındı' : 'Banner aktifleştirildi');
          }}
        >
          {row.is_active ? 'Pasife al' : 'Aktifleştir'}
        </Button>
      ),
    },
  ];

  const menuColumns: AdminTableColumn<AdminMockMenuItem>[] = [
    { key: 'id', header: 'id', className: 'font-mono text-xs' },
    { key: 'label', header: 'label' },
    { key: 'href', header: 'href' },
    { key: 'order', header: 'order', className: 'tabular-nums' },
    {
      key: 'is_visible',
      header: 'is_visible',
      render: (row) => (row.is_visible ? 'Görünür' : 'Gizli'),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setMenus((prev) =>
              prev.map((item) =>
                item.id === row.id ? { ...item, is_visible: !item.is_visible } : item,
              ),
            );
          }}
        >
          Görünürlük
        </Button>
      ),
    },
  ];

  const footerColumns: AdminTableColumn<AdminMockFooterLink>[] = [
    { key: 'id', header: 'id', className: 'font-mono text-xs' },
    {
      key: 'group',
      header: 'group',
      render: (row) => ADMIN_FOOTER_GROUP_LABELS[row.group],
    },
    { key: 'label', header: 'label' },
    { key: 'href', header: 'href' },
    { key: 'order', header: 'order', className: 'tabular-nums' },
    {
      key: 'is_visible',
      header: 'is_visible',
      render: (row) => (row.is_visible ? 'Görünür' : 'Gizli'),
    },
    {
      id: 'actions',
      key: 'id',
      header: 'İşlemler',
      render: (row) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setFooter((prev) =>
              prev.map((item) =>
                item.id === row.id ? { ...item, is_visible: !item.is_visible } : item,
              ),
            );
          }}
        >
          Görünürlük
        </Button>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="İçerik Yönetimi (CMS)"
      description="Content Management — mock veri"
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {section !== 'seo' ? (
            <AdminSearch
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="İçerik ara…"
            />
          ) : null}
          {section === 'blog' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditingPost(null);
                setEditorOpen(true);
              }}
            >
              Oluştur
            </Button>
          ) : null}
          {toast ? <p className="text-sm text-primary">{toast}</p> : null}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_CONTENT_SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="text-left"
            onClick={() => {
              setSection(item.id);
              setPage(1);
              setQuery('');
            }}
          >
            <AdminReportCard
              title={item.label}
              description={section === item.id ? 'Aktif bölüm' : 'Bölüme geç'}
            >
              <p className="text-xs text-muted-foreground">Mock CMS</p>
            </AdminReportCard>
          </button>
        ))}
      </div>

      {section === 'blog' ? (
        <>
          <AdminTable columns={blogColumns} rows={pageSlice(filteredPosts)} />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}

      {section === 'help' ? (
        <>
          <AdminTable columns={helpColumns} rows={pageSlice(filteredHelp)} />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}

      {section === 'faq' ? (
        <>
          <AdminTable columns={faqColumns} rows={pageSlice(filteredFaqs)} />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}

      {section === 'announcements' ? (
        <>
          <AdminTable columns={announcementColumns} rows={pageSlice(filteredAnnouncements)} />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}

      {section === 'banners' ? (
        <>
          <AdminTable columns={bannerColumns} rows={pageSlice(filteredBanners)} />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}

      {section === 'menus' ? (
        <>
          <AdminTable columns={menuColumns} rows={pageSlice(filteredMenus)} />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}

      {section === 'footer' ? (
        <>
          <AdminTable columns={footerColumns} rows={pageSlice(filteredFooter)} />
          <AdminPagination page={pageSafe} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : null}

      {section === 'seo' ? (
        <AdminReportCard title="SEO ayarları" description="Site geneli meta (mock)">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ['title', 'title'],
                ['description', 'description'],
                ['keywords', 'keywords'],
                ['canonical_url', 'canonical_url'],
                ['robots', 'robots'],
                ['og_title', 'og_title'],
                ['og_description', 'og_description'],
                ['og_image', 'og_image'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2 sm:col-span-2">
                <Label htmlFor={`seo-${key}`}>{label}</Label>
                {key === 'description' || key === 'og_description' ? (
                  <Textarea
                    id={`seo-${key}`}
                    value={seo[key]}
                    onChange={(e) => setSeo({ ...seo, [key]: e.target.value })}
                    rows={2}
                  />
                ) : (
                  <Input
                    id={`seo-${key}`}
                    value={seo[key]}
                    onChange={(e) => setSeo({ ...seo, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              type="button"
              onClick={() => notify('SEO ayarları kaydedildi (mock)')}
            >
              Kaydet
            </Button>
          </div>
        </AdminReportCard>
      ) : null}

      <AdminBlogEditorDialog
        post={editingPost}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={saveBlog}
      />
    </AdminPageShell>
  );
}
