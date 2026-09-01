export type ApplicationChannel = 'Online Portal' | 'Fiziki Başvuru' | 'Noter / Odalar';
export type DocumentFormat = 'E-İmza' | 'Asıl Belge' | 'Noter Onaylı' | 'PDF';

export interface RequiredDocumentItem {
  name: string;
  format: DocumentFormat;
  isDownloadableTemplate?: boolean;
  templateFileName?: string;
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  institution: string; // Örn: TOBB / SAİK, Ticaret Sicil Müdürlüğü, Gelir İdaresi Başkanlığı, İlçe Belediyesi
  applicationChannel: ApplicationChannel;
  portalUrl?: string; // e-Devlet, MERSİS, SAİK, GİB Dijital Vergi Dairesi
  estimatedCost: number;
  durationDays: string;
  legalBasis: string;
  requiredDocuments: RequiredDocumentItem[];
  processGuide: string[];
  proTips?: string;
}

export interface StatutoryCapitalRequirement {
  amount: number;
  description: string;
  legalRef: string;
}

export interface SectorLegalRoadmap {
  sectorId: string;
  sectorName: string;
  emoji: string;
  categoryGroup: 'Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Zanaat';
  totalEstimatedLegalCost: number;
  estimatedTotalDays: string;
  statutoryCapitalRequirement: StatutoryCapitalRequirement;
  steps: ApplicationStep[];
}
