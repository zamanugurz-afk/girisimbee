import Link from 'next/link';
import { ArrowRight, Briefcase, CheckCircle2, UserRoundSearch } from 'lucide-react';
import {
  CAREER_FLOW_OPTIONS,
  CAREER_HUB_LANDING,
} from '@/components/girisimco/home/home-marketplace.data';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  JOB_HIRE_CARD_COLOR,
  JOB_SEEKER_CARD_COLOR,
} from '@/features/listings/utils/listing-card-display';
import { cn } from '@/lib/utils';

const FLOW_VISUAL = {
  seek: {
    color: JOB_SEEKER_CARD_COLOR,
    Icon: UserRoundSearch,
  },
  hire: {
    color: JOB_HIRE_CARD_COLOR,
    Icon: Briefcase,
  },
} as const;

export function CareerHubLanding() {
  return (
    <div className="gc-header-offset bg-[#FAFBFC] dark:bg-background">
      <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
            {CAREER_HUB_LANDING.badge}
          </Badge>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]">
            {CAREER_HUB_LANDING.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
            {CAREER_HUB_LANDING.description}
          </p>
        </header>

        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-5">
          {CAREER_FLOW_OPTIONS.map((option) => {
            const visual = FLOW_VISUAL[option.id];
            const Icon = visual.Icon;
            return (
              <Link
                key={option.id}
                href={option.href}
                className={cn(
                  'group flex h-full flex-col rounded-2xl border border-[#E6E8EE] bg-white p-5',
                  'transition duration-200 sm:p-7',
                  'hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1220]/20',
                  'dark:border-border dark:bg-card',
                )}
                style={{ borderColor: `${visual.color}40` }}
              >
                <div
                  className="flex h-24 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${visual.color}14` }}
                  aria-hidden
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    style={{ backgroundColor: visual.color }}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </span>
                </div>

                <h2 className="mt-5 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-[22px]">
                  {option.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
                  {option.description}
                </p>

                <ul className="mt-6 flex flex-col gap-4">
                  {option.benefits.map((benefit) => (
                    <li key={benefit.title} className="flex gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0"
                        style={{ color: visual.color }}
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm font-semibold leading-snug text-[#0B1220] dark:text-foreground">
                          {benefit.title}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-[#64748B]">
                          {benefit.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <span
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'mt-7 w-full hover:scale-100',
                  )}
                  style={{ backgroundColor: visual.color }}
                >
                  {option.label}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[13px] text-[#94A3B8] lg:mt-10">
          {CAREER_HUB_LANDING.trust}
        </p>
      </div>
    </div>
  );
}
