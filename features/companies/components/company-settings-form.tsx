'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Loader2,
  Trash2,
  AlertTriangle,
  Building2,
  ImageIcon,
  Globe,
  Share2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useActiveCompany } from '@/features/companies/context/active-company-context';
import { getCompanyService } from '@/lib/persistence/container';
import type { Company } from '@/features/companies/types/company.types';
import type { UserId } from '@/lib/domain/ids';
import {
  companyEditorSchema,
  COMPANY_SIZE_OPTIONS,
  type CompanyEditorForm,
} from '@/features/companies/validation/company-editor.schema';
import { CompanyMediaField } from '@/features/companies/components/company-media-field';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ValidationError } from '@/lib/domain/errors';
import { autoCorrectTurkishText } from '@/features/listings/lib/turkish-text-autocorrect';

interface CompanySettingsFormProps {
  slug: string;
}

function toForm(company: Company): CompanyEditorForm {
  return {
    name: company.name,
    slug: company.slug,
    description: company.description ?? '',
    industry: company.industry ?? '',
    employeeCount: company.employeeCount ?? '',
    foundedYear: company.foundedYear ?? undefined,
    website: company.website ?? '',
    linkedInUrl: company.linkedInUrl ?? '',
    twitterUrl: company.twitterUrl ?? '',
    city: company.city ?? '',
    location: company.location ?? '',
    country: company.country,
    contactEmail: company.contactEmail ?? '',
    logoUrl: company.logoUrl,
    coverUrl: company.coverUrl,
  };
}

export function CompanySettingsForm({ slug }: CompanySettingsFormProps) {
  const { user } = useAuth();
  const { switchToPersonal, refreshCompanies } = useActiveCompany();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CompanyEditorForm>({
    resolver: zodResolver(companyEditorSchema),
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const existing = await getCompanyService().getBySlug(slug);
      if (existing) {
        setCompany(existing);
        form.reset(toForm(existing));
      }
      setLoading(false);
    }
    void load();
  }, [slug, form]);

  async function onSubmit(values: CompanyEditorForm) {
    if (!user || !company) return;
    try {
      setSaving(true);
      const updated = await getCompanyService().update(company.id, user.id as UserId, {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        industry: values.industry || null,
        employeeCount: values.employeeCount || null,
        foundedYear: values.foundedYear ?? null,
        website: values.website || null,
        linkedInUrl: values.linkedInUrl || null,
        twitterUrl: values.twitterUrl || null,
        city: values.city || null,
        location: values.location || null,
        country: values.country,
        contactEmail: values.contactEmail || null,
        logoUrl: values.logoUrl,
        coverUrl: values.coverUrl,
      });
      toast.success('Şirket bilgileri başarıyla güncellendi.');
      await refreshCompanies();
      if (updated.slug !== slug) {
        router.push(`/company/${updated.slug}/dashboard?tab=settings`);
      }
      router.refresh();
    } catch (err) {
      if (err instanceof ValidationError && err.fieldErrors.slug) {
        form.setError('slug', { message: err.fieldErrors.slug[0] });
      } else {
        toast.error(err instanceof Error ? err.message : 'Güncelleme başarısız oldu.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCompany() {
    if (!user || !company) return;
    try {
      setIsDeleting(true);
      await getCompanyService().delete(company.id, user.id as UserId);

      if (typeof window !== 'undefined') {
        localStorage.setItem('girisimbee_companies_seeded', 'true');
        localStorage.removeItem('girisimbee_active_company_id');
      }

      switchToPersonal();
      await refreshCompanies();
      toast.success(`"${company.name}" şirket profili ve tüm kurumsal bilgileri başarıyla silindi.`);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Şirket silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!company || !user) return null;

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Üst Bar: Aksiyon Butonları Doğrudan En Üstte de Görünür */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-foreground">Şirket Profilini ve Bilgilerini Düzenle</h2>
            <p className="text-xs text-muted-foreground">Tüm alanlar doğrudan kaydedilir ve kurumsal vitrinde anında güncellenir.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl h-8 text-xs font-medium"
              onClick={() => form.reset(toForm(company))}
            >
              Sıfırla
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="rounded-xl h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </Button>
          </div>
        </div>

        {/* 2 Kolonlu Kompakt Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          
          {/* SOL KOLON: Görseller + Temel Kimlik */}
          <div className="space-y-3">
            {/* Görseller: Logo + Kapak Yan Yana */}
            <div className="rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 p-3.5 border border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>Görsel & Medya Ayarları</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                <CompanyMediaField
                  ownerId={user.id}
                  kind="logo"
                  label="Şirket Logosu"
                  compact
                  value={form.watch('logoUrl') ?? null}
                  onChange={(url) => form.setValue('logoUrl', url, { shouldDirty: true })}
                />
                <CompanyMediaField
                  ownerId={user.id}
                  kind="cover"
                  label="Kapak Görseli"
                  compact
                  value={form.watch('coverUrl') ?? null}
                  onChange={(url) => form.setValue('coverUrl', url, { shouldDirty: true })}
                />
              </div>
            </div>

            {/* Temel Kurumsal Bilgiler */}
            <div className="rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 p-3.5 border border-slate-100 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Temel Kurumsal Bilgiler</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Resmi Şirket Ünvanı / Adı</Label>
                  <Input
                    lang="tr"
                    spellCheck
                    className="h-8 text-xs bg-white dark:bg-zinc-900"
                    {...form.register('name')}
                    onBlur={(e) => {
                      const corrected = autoCorrectTurkishText(e.target.value, 'title');
                      if (corrected !== e.target.value) {
                        form.setValue('name', corrected, { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Kullanıcı Adı (Slug)</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-muted-foreground font-mono">@</span>
                    <Input className="h-8 pl-6 text-xs font-mono bg-white dark:bg-zinc-900" {...form.register('slug')} />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Faaliyet Sektörü</Label>
                  <Input className="h-8 text-xs bg-white dark:bg-zinc-900" placeholder="Örn: E-ticaret" {...form.register('industry')} />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Şehir / Lokasyon</Label>
                  <Input className="h-8 text-xs bg-white dark:bg-zinc-900" placeholder="Örn: İstanbul" {...form.register('city')} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Şirket Hakkında Kısa Açıklama</Label>
                <Textarea
                  rows={2}
                  className="text-xs bg-white dark:bg-zinc-900 resize-none min-h-[48px]"
                  placeholder="Şirketinizin vizyonu ve faaliyet alanı..."
                  {...form.register('description')}
                />
              </div>
            </div>
          </div>

          {/* SAĞ KOLON: İletişim, Kanallar & Eylemler */}
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 p-3.5 border border-slate-100 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Globe className="h-3.5 w-3.5 text-emerald-600" />
                <span>İletişim & Sosyal Kanallar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Kurumsal Web Sitesi</Label>
                  <Input type="url" className="h-8 text-xs bg-white dark:bg-zinc-900" placeholder="https://..." {...form.register('website')} />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Kurumsal İletişim E-Posta</Label>
                  <Input type="email" className="h-8 text-xs bg-white dark:bg-zinc-900" placeholder="info@..." {...form.register('contactEmail')} />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">LinkedIn Profil / Sayfa</Label>
                  <Input type="url" className="h-8 text-xs bg-white dark:bg-zinc-900" placeholder="https://linkedin.com/..." {...form.register('linkedInUrl')} />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Çalışan Sayısı</Label>
                  <Select
                    value={form.watch('employeeCount') || ''}
                    onValueChange={(v) => form.setValue('employeeCount', v as CompanyEditorForm['employeeCount'], { shouldDirty: true })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white dark:bg-zinc-900">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Kuruluş Yılı</Label>
                  <Input type="number" className="h-8 text-xs bg-white dark:bg-zinc-900" placeholder="Örn: 2021" {...form.register('foundedYear')} />
                </div>
              </div>
            </div>

            {/* Alt Eylem ve Güvenlik / Tehlikeli Alan Bloğu */}
            <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3.5 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Kayıt & Güvenlik:</span> Değişiklikleri kaydettiğinizde vitrin anında yenilenir.
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-7 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Şirketi Sil
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Şirket Silme Onay Modalı (AlertDialog) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Şirket Profilini Kalıcı Olarak Sil?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">"{company.name}"</strong> kurumsal profili, tüm ekip bağlantıları ve şirket adına açılan ilanlar kalıcı olarak silinecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl font-medium" disabled={isDeleting}>
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteCompany();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold gap-1.5"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span>Evet, Şirket Profilini Sil</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
