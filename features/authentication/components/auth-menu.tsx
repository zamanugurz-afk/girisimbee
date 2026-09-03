'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  Heart,
  Inbox,
  LayoutDashboard,
  LayoutList,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Store,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { getRoleLabel } from '@/features/authentication/constants/roles';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
import { roleTrace } from '@/features/authorization/lib/role-trace';
import { usePendingContactRequestCount } from '@/features/contact-requests/hooks/use-pending-contact-request-count';
import { useUnreadMessageCount } from '@/features/messaging/hooks/use-unread-message-count';
import { useActiveCompany } from '@/features/companies';
import { cn } from '@/lib/utils';

const ILETISIM_TALEPLERI_HREF = '/iletisim-talepleri';
const MESAJLARIM_HREF = '/mesajlarim';

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function AuthMenu() {
  const { user, isLoading, logout } = useAuth();
  const { menu } = useRbac();
  const {
    userCompanies,
    activeCompany,
    isCompanyMode,
    switchToCompany,
    switchToPersonal,
  } = useActiveCompany();
  const pendingContactCount = usePendingContactRequestCount();
  const { count: unreadMessages } = useUnreadMessageCount();
  const alertCount = pendingContactCount + unreadMessages;

  const displayRole = user ? (user.rawRole ?? user.role) : null;
  const roleLabel = user ? getRoleLabel(displayRole) : null;

  useEffect(() => {
    if (!user) return;
    roleTrace('AuthMenu:render', {
      email: user.email,
      role: user.role,
      rawRole: user.rawRole,
      displayRole,
      roleLabel,
    });
  }, [user, displayRole, roleLabel]);

  if (isLoading) {
    return <div className="hidden h-9 w-9 rounded-lg bg-muted sm:block" aria-hidden />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden rounded-xl border-border/80 bg-white text-xs font-semibold text-[#334155] hover:bg-muted/60 sm:inline-flex dark:bg-card dark:text-foreground h-9 px-3.5"
          asChild
        >
          <Link href={AUTH_ROUTES.login}>Giriş Yap</Link>
        </Button>
        <Button
          size="sm"
          className="hidden rounded-xl shadow-xs text-xs font-semibold sm:inline-flex h-9 px-3.5"
          asChild
        >
          <Link href={AUTH_ROUTES.register}>Kayıt Ol</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-xl border shadow-xs transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]',
            isCompanyMode
              ? 'border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/25'
              : 'border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:border-primary/40',
            alertCount > 0 && 'gc-avatar-pending-blink border-primary/50 ring-2 ring-primary/20',
          )}
          aria-label={
            isCompanyMode
              ? `İş Yeri Hesabı: ${activeCompany?.name}`
              : 'Kişisel Hesap Menüsü'
          }
        >
          <Avatar className="h-7 w-7 rounded-lg">
            {isCompanyMode ? (
              activeCompany?.logoUrl ? (
                <AvatarImage src={activeCompany.logoUrl} alt="" className="rounded-lg object-cover" />
              ) : (
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-[#00A86B] text-xs font-black text-white shadow-xs">
                  {initials(activeCompany?.name || 'Şirket', '')}
                </AvatarFallback>
              )
            ) : user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" className="rounded-lg object-cover" />
            ) : (
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-white dark:from-primary dark:to-primary/60">
                {initials(user.displayName, user.email)}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Business Mode Building Badge */}
          {isCompanyMode && (
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-[8px] text-white ring-2 ring-white dark:ring-zinc-900 shadow-xs">
              <Building2 className="w-2.5 h-2.5" />
            </span>
          )}

          {alertCount > 0 && !isCompanyMode ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-zinc-900 animate-pulse">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95">
        
        {/* ================= 1. AKTİF PROFİL BAŞLIĞI ================= */}
        {isCompanyMode && activeCompany ? (
          <div className="rounded-xl bg-emerald-500/10 p-2.5 dark:bg-emerald-950/30 mb-1 border border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                {activeCompany.logoUrl ? (
                  <AvatarImage src={activeCompany.logoUrl} alt="" className="rounded-lg object-cover" />
                ) : (
                  <AvatarFallback className="rounded-lg bg-emerald-600 text-xs font-black text-white">
                    {initials(activeCompany.name, '')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-black text-emerald-900 dark:text-emerald-300">
                    {activeCompany.name}
                  </p>
                  <span className="inline-flex items-center rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    İş Yeri Modu
                  </span>
                </div>
                <p className="truncate text-[10.5px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                  @{activeCompany.slug} · {activeCompany.industry || 'Girişim / İşletme'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-2.5 dark:bg-zinc-800/60 mb-1 border border-slate-100 dark:border-zinc-800">
            <Avatar className="h-9 w-9 shrink-0 rounded-lg">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" className="rounded-lg object-cover" />
              ) : null}
              <AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-white">
                {initials(user.displayName, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {user.displayName || user.email.split('@')[0]}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                {user.email}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  {roleLabel || 'Kişisel Profil'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. PROFİL DEĞİŞTİRME / CONTEXT SWITCHER ================= */}
        <div className="p-1 mb-1 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center justify-between">
            <span>Profil Geçişi</span>
            <Building2 className="w-3 h-3 text-slate-400" />
          </div>

          {/* Kişisel Profile Geçiş */}
          <button
            type="button"
            onClick={switchToPersonal}
            className={cn(
              'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              !isCompanyMode
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50'
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{user.displayName || 'Kişisel Profilim'}</span>
            </span>
            {!isCompanyMode && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          </button>

          {/* Şirketler Listesi */}
          {userCompanies.map((comp) => {
            const isSelected = activeCompany?.id === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => switchToCompany(comp.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition-all mt-0.5 cursor-pointer',
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-700'
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{comp.name}</span>
                </span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-400">Geç ➔</span>
                )}
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-zinc-800" />

        {/* ================= 3. ŞİRKET MODU MENÜSÜ / KİŞİSEL MENÜ ================= */}
        {isCompanyMode && activeCompany ? (
          <div className="space-y-0.5 py-1">
            <DropdownMenuItem asChild>
              <Link
                href={`/company/${activeCompany.slug}/dashboard`}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-500/10"
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Şirket Yönetim Paneli</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/company/${activeCompany.slug}/dashboard?tab=settings`}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <Settings className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <span>Şirket Bilgilerini Düzenle</span>
              </Link>
            </DropdownMenuItem>
          </div>
        ) : (
          <div className="space-y-0.5 py-1">
            <DropdownMenuItem asChild>
              <Link
                href={AUTH_ROUTES.dashboard}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
                <span>Panel & Genel Bakış</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/ilanlarim"
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <LayoutList className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <span>İlanlarım</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/favorilerim"
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <Heart className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                <span>Favorilerim</span>
              </Link>
            </DropdownMenuItem>
          </div>
        )}

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-zinc-800" />

        {/* ================= 4. MESAJLAR & BİLDİRİMLER ================= */}
        <div className="space-y-0.5 py-1">
          <DropdownMenuItem asChild>
            <Link
              href={MESAJLARIM_HREF}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <MessageSquare className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="flex-1">Mesajlarım</span>
              {unreadMessages > 0 ? (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              ) : null}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={ILETISIM_TALEPLERI_HREF}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Inbox className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="flex-1">İletişim Talepleri</span>
              {pendingContactCount > 0 ? (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                  {pendingContactCount}
                </span>
              ) : null}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/bildirimlerim"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Bell className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span>Bildirimlerim</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-zinc-800" />

        {/* ================= 5. HESAP AYARLARI & ÇIKIŞ ================= */}
        <div className="space-y-0.5 py-1">
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/ayarlar"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Settings className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span>Hesap Ayarları</span>
            </Link>
          </DropdownMenuItem>
          {menu.showAdminPanel && (
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/30"
              >
                <Shield className="h-4 w-4 text-purple-500 shrink-0" />
                <span>Yönetim Paneli</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-zinc-800" />

        {/* Footer: Çıkış */}
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

