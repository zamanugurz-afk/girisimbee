'use client';

import React, { useState } from 'react';
import { Building2, Plus, Check, Sparkles, Globe, Briefcase } from 'lucide-react';
import { useActiveCompany } from '@/features/companies';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface CompanyIdentityDraft {
  mode: 'existing' | 'new' | 'personal';
  companyId?: string;
  newName?: string;
  newIndustry?: string;
  newWebsite?: string;
}

interface CompanyIdentitySelectorProps {
  categoryTitle: string;
  value: CompanyIdentityDraft;
  onChange: (value: CompanyIdentityDraft) => void;
  className?: string;
}

const POPULAR_INDUSTRIES = [
  'Yeme-İçme & Kafe',
  'Yazılım & Teknoloji',
  'E-Ticaret & Perakende',
  'Hizmet & Danışmanlık',
  'Üretim & Sanayi',
  'Eğitim & Sağlık',
  'Diğer',
];

export function CompanyIdentitySelector({
  categoryTitle,
  value,
  onChange,
  className,
}: CompanyIdentitySelectorProps) {
  const { userCompanies, activeCompany, isCompanyMode, switchToCompany } = useActiveCompany();
  const [showNewForm, setShowNewForm] = useState(value.mode === 'new');

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5 transition-all duration-300',
        value.mode === 'existing' || (isCompanyMode && value.mode !== 'personal')
          ? 'border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Building2 className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>İş Yeri / Girişim Kimliği</span>
              <span className="text-[10.5px] font-normal text-slate-400">({categoryTitle} için)</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              İlanınızın güven vermesi ve kurumsal görünmesi için iş yeri profiliyle eşleştirilir.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {value.mode === 'existing' && activeCompany && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10.5px] font-bold self-start sm:self-auto shadow-xs">
            <Check className="w-3 h-3" />
            {activeCompany.name} (Seçili)
          </span>
        )}
      </div>

      {/* 1. Seçenekler: Mevcut Şirketler veya Yeni Tanımlama */}
      <div className="space-y-3">
        {userCompanies.length > 0 && !showNewForm && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Kayıtlı İş Yerinizden Seçin:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {userCompanies.map((comp) => {
                const isSelected = value.companyId === comp.id || (activeCompany?.id === comp.id && value.mode !== 'personal');
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      switchToCompany(comp.id);
                      onChange({ mode: 'existing', companyId: comp.id });
                    }}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-bold">{comp.name}</p>
                      <p className="text-[10.5px] text-slate-400 truncate">@{comp.slug} · {comp.industry || 'İşletme'}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNewForm(true);
                onChange({ mode: 'new', newName: '', newIndustry: 'Yazılım & Teknoloji', newWebsite: '' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Farklı bir yeni iş yeri / marka tanımla</span>
            </button>
          </div>
        )}

        {/* 2. Yeni İş Yeri Hızlı Tanımlama Formu (Sadece 3 Alan) */}
        {(userCompanies.length === 0 || showNewForm) && (
          <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hızlı İş Yeri / Girişim Tanımla (20 Saniye)
              </span>
              {userCompanies.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    if (userCompanies[0]) {
                      onChange({ mode: 'existing', companyId: userCompanies[0].id });
                    }
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 underline cursor-pointer"
                >
                  Mevcut şirketime dön
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                  İş Yeri / Girişim / Marka Adı <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Örn: Kahve Durağı veya BeeSoft"
                  value={value.newName || ''}
                  onChange={(e) => onChange({ ...value, mode: 'new', newName: e.target.value })}
                  className="mt-1 h-9 text-xs rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                />
              </div>

              <div>
                <Label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                  Sektör / Faaliyet Alanı
                </Label>
                <select
                  value={value.newIndustry || POPULAR_INDUSTRIES[0]}
                  onChange={(e) => onChange({ ...value, mode: 'new', newIndustry: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {POPULAR_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                Web Sitesi veya Sosyal Medya <span className="text-[10px] text-slate-400 font-normal">(Opsiyonel)</span>
              </Label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="https://beesoft.co veya instagram.com/beesoft"
                  value={value.newWebsite || ''}
                  onChange={(e) => onChange({ ...value, mode: 'new', newWebsite: e.target.value })}
                  className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
