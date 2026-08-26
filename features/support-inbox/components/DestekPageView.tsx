'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, LifeBuoy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GirisimbeeLogo } from '@/components/girisimco/logo';
import { CONTACT_EMAILS } from '@/features/shared/constants/contact';
import { supportPublicApi } from '@/features/support-inbox/lib/support-inquiry-api';
import {
  SUPPORT_INQUIRY_SUBJECT_LABELS,
} from '@/features/support-inbox/constants/support-inquiry.constants';
import {
  SUPPORT_INQUIRY_SUBJECTS,
  type SupportInquirySubject,
} from '@/features/support-inbox/types/support-inquiry.types';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  subject: 'genel' as SupportInquirySubject,
  message: '',
};

export function DestekPageView() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { inquiry } = await supportPublicApi.submit({
        channel: 'support',
        subject: form.subject,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message,
      });
      setDoneId(inquiry.id);
      setForm(emptyForm);
      toast.success('Destek talebiniz alındı');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border-b border-border/60">
      <div className="relative overflow-hidden border-b border-border/60 bg-muted/20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-muted/30"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
            Destek
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            <span className="inline-flex items-center gap-0 align-middle">
              <GirisimbeeLogo />
            </span>{' '}
            destek ekibine yazın
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Formu doldurup gönderin; talep doğrudan yönetim paneline düşer. Outlook veya başka bir
            e-posta programı açmanız gerekmez.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        {doneId ? (
          <div className="rounded-2xl border border-border/80 bg-card p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden />
            <h2 className="mt-4 font-display text-xl font-semibold">Talebiniz alındı</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Yönetim ekibi inceleyecek. Gerekirse {CONTACT_EMAILS.support} üzerinden
              sizinle iletişime geçilecek.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button type="button" variant="outline" onClick={() => setDoneId(null)}>
                Yeni talep
              </Button>
              <Button asChild>
                <Link href={AUTH_ROUTES.home}>Ana sayfa</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad soyad</Label>
                <Input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (opsiyonel)</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Konu</Label>
                <Select
                  value={form.subject}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, subject: v as SupportInquirySubject }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_INQUIRY_SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SUPPORT_INQUIRY_SUBJECT_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mesaj</Label>
              <Textarea
                id="message"
                required
                minLength={20}
                rows={6}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Sorununuzu veya talebinizi kısaca yazın…"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {CONTACT_EMAILS.support}
              </p>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Gönderiliyor…' : 'Talebi gönder'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
