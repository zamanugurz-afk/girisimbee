/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE: EVIDENCE GRAPH & FIREWALL SYSTEM
 * 
 * Provides an explicit provenance graph (DAG) where every extracted entity
 * (Candidate Name, Role, Sector, Experience, Education, Skills, Tools, Languages, References)
 * is represented as an Evidence Node with ground-truth snippets, source sections,
 * confidence weights, and strict cross-domain firewall boundary validations.
 * 
 * CORE PRINCIPLE: ZERO HALLUCINATION — NO EVIDENCE, NO ENTITY.
 */

import type { CvSectionType, CvDocumentModel } from './cv-document-model';
import type {
  AiCvExtractionPayload,
  RawExtractedExperience,
  RawExtractedEducation,
  ExtractedContactInfo,
} from './cv.types';
import { normalizeTrUniversal } from './cv-universal-normalizer';

export type EvidenceNodeType =
  | 'CANDIDATE_NAME'
  | 'PRIMARY_ROLE'
  | 'PRIMARY_SECTOR'
  | 'EXPERIENCE_RECORD'
  | 'EDUCATION_RECORD'
  | 'PROFESSIONAL_SKILL'
  | 'TECHNICAL_SKILL'
  | 'TOOL'
  | 'LANGUAGE'
  | 'CERTIFICATION'
  | 'REFERENCE_RECORD'
  | 'LOCATION'
  | 'CONTACT_INFO';

export type EvidenceConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRESOLVED';

export type EvidenceNodeStatus =
  | 'active'
  | 'blocked_by_firewall'
  | 'superseded'
  | 'reconciled';

export interface EvidenceNode<T = any> {
  id: string;
  type: EvidenceNodeType;
  value: T;
  sourceSection: CvSectionType | string;
  rawSnippet: string;
  confidence: EvidenceConfidenceLevel;
  confidenceScore: number; // 0.0 to 1.0
  resolver: string;
  status: EvidenceNodeStatus;
  firewallBlockReason?: string;
  page?: number;
  metadata?: Record<string, any>;
}

export type EvidenceEdgeRelationship =
  | 'supports'
  | 'derived_from'
  | 'conflicts_with'
  | 'prohibited_contamination';

export interface EvidenceEdge {
  sourceId: string;
  targetId: string;
  relationship: EvidenceEdgeRelationship;
  description?: string;
}

export interface FirewallViolation {
  nodeId: string;
  nodeType: EvidenceNodeType;
  sourceSection: string;
  value: any;
  reason: string;
}

export interface CvEvidenceGraphSummary {
  totalNodes: number;
  activeNodes: number;
  blockedNodes: number;
  firewallViolationCount: number;
}

export class CvEvidenceGraph {
  private nodes: Map<string, EvidenceNode> = new Map();
  private edges: EvidenceEdge[] = [];
  private violations: FirewallViolation[] = [];

  constructor() {}

  /**
   * Adds an evidence node with strict validation against cross-contamination rules.
   */
  addNode(node: EvidenceNode): EvidenceNode {
    // Run Cross-Contamination Firewall inspection
    const violationReason = this.inspectFirewall(node);
    if (violationReason) {
      node.status = 'blocked_by_firewall';
      node.firewallBlockReason = violationReason;
      this.violations.push({
        nodeId: node.id,
        nodeType: node.type,
        sourceSection: String(node.sourceSection),
        value: node.value,
        reason: violationReason,
      });
    }

    this.nodes.set(node.id, node);
    return node;
  }

  addEdge(edge: EvidenceEdge): void {
    this.edges.push(edge);
  }

  getNode(id: string): EvidenceNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): EvidenceNode[] {
    return Array.from(this.nodes.values());
  }

  getActiveNodes(): EvidenceNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.status === 'active');
  }

  getActiveNodesByType<T = any>(type: EvidenceNodeType): EvidenceNode<T>[] {
    return Array.from(this.nodes.values()).filter(
      (n) => n.type === type && n.status === 'active',
    ) as EvidenceNode<T>[];
  }

  getFirewallViolations(): FirewallViolation[] {
    return [...this.violations];
  }

  getSummary(): CvEvidenceGraphSummary {
    const all = Array.from(this.nodes.values());
    const active = all.filter((n) => n.status === 'active');
    const blocked = all.filter((n) => n.status === 'blocked_by_firewall');

    return {
      totalNodes: all.length,
      activeNodes: active.length,
      blockedNodes: blocked.length,
      firewallViolationCount: this.violations.length,
    };
  }

  /**
   * Cross-Contamination Firewall Rules:
   * Enforces mathematical boundary isolation between semantic domains.
   */
  private inspectFirewall(node: EvidenceNode): string | null {
    const sectionNorm = normalizeTrUniversal(String(node.sourceSection || ''));
    const rawNorm = normalizeTrUniversal(String(node.rawSnippet || ''));
    const valNorm = typeof node.value === 'string' ? normalizeTrUniversal(node.value) : '';

    // RULE 1: Education -> Sector Firewall
    // Education text / degrees (e.g. "Kamu Yönetimi", "Turizm İşletmeciliği") must NEVER produce sector evidence
    if (node.type === 'PRIMARY_SECTOR') {
      if (
        sectionNorm.includes('egitim') ||
        sectionNorm.includes('education') ||
        sectionNorm.includes('academic') ||
        sectionNorm.includes('ogrenim') ||
        sectionNorm.includes('referans') ||
        sectionNorm.includes('reference') ||
        sectionNorm.includes('diller') ||
        sectionNorm.includes('languages') ||
        sectionNorm.includes('sertifika') ||
        sectionNorm.includes('hobiler')
      ) {
        return 'EDUCATION_OR_NON_EMPLOYMENT_SECTOR_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 2: References -> Candidate Identity Firewall
    // Referee names, referee phones/emails or titles must NEVER produce candidate identity
    if (node.type === 'CANDIDATE_NAME' || node.type === 'CONTACT_INFO') {
      if (sectionNorm.includes('referans') || sectionNorm.includes('reference')) {
        return 'REFERENCE_CANDIDATE_IDENTITY_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 3: Skills / Proficiency -> Role Firewall
    // Standalone skill proficiencies ("- Uzman", "İleri") or skill lines must NEVER become primary role
    if (node.type === 'PRIMARY_ROLE') {
      if (
        sectionNorm.includes('beceri') ||
        sectionNorm.includes('yetkinlik') ||
        sectionNorm.includes('skill') ||
        sectionNorm.includes('egitim') ||
        sectionNorm.includes('education') ||
        sectionNorm.includes('referans')
      ) {
        return 'NON_EMPLOYMENT_ROLE_CONTAMINATION_PROHIBITED';
      }

      const genericProficiencies = new Set(['uzman', 'yonetici', 'direktor', 'manager', 'senior', 'junior', 'specialist', 'leader', 'danisman']);
      if (genericProficiencies.has(valNorm) && node.confidence !== 'HIGH') {
        return 'STANDALONE_GENERIC_PROFICIENCY_ROLE_PROHIBITED';
      }
    }

    // RULE 4: Company -> Role Firewall
    // Company names (e.g. "Doktor Takvimi A.Ş.", "Müdürlük A.Ş.") must not be extracted as role titles
    if (node.type === 'PRIMARY_ROLE') {
      const isPureCompanySuffix = /\b(?:a\.ş\.?|a\.s\.?|ltd\.?|şti\.?|sti\.?|holding|anonim\s*şirketi|anonim\s*sirketi)\b/i.test(node.rawSnippet || '');
      if (isPureCompanySuffix) {
        return 'COMPANY_NAME_ROLE_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 5: City / Country / Language / University / Section Heading -> Name Firewall
    if (node.type === 'CANDIDATE_NAME') {
      const forbiddenNameTokens = new Set([
        'egitim', 'deneyim', 'is deneyimi', 'beceriler', 'yetkinlikler',
        'referanslar', 'diller', 'yabanci dil', 'projeler', 'yayinlar',
        'sertifikalar', 'hobiler', 'ozgecmis', 'cv', 'resume',
        'curriculum vitae', 'profile', 'summary', 'hakkimda',
        'trabzon', 'istanbul', 'ankara', 'izmir', 'bursa', 'antalya',
        'turkiye', 'ingilizce', 'almanca', 'fransizca', 'ispanyolca',
        'universite', 'universitesi', 'fakulte', 'fakultesi', 'enstitu', 'okulu'
      ]);

      if (forbiddenNameTokens.has(valNorm) || forbiddenNameTokens.has(rawNorm)) {
        return 'FORBIDDEN_HEADING_OR_KEYWORD_NAME_CONTAMINATION_PROHIBITED';
      }

      if (/\b(?:universite|universitesi|fakulte|fakultesi|enstitu|enstitusu|lisesi|koleji)\b/i.test(valNorm)) {
        return 'UNIVERSITY_NAME_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 6: Skill -> Experience Firewall
    if (node.type === 'EXPERIENCE_RECORD') {
      if (sectionNorm.includes('beceri') || sectionNorm.includes('skill') || sectionNorm.includes('yetkinlik')) {
        return 'SKILL_EXPERIENCE_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 7: Certification -> Role Firewall
    if (node.type === 'PRIMARY_ROLE') {
      if (sectionNorm.includes('sertifika') || sectionNorm.includes('certificate') || sectionNorm.includes('kurs')) {
        return 'CERTIFICATION_ROLE_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 8: Hobby -> Professional Skill Firewall
    if (node.type === 'PROFESSIONAL_SKILL' || node.type === 'TECHNICAL_SKILL') {
      if (sectionNorm.includes('hobi') || sectionNorm.includes('hobby') || sectionNorm.includes('ilgi alani')) {
        return 'HOBBY_SKILL_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 9: Publication -> Experience Firewall
    if (node.type === 'EXPERIENCE_RECORD') {
      if (sectionNorm.includes('yayin') || sectionNorm.includes('publication') || sectionNorm.includes('tez') || sectionNorm.includes('makale')) {
        return 'PUBLICATION_EXPERIENCE_CONTAMINATION_PROHIBITED';
      }
    }

    // RULE 10: Company / Entity Location -> Residence Location Firewall
    if (node.type === 'LOCATION') {
      if (
        rawNorm.includes('holding') ||
        rawNorm.includes('şirketi') ||
        rawNorm.includes('sirketi') ||
        rawNorm.includes('anonim') ||
        rawNorm.includes('limited') ||
        rawNorm.includes('üniversitesi') ||
        rawNorm.includes('universitesi')
      ) {
        return 'ENTITY_ADDRESS_RESIDENCE_CONTAMINATION_PROHIBITED';
      }
    }

    return null;
  }
}

/**
 * Builds the complete Evidence Graph DAG from raw extracted signals.
 */
export function buildCvEvidenceGraph(input: {
  rawText: string;
  rawExtraction: AiCvExtractionPayload;
  spatialModel?: CvDocumentModel;
}): CvEvidenceGraph {
  const graph = new CvEvidenceGraph();
  const { rawExtraction } = input;

  let nodeCounter = 0;
  const nextId = (prefix: string) => `ev_${prefix}_${++nodeCounter}`;

  // 1. Candidate Name Node
  if (rawExtraction.fullName) {
    graph.addNode({
      id: nextId('name'),
      type: 'CANDIDATE_NAME',
      value: rawExtraction.fullName,
      sourceSection: 'header',
      rawSnippet: rawExtraction.fullName,
      confidence: 'HIGH',
      confidenceScore: 0.95,
      resolver: 'NameResolver',
      status: 'active',
    });
  }

  // 2. Primary Role Nodes
  const allCandidateRoles: Array<{ role: string; source: 'header' | 'experience'; confidence: 'HIGH' | 'MEDIUM' }> = [];

  if (rawExtraction.roles && rawExtraction.roles.length > 0) {
    rawExtraction.roles.forEach((r: string, i: number) => {
      allCandidateRoles.push({ role: r, source: i === 0 ? 'header' : 'experience', confidence: i === 0 ? 'HIGH' : 'MEDIUM' });
    });
  }

  if (rawExtraction.experiences && rawExtraction.experiences.length > 0) {
    rawExtraction.experiences.forEach((exp: RawExtractedExperience) => {
      if (exp.role && !allCandidateRoles.some((cr) => cr.role.toLowerCase() === (exp.role || '').toLowerCase())) {
        allCandidateRoles.push({ role: exp.role, source: 'experience', confidence: 'HIGH' });
      }
    });
  }

  allCandidateRoles.forEach(({ role, source, confidence }) => {
    graph.addNode({
      id: nextId('role'),
      type: 'PRIMARY_ROLE',
      value: role,
      sourceSection: source,
      rawSnippet: role,
      confidence,
      confidenceScore: confidence === 'HIGH' ? 0.9 : 0.75,
      resolver: 'RoleResolver',
      status: 'active',
    });
  });

  // 3. Primary Sector Nodes
  if (rawExtraction.sectors && rawExtraction.sectors.length > 0) {
    rawExtraction.sectors.forEach((sec: string) => {
      graph.addNode({
        id: nextId('sector'),
        type: 'PRIMARY_SECTOR',
        value: sec,
        sourceSection: 'experience',
        rawSnippet: sec,
        confidence: 'HIGH',
        confidenceScore: 0.88,
        resolver: 'SectorResolver',
        status: 'active',
      });
    });
  }

  const normRawText = normalizeTrUniversal(input.rawText || '');
  const cleanRawText = normRawText.replace(/[^a-z0-9]/g, '');

  // 4. Experience Record Nodes
  if (rawExtraction.experiences && rawExtraction.experiences.length > 0) {
    rawExtraction.experiences.forEach((exp: RawExtractedExperience) => {
      const compNorm = normalizeTrUniversal(exp.company || '').replace(/[^a-z0-9]/g, '');
      const roleNorm = normalizeTrUniversal(exp.role || '').replace(/[^a-z0-9]/g, '');
      const respNorm = normalizeTrUniversal(exp.responsibilities || '').replace(/[^a-z0-9]/g, '');
      const hasTextProvenance =
        !cleanRawText ||
        (compNorm.length >= 3 && cleanRawText.includes(compNorm.slice(0, 15))) ||
        (roleNorm.length >= 3 && cleanRawText.includes(roleNorm.slice(0, 15))) ||
        (respNorm.length >= 6 && cleanRawText.includes(respNorm.slice(0, 20)));

      graph.addNode({
        id: nextId('exp'),
        type: 'EXPERIENCE_RECORD',
        value: exp,
        sourceSection: 'experience',
        rawSnippet: `${exp.company || ''} ${exp.role || ''} ${exp.startYear || ''}-${exp.endYear || ''}`,
        confidence: hasTextProvenance && exp.company && exp.role ? 'HIGH' : 'LOW',
        confidenceScore: hasTextProvenance ? (exp.company && exp.role && exp.startYear ? 0.95 : 0.7) : 0,
        resolver: 'ExperienceResolver',
        status: hasTextProvenance ? 'active' : 'blocked_by_firewall',
      });
    });
  }

  // 5. Education Record Nodes
  if (rawExtraction.education && rawExtraction.education.length > 0) {
    rawExtraction.education.forEach((edu: RawExtractedEducation) => {
      const schoolNorm = normalizeTrUniversal(edu.school || '').replace(/[^a-z0-9]/g, '');
      const fieldNorm = normalizeTrUniversal(edu.field || '').replace(/[^a-z0-9]/g, '');
      const hasTextProvenance =
        !cleanRawText ||
        (schoolNorm.length >= 3 && cleanRawText.includes(schoolNorm.slice(0, 15))) ||
        (fieldNorm.length >= 3 && cleanRawText.includes(fieldNorm.slice(0, 15)));

      graph.addNode({
        id: nextId('edu'),
        type: 'EDUCATION_RECORD',
        value: edu,
        sourceSection: 'education',
        rawSnippet: `${edu.school || ''} ${edu.field || ''} ${edu.level || ''}`,
        confidence: hasTextProvenance && edu.school ? 'HIGH' : 'LOW',
        confidenceScore: hasTextProvenance ? (edu.school ? 0.9 : 0.7) : 0,
        resolver: 'EducationResolver',
        status: hasTextProvenance ? 'active' : 'blocked_by_firewall',
      });
    });
  }

  // 6. Professional & Technical Skills Nodes
  if (rawExtraction.skills) {
    if (Array.isArray(rawExtraction.skills)) {
      rawExtraction.skills.forEach((s: string) => {
        graph.addNode({
          id: nextId('pskill'),
          type: 'PROFESSIONAL_SKILL',
          value: s,
          sourceSection: 'skills',
          rawSnippet: s,
          confidence: 'HIGH',
          confidenceScore: 0.85,
          resolver: 'SkillResolver',
          status: 'active',
        });
      });
    } else {
      const skillsObj = rawExtraction.skills as any;
      const profSkills = (skillsObj?.professionalSkills || []) as string[];
      profSkills.forEach((s: string) => {
        graph.addNode({
          id: nextId('pskill'),
          type: 'PROFESSIONAL_SKILL',
          value: s,
          sourceSection: 'skills',
          rawSnippet: s,
          confidence: 'HIGH',
          confidenceScore: 0.85,
          resolver: 'SkillResolver',
          status: 'active',
        });
      });

      const techSkills = (skillsObj?.technicalSkills || []) as string[];
      techSkills.forEach((s: string) => {
        graph.addNode({
          id: nextId('tskill'),
          type: 'TECHNICAL_SKILL',
          value: s,
          sourceSection: 'skills',
          rawSnippet: s,
          confidence: 'HIGH',
          confidenceScore: 0.85,
          resolver: 'SkillResolver',
          status: 'active',
        });
      });

      const tools = (skillsObj?.tools || []) as string[];
      tools.forEach((t: string) => {
        graph.addNode({
          id: nextId('tool'),
          type: 'TOOL',
          value: t,
          sourceSection: 'skills',
          rawSnippet: t,
          confidence: 'HIGH',
          confidenceScore: 0.9,
          resolver: 'SkillResolver',
          status: 'active',
        });
      });
    }
  }

  // 6.5 Tools as Array
  if (Array.isArray((rawExtraction as any).tools)) {
    ((rawExtraction as any).tools as string[]).forEach((t: string) => {
      graph.addNode({
        id: nextId('tool'),
        type: 'TOOL',
        value: t,
        sourceSection: 'skills',
        rawSnippet: t,
        confidence: 'HIGH',
        confidenceScore: 0.9,
        resolver: 'SkillResolver',
        status: 'active',
      });
    });
  }

  // 7. Language Nodes
  if (rawExtraction.languages && rawExtraction.languages.length > 0) {
    rawExtraction.languages.forEach((lang: any) => {
      graph.addNode({
        id: nextId('lang'),
        type: 'LANGUAGE',
        value: lang,
        sourceSection: 'languages',
        rawSnippet: lang,
        confidence: 'HIGH',
        confidenceScore: 0.9,
        resolver: 'LanguageResolver',
        status: 'active',
      });
    });
  }

  // 8. Location Node
  if (rawExtraction.locations) {
    if (typeof rawExtraction.locations === 'object' && !Array.isArray(rawExtraction.locations) && (rawExtraction.locations as any).city) {
      const locObj = rawExtraction.locations as any;
      graph.addNode({
        id: nextId('loc'),
        type: 'LOCATION',
        value: {
          city: locObj.city,
          district: locObj.district,
        },
        sourceSection: 'contact',
        rawSnippet: `${locObj.city} ${locObj.district || ''}`.trim(),
        confidence: 'HIGH',
        confidenceScore: 0.92,
        resolver: 'LocationResolver',
        status: 'active',
      });
    } else if (Array.isArray(rawExtraction.locations) && rawExtraction.locations.length > 0) {
      graph.addNode({
        id: nextId('loc'),
        type: 'LOCATION',
        value: {
          city: rawExtraction.locations[0],
          district: rawExtraction.locations[1] || '',
        },
        sourceSection: 'contact',
        rawSnippet: rawExtraction.locations.join(' '),
        confidence: 'HIGH',
        confidenceScore: 0.92,
        resolver: 'LocationResolver',
        status: 'active',
      });
    }
  }

  return graph;
}

/**
 * Sanitizes and reconciles the extraction payload using ONLY active,
 * non-blocked nodes in the Evidence Graph.
 */
export function enforceEvidenceGraphFirewall<T extends Record<string, any>>(
  payload: T,
  graph: CvEvidenceGraph,
): T {
  const activeNameNodes = graph.getActiveNodesByType<string>('CANDIDATE_NAME');
  const activeRoleNodes = graph.getActiveNodesByType<string>('PRIMARY_ROLE');
  const activeSectorNodes = graph.getActiveNodesByType<string>('PRIMARY_SECTOR');
  const activeExpNodes = graph.getActiveNodesByType<RawExtractedExperience>('EXPERIENCE_RECORD');
  const activeEduNodes = graph.getActiveNodesByType<RawExtractedEducation>('EDUCATION_RECORD');
  const activePSkills = graph.getActiveNodesByType<string>('PROFESSIONAL_SKILL');
  const activeTSkills = graph.getActiveNodesByType<string>('TECHNICAL_SKILL');
  const activeTools = graph.getActiveNodesByType<string>('TOOL');
  const activeLangs = graph.getActiveNodesByType<string>('LANGUAGE');
  const activeLocs = graph.getActiveNodesByType<{ city: string; district?: string }>('LOCATION');

  const isSkillsArray = Array.isArray((payload as any).skills);
  const isLocationsArray = Array.isArray((payload as any).locations);

  const sanitizedSkills = isSkillsArray
    ? [...activePSkills.map((n) => n.value), ...activeTSkills.map((n) => n.value)]
    : {
        professionalSkills: activePSkills.map((n) => n.value),
        technicalSkills: activeTSkills.map((n) => n.value),
        tools: activeTools.map((n) => n.value),
      };

  const sanitizedLocations = isLocationsArray
    ? (activeLocs.length > 0 ? [activeLocs[0].value.city, activeLocs[0].value.district].filter(Boolean) : (payload as any).locations)
    : (activeLocs.length > 0 ? activeLocs[0].value : (payload as any).locations);

  return {
    ...payload,
    fullName: activeNameNodes.length > 0 ? activeNameNodes[0].value : undefined,
    roles: activeRoleNodes.map((n) => n.value),
    sectors: activeSectorNodes.map((n) => n.value),
    experiences: activeExpNodes.map((n) => n.value),
    education: activeEduNodes.map((n) => n.value),
    skills: sanitizedSkills,
    tools: activeTools.map((n) => n.value),
    languages: activeLangs.map((n) => n.value),
    locations: sanitizedLocations,
  };
}

export interface CvFieldProvenanceRecord {
  field: string;
  rawCandidateValue?: any;
  canonicalValue?: any;
  sourceZone: string;
  sourceTextSnippet: string;
  resolverName: string;
  scoringScore: number;
  confidenceScore: number;
  status: 'RESOLVED' | 'NOT_FOUND' | 'AMBIGUOUS';
  humanReviewRequired: boolean;
}

export function buildCvFieldProvenanceRecord(params: {
  field: string;
  rawCandidateValue?: any;
  canonicalValue?: any;
  sourceZone: string;
  sourceTextSnippet: string;
  resolverName: string;
  scoringScore: number;
  confidenceScore: number;
  status?: 'RESOLVED' | 'NOT_FOUND' | 'AMBIGUOUS';
  humanReviewRequired?: boolean;
}): CvFieldProvenanceRecord {
  const status = params.status || (params.confidenceScore >= 0.6 ? 'RESOLVED' : 'NOT_FOUND');
  return {
    field: params.field,
    rawCandidateValue: params.rawCandidateValue,
    canonicalValue: params.canonicalValue,
    sourceZone: params.sourceZone,
    sourceTextSnippet: params.sourceTextSnippet,
    resolverName: params.resolverName,
    scoringScore: params.scoringScore,
    confidenceScore: params.confidenceScore,
    status,
    humanReviewRequired: params.humanReviewRequired ?? (status !== 'RESOLVED'),
  };
}
