/**
 * Admin-managed playbooks: how each consent/permission is stored,
 * and how to retrieve documentary evidence when requested.
 */

export type ConsentProcedureCategory =
  | 'signup'
  | 'publish'
  | 'job_seeker'
  | 'cookie'
  | 'evidence';

export type ConsentProcedureStatus = 'active' | 'draft' | 'archived';

export type ConsentProcedureOwner = 'super_admin' | 'admin' | 'legal';

export interface ConsentRetentionProcedure {
  id: string;
  /** Stable business key — do not change casually (audit references). */
  code: string;
  title: string;
  category: ConsentProcedureCategory;
  /** Short legal/product summary. */
  summary: string;
  /** Hukuki dayanak (açık rıza, sözleşme, aydınlatma vb.). */
  legalBasis: string;
  /** Where the record lives (DB table, file, log). */
  storageLocation: string;
  /** Step-by-step how the system stores the permission. */
  storageProcedure: string;
  /** Retention rule in human language. */
  retentionPeriod: string;
  /** Step-by-step how an admin obtains evidence when asked. */
  retrievalProcedure: string;
  /** Primary admin UI path for retrieval. */
  retrievalAdminPath: string;
  /** Optional API endpoint for programmatic export. */
  retrievalApiPath: string;
  /** What the requester receives (PDF, JSON, screen export…). */
  evidenceFormat: string;
  /** Target response time in business hours. */
  slaHours: number;
  ownerRole: ConsentProcedureOwner;
  status: ConsentProcedureStatus;
  version: string;
  updatedAt: string;
  updatedBy: string | null;
}

export type ConsentProcedureDraft = Omit<
  ConsentRetentionProcedure,
  'id' | 'updatedAt' | 'updatedBy'
> & {
  id?: string;
};
