'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

interface UnifiedCockpitContextValue {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedSectorId: string;
  setSelectedSectorId: (sectorId: string) => void;
  selectedCategoryGroup: string;
  setSelectedCategoryGroup: (category: string) => void;
}

const UnifiedCockpitContext = createContext<UnifiedCockpitContextValue | undefined>(undefined);

export function UnifiedCockpitProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kadıköy');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('yazilim-ajans');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('Tümü');

  const value = useMemo(
    () => ({
      selectedCity,
      setSelectedCity,
      selectedDistrict,
      setSelectedDistrict,
      selectedSectorId,
      setSelectedSectorId,
      selectedCategoryGroup,
      setSelectedCategoryGroup,
    }),
    [selectedCity, selectedDistrict, selectedSectorId, selectedCategoryGroup],
  );

  return (
    <UnifiedCockpitContext.Provider value={value}>
      {children}
    </UnifiedCockpitContext.Provider>
  );
}

export function useUnifiedCockpit(): UnifiedCockpitContextValue {
  const context = useContext(UnifiedCockpitContext);
  if (!context) {
    // Graceful fallback if used outside Provider
    return {
      selectedCity: 'İstanbul',
      setSelectedCity: () => {},
      selectedDistrict: 'Kadıköy',
      setSelectedDistrict: () => {},
      selectedSectorId: 'yazilim-ajans',
      setSelectedSectorId: () => {},
      selectedCategoryGroup: 'Tümü',
      setSelectedCategoryGroup: () => {},
    };
  }
  return context;
}
