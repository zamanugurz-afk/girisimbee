'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Company } from '@/features/companies/types/company.types';
import { getCompanyService } from '@/lib/persistence/container';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import type { UserId } from '@/lib/domain/ids';
import { toast } from 'sonner';

interface ActiveCompanyContextValue {
  userCompanies: Company[];
  activeCompanyId: string | null;
  activeCompany: Company | null;
  isCompanyMode: boolean;
  isLoading: boolean;
  switchToCompany: (companyId: string) => void;
  switchToPersonal: () => void;
  refreshCompanies: () => Promise<void>;
}

const ActiveCompanyContext = createContext<ActiveCompanyContextValue | null>(null);

const STORAGE_KEY = 'girisimbee_active_company_id';

export function ActiveCompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load companies for the authenticated user
  const loadUserCompanies = useCallback(async () => {
    if (!user) {
      setUserCompanies([]);
      setActiveCompanyId(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const service = getCompanyService();
      let list = await service.listForUser(user.id as UserId);

      // Bootstrap sample company if user has none
      if (list.length === 0) {
        try {
          const sample = await service.create({
            ownerId: user.id as UserId,
            name: 'Kahve Durağı A.Ş.',
            slug: 'kahve-duragi',
            description: '3. Nesil Nitelikli Kahve & Franchise Ağı',
            industry: 'Yeme-İçme & Kafe',
            employeeCount: '11-50',
            foundedYear: 2021,
            city: 'İstanbul',
            country: 'TR',
            contactEmail: user.email,
            website: 'https://kahveduragi.com',
          });
          list = [sample];
        } catch {
          list = await service.listForUser(user.id as UserId);
        }
      }

      setUserCompanies(list);

      // Check stored preference
      const storedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (storedId && list.some((c) => c.id === storedId)) {
        setActiveCompanyId(storedId);
      } else {
        setActiveCompanyId(null);
      }
    } catch (err) {
      console.warn('Failed to load user companies:', err);
      setUserCompanies([]);
      setActiveCompanyId(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserCompanies();
  }, [loadUserCompanies]);

  const switchToCompany = useCallback(
    (companyId: string) => {
      const target = userCompanies.find((c) => c.id === companyId);
      if (target) {
        setActiveCompanyId(companyId);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, companyId);
        }
        toast.success(`🏢 ${target.name} (İş Yeri Profili Moduna Geçildi)`);
      }
    },
    [userCompanies]
  );

  const switchToPersonal = useCallback(() => {
    setActiveCompanyId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    toast.info('👤 Kişisel Profil Moduna Geçildi');
  }, []);

  const activeCompany = useMemo(() => {
    if (!activeCompanyId) return null;
    return userCompanies.find((c) => c.id === activeCompanyId) || null;
  }, [activeCompanyId, userCompanies]);

  const value = useMemo(
    () => ({
      userCompanies,
      activeCompanyId,
      activeCompany,
      isCompanyMode: !!activeCompany,
      isLoading,
      switchToCompany,
      switchToPersonal,
      refreshCompanies: loadUserCompanies,
    }),
    [userCompanies, activeCompanyId, activeCompany, isLoading, switchToCompany, switchToPersonal, loadUserCompanies]
  );

  return <ActiveCompanyContext.Provider value={value}>{children}</ActiveCompanyContext.Provider>;
}

export function useActiveCompany(): ActiveCompanyContextValue {
  const context = useContext(ActiveCompanyContext);
  if (!context) {
    throw new Error('useActiveCompany must be used within an ActiveCompanyProvider');
  }
  return context;
}
