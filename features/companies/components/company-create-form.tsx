'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getCompanyService } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import {
  companyEditorSchema,
  COMPANY_SIZE_OPTIONS,
  suggestCompanySlug,
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

export function CompanyCreateForm() {
  const { user } = useAuth();
  const router = useRouter();
  const form = useForm<CompanyEditorForm>({
    resolver: zodResolver(companyEditorSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      industry: '',
      employeeCount: '',
      website: '',
      linkedInUrl: '',
      twitterUrl: '',
      city: '',
      location: '',
      country: 'TR',
      contactEmail: user?.email ?? '',
      logoUrl: null,
      coverUrl: null,
    },
  });

  async function onSubmit(values: CompanyEditorForm) {
    if (!user) return;
    try {
      const service = getCompanyService();
      const available = await service.isSlugAvailable(values.slug);
      if (!available) {
        form.setError('slug', { message: 'Bu kullanıcı adı zaten alınmış.' });
        return;
      }

      const company = await service.create({
        ownerId: user.id as UserId,
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
        contactEmail: values.contactEmail || user.email,
        logoUrl: values.logoUrl,
        coverUrl: values.coverUrl,
      });

      toast.success('Şirket oluşturuldu');
      router.push(`/company/${company.slug}/dashboard`);
    } catch (err) {
      if (err instanceof ValidationError && err.fieldErrors.slug) {
        form.setError('slug', { message: err.fieldErrors.slug[0] });
      } else {
        toast.error(err instanceof Error ? err.message : 'Şirket oluşturulamadı');
      }
    }
  }

  if (!user) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Şirket Adı</Label>
          <Input
            id="name"
            {...form.register('name')}
            onBlur={(e) => {
              if (!form.getValues('slug')) {
                form.setValue('slug', suggestCompanySlug(e.target.value));
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Kullanıcı Adı</Label>
          <Input id="slug" {...form.register('slug')} />
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Sektör</Label>
          <Input id="industry" {...form.register('industry')} />
        </div>
        <div className="space-y-2">
          <Label>Şirket Büyüklüğü</Label>
          <Select
            value={form.watch('employeeCount') || ''}
            onValueChange={(v) => form.setValue('employeeCount', v as CompanyEditorForm['employeeCount'])}
          >
            <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
            <SelectContent>
              {COMPANY_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="foundedYear">Kuruluş Yılı</Label>
          <Input id="foundedYear" type="number" {...form.register('foundedYear')} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Hakkında</Label>
          <Textarea id="description" rows={4} {...form.register('description')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" type="url" {...form.register('website')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedInUrl">LinkedIn</Label>
          <Input id="linkedInUrl" type="url" {...form.register('linkedInUrl')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterUrl">X (Twitter)</Label>
          <Input id="twitterUrl" type="url" {...form.register('twitterUrl')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Konum</Label>
          <Input id="location" {...form.register('location')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Şehir</Label>
          <Input id="city" {...form.register('city')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">İletişim E-postası</Label>
          <Input id="contactEmail" type="email" {...form.register('contactEmail')} />
        </div>
      </div>

      <Button type="submit" className="rounded-lg">Şirketi Oluştur</Button>
    </form>
  );
}
