'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Phone,
  MessageSquare,
  Mail,
  User,
  ShieldCheck,
  ArrowUpRight,
  Send,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';

export interface DirectContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  contactName?: string | null;
  contactRoleLabel?: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  listingId?: string | null;
  conversationId?: string | null;
}

export function DirectContactDialog({
  open,
  onOpenChange,
  title = 'İlan Sahibiyle İletişime Geç',
  subtitle = 'Doğrudan iletişim ve mesajlaşma seçenekleri:',
  contactName,
  contactRoleLabel = 'İletişim Yetkilisi',
  phone,
  whatsapp,
  email,
  listingId,
  conversationId,
}: DirectContactDialogProps) {
  const router = useRouter();

  const cleanPhone = phone ? phone.replace(/[^\d+]/g, '') : null;
  const rawWp = whatsapp || phone;
  const cleanWp = rawWp ? rawWp.replace(/\D/g, '') : null;

  const handleOpenInternalChat = () => {
    onOpenChange(false);
    if (conversationId) {
      router.push(`${DASHBOARD_ROUTES.mesajlarim}?c=${conversationId}`);
    } else if (listingId) {
      router.push(`${DASHBOARD_ROUTES.mesajlarim}?listing=${listingId}`);
    } else {
      router.push(DASHBOARD_ROUTES.mesajlarim);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[94vw] rounded-2xl p-5 sm:p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="text-left space-y-1 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400 pt-0.5 leading-normal">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 pt-2">
          {/* Yetkili Kişi Kartı */}
          {contactName && (
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-xs">
              <div className="w-7 h-7 rounded-lg bg-slate-200/70 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-zinc-300">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium leading-none mb-0.5">
                  {contactRoleLabel}
                </p>
                <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                  {contactName}
                </p>
              </div>
            </div>
          )}

          {/* 1. Telefon Görüşmesi */}
          {cleanPhone && (
            <a
              href={`tel:${cleanPhone}`}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 hover:border-emerald-400/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-700/60 transition-all duration-150 group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    Telefonla Ara
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    {phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span>Ara</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </a>
          )}

          {/* 2. WhatsApp Hattı */}
          {cleanWp && (
            <a
              href={`https://wa.me/${cleanWp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 hover:border-emerald-400/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-700/60 transition-all duration-150 group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    WhatsApp Başvuru & Sohbet
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    {whatsapp || phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <span>Yaz</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </a>
          )}

          {/* 3. Platform İçi Mesajlaşma (AYNI HİZALAMA VE YAPI) */}
          <button
            type="button"
            onClick={handleOpenInternalChat}
            className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 hover:border-indigo-400/80 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-700/60 transition-all duration-150 group shadow-xs cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Send className="h-4 w-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Platform Üzerinden Mesaj Gönder
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                  Girisimbee güvenli mesajlaşma kutusu
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <span>Mesaj Aç</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </button>

          {/* 4. E-posta İletişimi (varsa) */}
          {email && (
            <a
              href={`mailto:${email}`}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 hover:border-sky-400/80 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 dark:hover:border-sky-700/60 transition-all duration-150 group shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    E-posta ile İletişime Geç
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    {email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <span>Gönder</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </a>
          )}
        </div>

        {/* Alt Güvenlik Bildirimi */}
        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-400 dark:text-zinc-500 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Girişimbee güvencesiyle iletişim bilgileri anında açıktır.</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
