'use client';

import { Settings, Moon, Sun, Monitor, Bell, Shield, Database, MapPin, Zap } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { SITE, OWNER_ROUTE } from '@/config/site';
import { toast } from 'sonner';
import { FadeIn } from '@/components/feedback/motion';
import { PROVIDERS, CATEGORIES, PRODUCT_MODELS } from '@/config/site';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Açık', icon: Sun },
    { value: 'dark', label: 'Koyu', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="Ayarlar"
        description="Uygulama tercihleri. Kimlik doğrulama modülerdir ve şu anda devre dışıdır — bu özel bir sahip aracıdır."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Ayarlar' }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FadeIn>
          <SectionCard title="Görünüm" description="Tema ve görüntü tercihleri" icon={theme === 'dark' ? Moon : Sun}>
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Tema</Label>
                <p className="mb-3 mt-1 text-xs text-muted-foreground">İkinciBazar sizin için nasıl görünsün.</p>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((t) => {
                    const active = theme === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                          active
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <t.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                <div>
                  <Label className="text-sm font-medium">Hareketi azalt</Label>
                  <p className="text-xs text-muted-foreground">Uygulama genelinde animasyonları en aza indir.</p>
                </div>
                <Switch onCheckedChange={(v) => toast(v ? 'Hareket azaltıldı açık' : 'Hareket azaltıldı kapalı')} />
              </div>
            </div>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.05}>
          <SectionCard title="Bildirimler" description="Hangi konularda uyarılmak istiyorsunuz" icon={Bell}>
            <div className="space-y-1">
              {[
                { label: 'Yeni mükemmel fırsatlar', desc: 'Piyasanın %12+ altında', on: true },
                { label: 'Fiyat düşüşleri', desc: 'Medyan %5+ düştüğünde', on: true },
                { label: 'Riskli ilanlar', desc: 'Yüksek satıcı riski işaretlendiğinde', on: true },
                { label: 'Senkron olayları', desc: 'Kaynak senkron başarısı veya hatası', on: false },
                { label: 'Günlük özet', desc: 'Her sabah özet e-postası', on: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between rounded-lg px-1 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.on} onCheckedChange={() => toast('Tercih kaydedildi')} />
                </div>
              ))}
            </div>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.1}>
          <SectionCard title="Konum ve kapsam" description="Mevcut izleme kapsamı" icon={MapPin}>
            <div className="space-y-3">
              <Row label="Şehir" value={SITE.city} badge="Kilitli" />
              <p className="text-xs text-muted-foreground">
                Mimari sınırsız şehri destekler. Bugün motor yalnızca İstanbul&apos;u izliyor — genişletmek bir yapılandırma değişikliği, kod değişikliği değil.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary" className="border-dashed">+ İstanbul</Badge>
                <Badge variant="outline" className="border-dashed text-muted-foreground">Ankara</Badge>
                <Badge variant="outline" className="border-dashed text-muted-foreground">İzmir</Badge>
                <Badge variant="outline" className="border-dashed text-muted-foreground">Bursa</Badge>
              </div>
            </div>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.15}>
          <SectionCard title="Güvenlik ve erişim" description="Özel sahip kimlik doğrulaması" icon={Shield}>
            <div className="space-y-3">
              <Row label="Erişim modu" value="Özel — gizli URL" badge="Aktif" tone="success" />
              <Row label="Sahip hesabı" value="1" />
              <Row label="Kimlik sağlayıcı" value="Yok (modüler)" badge="Gelecek" />
              <p className="text-xs text-muted-foreground">
                Kimlik doğrulama uygulamadan ayrıştırılmıştır. Hazır olduğunda, özellik koduna dokunmadan Supabase e-posta/şifre veya herhangi bir sağlayıcı eklenebilir.
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => toast('Henüz kimlik sağlayıcı yapılandırılmadı')}>
                Kimlik doğrulamayı yapılandır
              </Button>
            </div>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.2}>
          <SectionCard title="Veri ve kaynaklar" description="Motorun izlediği her şey" icon={Database}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Kategoriler" value={CATEGORIES.length} />
              <Stat label="Takip edilen model" value={PRODUCT_MODELS.length} />
              <Stat label="Aktif kaynak" value={PROVIDERS.length} />
              <Stat label="Senkron aralığı" value="15dk" />
            </div>
          </SectionCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <SectionCard title="Hakkında" description="Sistem bilgisi" icon={Zap}>
            <div className="space-y-2 text-sm">
              <Row label="Uygulama" value={SITE.name} />
              <Row label="Sürüm" value={SITE.version} badge="Özel" />
              <Row label="Alan" value={SITE.domain} />
              <Row label="Mod" value="Özel sahip aracı" />
              <p className="pt-2 text-xs text-muted-foreground">
                Türkiye&apos;nin en büyük ikinci el pazarına dönüşmek için tasarlandı. Bugün sizin özel yapay zeka alış asistanınız.
              </p>
            </div>
          </SectionCard>
        </FadeIn>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  badge,
  tone = 'muted',
}: {
  label: string;
  value: string;
  badge?: string;
  tone?: 'muted' | 'success';
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {badge && (
          <Badge variant="secondary" className={tone === 'success' ? 'border-success/30 bg-success-soft text-success' : ''}>
            {badge}
          </Badge>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
