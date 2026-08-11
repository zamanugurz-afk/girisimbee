import Link from 'next/link';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import {
  checkLegalConfiguration,
  containsLegalPlaceholder,
  isLegalPublicPublishAllowed,
} from '@/features/legal/config/legal-launch-gate';
import type { LegalDocumentBody } from '@/features/legal/lib/legal-document.utils';
import { materializeDocument } from '@/features/legal/lib/legal-document.utils';
import { cn } from '@/lib/utils';

export function LegalDocumentView({
  body,
  className,
}: {
  body: LegalDocumentBody;
  className?: string;
}) {
  const doc = materializeDocument(body);
  const publishAllowed = isLegalPublicPublishAllowed();
  const launch = checkLegalConfiguration();
  const flattened = [doc.intro ?? '', ...doc.sections.flatMap((s) => s.paragraphs)].join('\n');
  const hasPlaceholders = containsLegalPlaceholder(flattened);

  if (!publishAllowed) {
    return (
      <div className={cn('mx-auto w-full max-w-3xl px-4 py-10 sm:px-6', className)}>
        <header className="mb-8 space-y-3 border-b border-border/80 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <BrandWordmark className="text-base" />
            <span>· Ana sayfa</span>
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">{doc.meta.title}</h1>
        </header>
        <div
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-5 text-sm"
        >
          <p className="font-medium">LEGAL_CONFIGURATION_INCOMPLETE</p>
          <p className="mt-2 text-muted-foreground">
            Şirket bilgileri merkezi config üzerinden tamamlanmadan bu hukuki metin production
            ortamında yayınlanamaz. Lütfen daha sonra tekrar deneyin veya destek ile iletişime
            geçin.
          </p>
          {launch.missingCompanyFields.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Bekleyen alanlar: {launch.missingCompanyFields.join(', ')}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('mx-auto w-full max-w-3xl px-4 py-10 sm:px-6', className)}>
      <header className="mb-8 space-y-3 border-b border-border/80 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <BrandWordmark className="text-base" />
          <span>· Ana sayfa</span>
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {doc.meta.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Sürüm {doc.meta.version} · Yürürlük {doc.meta.effectiveDate} · Son güncelleme{' '}
          {doc.meta.lastUpdated}
        </p>
      </header>

      {!launch.flags.companyProfileCompleteFlag || hasPlaceholders ? (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
        >
          <p className="font-medium">Yasal yapılandırma tamamlanmadı (geliştirme / önizleme)</p>
          <p className="mt-1 text-muted-foreground">
            Şirket sicil bilgileri henüz merkezi config’e girilmemiştir. Production yayını için
            LEGAL_CONFIGURATION_INCOMPLETE giderilmelidir.
          </p>
          {launch.missingCompanyFields.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Eksik alanlar: {launch.missingCompanyFields.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}

      {doc.intro ? (
        <p className="mb-8 text-[15px] leading-relaxed text-foreground/90">{doc.intro}</p>
      ) : null}

      <div className="space-y-8">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[15px] leading-relaxed text-foreground/90">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
