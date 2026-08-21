export type CvSectionType =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'projects'
  | 'awards'
  | 'publications'
  | 'references'
  | 'contact'
  | 'sidebar'
  | 'unknown';

export type CvBlockType =
  | 'heading'
  | 'paragraph'
  | 'list_item'
  | 'table_cell'
  | 'sidebar_item'
  | 'header_noise'
  | 'footer_noise'
  | 'text';

export interface CvBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CvDocumentBlock {
  id: string;
  text: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontName?: string;
  isBold?: boolean;
  isItalic?: boolean;
  type?: CvBlockType;
  columnId?: number;
  sectionType?: CvSectionType;
  confidence?: number;
  rawTokens?: string[];
}

export interface CvColumnRegion {
  id: number;
  minX: number;
  maxX: number;
  isSidebar: boolean;
  blockCount: number;
}

export interface CvDocumentPage {
  pageNumber: number;
  width: number;
  height: number;
  blocks: CvDocumentBlock[];
  columns: CvColumnRegion[];
}

export interface CvDocumentModel {
  pages: CvDocumentPage[];
  fullText: string;
  readingOrderText: string;
  format: 'pdf' | 'docx' | 'txt';
  isMultiColumn: boolean;
  totalPages: number;
  metadata?: Record<string, any>;
}

export interface ExtractedFieldProvenance<T = any> {
  value: T;
  confidence: number;
  sourceSection: CvSectionType | string;
  evidenceSnippet: string;
  method: 'spatial_deterministic' | 'dictionary_lookup' | 'pattern_regex' | 'grounded_ai';
  page?: number;
  boundingBox?: CvBoundingBox;
}
