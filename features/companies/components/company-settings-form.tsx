'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
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
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

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
      toast.success('Şirket güncellendi');
      if (updated.slug !== slug) {
        router.push(`/company/${updated.slug}/settings`);
      }
      router.refresh();
    } catch (err) {
      if (err instanceof ValidationError && err.fieldErrors.slug) {
        form.setError('slug', { message: err.fieldErrors.slug[0] });
      } else {
        toast.error(err instanceof Error ? err.message : 'Güncelleme başarısız');
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company || !user) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <CompanyMediaField ownerId={user.id} kind="cover" label="Kapak" value={form.watch('coverUrl') ?? null} onChange={(url) => form.setValue('coverUrl', url)} />
      <CompanyMediaField ownerId={user.id} kind="logo" label="Logo" value={form.watch('logoUrl') ?? null} onChange={(url) => form.setValue('logoUrl', url)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Şirket Adı</Label>
          <Input
            lang="tr"
            spellCheck
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
          <Label>Kullanıcı Adı</Label>
          <Input {...form.register('slug')} />
        </div>
        <div className="space-y-2">
          <Label>Sektör</Label>
          <Input {...form.register('industry')} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Hakkında</Label>
          <Textarea rows={4} {...form.register('description')} />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input type="url" {...form.register('website')} />
        </div>
        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input type="url" {...form.register('linkedInUrl')} />
        </div>
        <div className="space-y-2">
          <Label>Şirket Büyüklüğü</Label>
          <Select value={form.watch('employeeCount') || ''} onValueChange={(v) => form.setValue('employeeCount', v as CompanyEditorForm['employeeCount'])}>
            <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
            <SelectContent>
              {COMPANY_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Kuruluş Yılı</Label>
          <Input type="number" {...form.register('foundedYear')} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" className="rounded-lg">Kaydet</Button>
        <Button type="button" variant="outline" className="rounded-lg" onClick={() => form.reset(toForm(company))}>
          İptal
        </Button>
      </div>

      {/* Tehlikeli Alan / Şirketi Sil */}
      <div className="mt-12 pt-8 border-t border-destructive/20 space-y-4">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6 space-y-3">
          <h3 className="text-base font-bold text-destructive flex items-center gap-2">
            <span>Tehlikeli Alan: Şirket Profilini Sil</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Bu şirket profilini kalıcı olarak silmek istediğinizden emin misiniz? Şirkete bağlı tüm aktif ilanlar ve bilgiler arşivlenecektir.
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="rounded-xl font-bold"
            onClick={async () => {
              if (!user || !company) return;
              const confirmed = window.confirm(`"${company.name}" adlı şirket profilini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
              if (!confirmed) return;

              try {
                await getCompanyService().delete(company.id, user.id as UserId);
                toast.success('Şirket profili başarıyla silindi.');
                router.push('/dashboard');
                router.refresh();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Şirket silinemedi.');
              }
            }}
          >
            Şirket Profilini Sil
          </Button>
        </div>
      </div>
    </form>
  );
}
