'use client';

import { motion } from 'framer-motion';
import {
  User,
  Star,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SellerDTO, AIAnalysisResponse, ProviderDTO } from '@/types';

interface SellerInfoProps {
  seller: SellerDTO | undefined;
  provider: ProviderDTO | null | undefined;
  analysis: AIAnalysisResponse | undefined;
}

export function SellerInfoCard({ seller, provider, analysis }: SellerInfoProps) {
  if (!seller) {
    return (
      <div className="ib-card p-5 text-sm text-muted-foreground">
        Satıcı bilgisi mevcut değil.
      </div>
    );
  }

  const trustScore = analysis?.seller_score ?? 50;
  const verified = seller.phone_verified || seller.email_verified;
  const memberYears = new Date().getFullYear() - (seller.member_since ?? new Date().getFullYear());

  const rows: Array<{ label: string; value: string; icon?: LucideIcon; tone?: string }> = [
    { label: 'Satıcı Adı', value: seller.display_name, icon: User },
    { label: 'Üyelik Tarihi', value: seller.member_since ? `${seller.member_since} (${memberYears} yıl)` : 'Bilinmiyor', icon: Calendar },
    { label: 'İlan Sayısı', value: String(seller.listing_count), icon: Package },
    { label: 'Değerlendirme', value: `${seller.rating.toFixed(1)} / 5.0`, icon: Star, tone: 'text-warning' },
    { label: 'Telefon Onayı', value: seller.phone_verified ? 'Onaylı' : 'Onaysız', icon: seller.phone_verified ? CheckCircle2 : XCircle, tone: seller.phone_verified ? 'text-success' : 'text-muted-foreground' },
    { label: 'E-posta Onayı', value: seller.email_verified ? 'Onaylı' : 'Onaysız', icon: seller.email_verified ? CheckCircle2 : XCircle, tone: seller.email_verified ? 'text-success' : 'text-muted-foreground' },
    { label: 'Güven Puanı', value: `${trustScore}/100`, icon: Shield, tone: trustScore >= 65 ? 'text-success' : trustScore >= 40 ? 'text-warning' : 'text-danger' },
    { label: 'Kaynak', value: provider?.name ?? 'Bilinmiyor', icon: Package },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <User className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Satıcı Bilgileri</h3>
          <p className="text-xs text-muted-foreground">Profıl ve güven detayları</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {seller.display_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold text-foreground">{seller.display_name}</p>
            {verified && (
              <span className="flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">
                <ShieldCheck className="h-3 w-3" />
                Onaylı
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {seller.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{seller.listing_count} ilan</span>
            <span>·</span>
            <span>{memberYears} yıl</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between rounded-lg border border-border bg-card/30 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {row.label}
              </span>
              <span className={cn('text-sm font-medium', row.tone ?? 'text-foreground')}>
                {row.value}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface SellerRiskProps {
  seller: SellerDTO | undefined;
  analysis: AIAnalysisResponse | undefined;
  listingCount: number;
}

export function SellerRiskAnalysis({ seller, analysis, listingCount }: SellerRiskProps) {
  const trustScore = analysis?.seller_score ?? 50;
  const trustLevel = trustScore >= 65 ? 'high' : trustScore >= 40 ? 'medium' : 'low';
  const riskLevel = analysis?.risk_level ?? (trustLevel === 'high' ? 'low' : trustLevel === 'medium' ? 'medium' : 'high');

  const trustMeta = {
    high: { label: 'Yüksek Güven', tone: 'text-success', bg: 'bg-success-soft', icon: ShieldCheck },
    medium: { label: 'Orta Güven', tone: 'text-warning', bg: 'bg-warning-soft', icon: Shield },
    low: { label: 'Düşük Güven', tone: 'text-danger', bg: 'bg-danger-soft', icon: ShieldAlert },
  };
  const meta = trustMeta[trustLevel];
  const TrustIcon = meta.icon;

  const flags: Array<{ label: string; value: string; level: 'green' | 'yellow' | 'red' }> = [];

  const memberYears = seller?.member_since ? new Date().getFullYear() - seller.member_since : 0;
  if (memberYears >= 3) flags.push({ label: 'Üyelik Süresi', value: `${memberYears} yıl`, level: 'green' });
  else if (memberYears >= 1) flags.push({ label: 'Üyelik Süresi', value: `${memberYears} yıl`, level: 'yellow' });
  else flags.push({ label: 'Üyelik Süresi', value: `${memberYears} yıl`, level: 'red' });

  if (listingCount >= 20) flags.push({ label: 'Önceki İlanlar', value: `${listingCount} ilan`, level: 'green' });
  else if (listingCount >= 5) flags.push({ label: 'Önceki İlanlar', value: `${listingCount} ilan`, level: 'yellow' });
  else flags.push({ label: 'Önceki İlanlar', value: `${listingCount} ilan`, level: 'red' });

  const descScore = analysis?.description_score ?? 50;
  if (descScore >= 70) flags.push({ label: 'Açıklama Kalitesi', value: `AI ${descScore}`, level: 'green' });
  else if (descScore >= 40) flags.push({ label: 'Açıklama Kalitesi', value: `AI ${descScore}`, level: 'yellow' });
  else flags.push({ label: 'Açıklama Kalitesi', value: `AI ${descScore}`, level: 'red' });

  const priceConsistency = analysis?.confidence ?? 50;
  if (priceConsistency >= 70) flags.push({ label: 'Fiyat Tutarlılığı', value: 'Tutarlı', level: 'green' });
  else if (priceConsistency >= 40) flags.push({ label: 'Fiyat Tutarlılığı', value: 'Orta', level: 'yellow' });
  else flags.push({ label: 'Fiyat Tutarlılığı', value: 'Tutarsız', level: 'red' });

  const levelColor: Record<string, string> = {
    green: 'text-success bg-success-soft',
    yellow: 'text-warning bg-warning-soft',
    red: 'text-danger bg-danger-soft',
  };

  const aiSummary = generateSellerSummary(seller, trustLevel, riskLevel, listingCount, analysis);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', meta.bg, meta.tone)}>
          <TrustIcon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Satıcı Risk Analizi</h3>
          <p className="text-xs text-muted-foreground">AI güven değerlendirmesi</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card/50 p-4">
        <div>
          <p className="text-xs text-muted-foreground">Güven Seviyesi</p>
          <p className={cn('mt-0.5 font-display text-xl font-bold', meta.tone)}>{meta.label}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xs text-muted-foreground">Risk Seviyesi</p>
          <p className={cn(
            'mt-0.5 flex items-center gap-1 font-display text-xl font-bold',
            riskLevel === 'low' ? 'text-success' : riskLevel === 'medium' ? 'text-warning' : 'text-danger',
          )}>
            {riskLevel === 'low' ? 'Düşük' : riskLevel === 'medium' ? 'Orta' : 'Yüksek'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {flags.map((flag) => (
          <div key={flag.label} className="flex items-center justify-between rounded-lg border border-border bg-card/30 px-3 py-2.5">
            <span className="text-sm text-muted-foreground">{flag.label}</span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', levelColor[flag.level])}>
              {flag.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-primary-soft/10 p-4">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Shield className="h-3.5 w-3.5" />
          AI Özeti
        </p>
        <p className="text-sm leading-relaxed text-foreground">{aiSummary}</p>
      </div>
    </motion.div>
  );
}

function generateSellerSummary(
  seller: SellerDTO | undefined,
  trustLevel: string,
  riskLevel: string,
  listingCount: number,
  analysis: AIAnalysisResponse | undefined,
): string {
  if (!seller) return 'Satıcı bilgisi mevcut değil.';
  const memberYears = new Date().getFullYear() - (seller.member_since ?? new Date().getFullYear());
  const verified = seller.phone_verified || seller.email_verified;

  let summary = `Satıcı ${seller.display_name}, ${memberYears} yıldır üye ve ${listingCount} ilan yayınlamış. `;
  summary += verified
    ? 'Telefon/e-posta doğrulaması tamamlanmış, güvenilirlik artıyor. '
    : 'Telefon/e-posta doğrulaması eksik, dikkatli olun. ';
  summary += `AI güven puanı ${analysis?.seller_score ?? 50}/100 — `;
  summary += trustLevel === 'high'
    ? 'yüksek güven seviyesi. '
    : trustLevel === 'medium'
    ? 'orta güven seviyesi. '
    : 'düşük güven seviyesi, riskli. ';
  summary += riskLevel === 'low'
    ? 'Genel risk düşük.'
    : riskLevel === 'medium'
    ? 'Orta düzey risk mevcut.'
    : 'Yüksek risk — dikkatli yaklaşın.';
  return summary;
}
