'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ADMIN_BLOG_STATUS_LABELS } from '@/features/admin/panel/constants/admin-content.constants';
import type {
  AdminBlogStatus,
  AdminMockBlogPost,
} from '@/features/admin/panel/types/admin-panel.types';

export type AdminBlogDraft = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  status: AdminBlogStatus;
};

const EMPTY_DRAFT: AdminBlogDraft = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author: '',
  status: 'draft',
};

export function AdminBlogEditorDialog({
  post,
  open,
  onOpenChange,
  onSave,
}: {
  post: AdminMockBlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: AdminBlogDraft, existingId: string | null) => void;
}) {
  const [draft, setDraft] = useState<AdminBlogDraft>(EMPTY_DRAFT);

  useEffect(() => {
    if (!open) return;
    if (post) {
      setDraft({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        author: post.author,
        status: post.status,
      });
    } else {
      setDraft(EMPTY_DRAFT);
    }
  }, [open, post]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{post ? 'Blog yazısını düzenle' : 'Blog yazısı oluştur'}</DialogTitle>
          <DialogDescription>Mock CMS — kalıcı kayıt yok</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Başlık</Label>
            <Input
              id="blog-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-slug">Slug</Label>
            <Input
              id="blog-slug"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-excerpt">Özet</Label>
            <Textarea
              id="blog-excerpt"
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-content">İçerik</Label>
            <Textarea
              id="blog-content"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-cover">Kapak görseli URL</Label>
            <Input
              id="blog-cover"
              value={draft.cover_image}
              onChange={(e) => setDraft({ ...draft, cover_image: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-author">Yazar</Label>
            <Input
              id="blog-author"
              value={draft.author}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Durum</Label>
            <Select
              value={draft.status}
              onValueChange={(value) =>
                setDraft({ ...draft, status: value as AdminBlogStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ADMIN_BLOG_STATUS_LABELS) as AdminBlogStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {ADMIN_BLOG_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            type="button"
            disabled={!draft.title.trim()}
            onClick={() => {
              onSave(draft, post?.id ?? null);
              onOpenChange(false);
            }}
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
