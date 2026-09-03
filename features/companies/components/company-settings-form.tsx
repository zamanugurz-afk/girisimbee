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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Bölüm 1: Medya & Görseller */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ImageIcon className="h-4 w-4 text-emerald-600" />
            <span>Görsel & Medya Ayarları</span>
          </div>
          <div className="space-y-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 p-4 border border-slate-100 dark:border-zinc-800">
            <CompanyMediaField
              ownerId={user.id}
              kind="cover"
              label="Kapak Görseli"
              value={form.watch('coverUrl') ?? null}
              onChange={(url) => form.setValue('coverUrl', url, { shouldDirty: true })}
            />
            <CompanyMediaField
              ownerId={user.id}
              kind="logo"
              label="Şirket Logosu"
              value={form.watch('logoUrl') ?? null}
              onChange={(url) => form.setValue('logoUrl', url, { shouldDirty: true })}
            />
          </div>
        </div>

        {/* Bölüm 2: Temel Şirket Bilgileri */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span>Temel Kurumsal Bilgiler</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 p-4 border border-slate-100 dark:border-zinc-800">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold">Resmi Şirket Ünvanı / Adı</Label>
              <Input
                lang="tr"
                spellCheck
                className="bg-white dark:bg-zinc-900"
                {...form.register('name')}
                onBlur={(e) => {
                  const corrected = autoCorrectTurkishText(e.target.value, 'title');
                  if (corrected !== e.target.value) {
                    form.setValue('name', corrected, { shouldDirty: true, shouldValidate: true });
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Kullanıcı Adı (Slug)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">@</span>
                <Input className="pl-7 font-mono bg-white dark:bg-zinc-900" {...form.register('slug')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Faaliyet Sektörü</Label>
              <Input className="bg-white dark:bg-zinc-900" placeholder="Örn: Yeme-İçme & Kafe" {...form.register('industry')} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold">Şirket Hakkında Açıklama</Label>
              <Textarea
                rows={4}
                className="bg-white dark:bg-zinc-900 resize-none"
                placeholder="Şirketinizin vizyonu, faaliyet alanı ve sunduğu fırsatlar..."
                {...form.register('description')}
              />
            </div>
          </div>
        </div>

        {/* Bölüm 3: İletişim & Sosyal Medya */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>İletişim & Sosyal Kanallar</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 p-4 border border-slate-100 dark:border-zinc-800">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Web Sitesi</Label>
              <Input type="url" className="bg-white dark:bg-zinc-900" placeholder="https://sirketiniz.com" {...form.register('website')} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Kurumsal İletişim E-Posta</Label>
              <Input type="email" className="bg-white dark:bg-zinc-900" placeholder="info@sirketiniz.com" {...form.register('contactEmail')} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Şehir / Lokasyon</Label>
              <Input className="bg-white dark:bg-zinc-900" placeholder="Örn: İstanbul, Kadıköy" {...form.register('city')} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">LinkedIn Profil / Sayfa</Label>
              <Input type="url" className="bg-white dark:bg-zinc-900" placeholder="https://linkedin.com/company/..." {...form.register('linkedInUrl')} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Şirket Büyüklüğü (Çalışan Sayısı)</Label>
              <Select
                value={form.watch('employeeCount') || ''}
                onValueChange={(v) => form.setValue('employeeCount', v as CompanyEditorForm['employeeCount'], { shouldDirty: true })}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-900">
                  <SelectValue placeholder="Çalışan aralığı seçin" />
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

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Kuruluş Yılı</Label>
              <Input type="number" className="bg-white dark:bg-zinc-900" placeholder="Örn: 2021" {...form.register('foundedYear')} />
            </div>
          </div>
        </div>

        {/* Kaydet & İptal Eylemleri */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl font-medium"
            onClick={() => form.reset(toForm(company))}
          >
            Vazgeç / Sıfırla
          </Button>
        </div>

        {/* Bölüm 4: Tehlikeli Bölge / Şirket Bilgilerini Sil */}
        <div className="mt-10 pt-8 border-t border-destructive/20 space-y-4">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-destructive">
                  Tehlikeli Alan: Şirket Profilini ve Bilgilerini Sil
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  <strong>"{company.name}"</strong> kurumsal profilini kalıcı olarak silmek istediğinizden emin misiniz? Şirkete bağlı tüm açık iş ilanları yayından kaldırılacak ve şirket vitrini tamamen silinecektir. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="rounded-xl font-bold gap-1.5 shadow-xs"
              >
                <Trash2 className="h-4 w-4" />
                <span>Şirket Profilini ve Bilgilerini Sil</span>
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
