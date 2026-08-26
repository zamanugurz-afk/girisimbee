'use client';

import React, { useMemo } from 'react';
import { CareerMultiSelect } from '@/features/candidates/components/CareerMultiSelect';
import { resolveFounderSuggestions } from '@/features/founders/lib/founder-suggestions';
import {
  parseSelectedList,
  joinSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

import type { PartnershipIntent } from '@/features/founders/partnership-intent';

export interface FounderPartnershipTypeStepProps {
  intent?: PartnershipIntent;
  partnershipTypes: string[];
  partnershipTypesOther?: string;
  professionalSkills?: string | string[];
  professionalSkillsOther?: string;
  technicalSkills?: string | string[];
  technicalSkillsOther?: string;
  tools?: string | string[];
  toolsOther?: string;
  expertise?: string[];
  expertiseOther?: string;
  sector?: string | null;
  stage?: string | null;
  targetPartnerType?: string | null;
  title?: string | null;
  shortDescription?: string | null;
  onChange: (patch: {
    partnershipTypes: string[];
    partnershipTypesOther?: string;
    partnershipType?: string;
    professionalSkills?: string;
    professionalSkillsOther?: string;
    technicalSkills?: string;
    technicalSkillsOther?: string;
    tools?: string;
    toolsOther?: string;
    expertise?: string[];
    expertiseOther?: string;
  }) => void;
  disabled?: boolean;
  errors?: {
    partnershipTypes?: string;
    professionalSkills?: string;
    technicalSkills?: string;
    tools?: string;
    expertise?: string;
  };
  themeColor?: string;
}

export function FounderPartnershipTypeStep({
  intent = 'seeking',
  partnershipTypes = [],
  partnershipTypesOther = '',
  professionalSkills = '',
  professionalSkillsOther = '',
  technicalSkills = '',
  technicalSkillsOther = '',
  tools = '',
  toolsOther = '',
  expertise = [],
  expertiseOther = '',
  sector,
  stage,
  targetPartnerType,
  title,
  shortDescription,
  onChange,
  disabled = false,
  errors,
  themeColor = 'amber',
}: FounderPartnershipTypeStepProps) {
  const isJoining = intent === 'joining';

  // Step 1 verilerine göre dinamik önerileri hesapla
  const suggestions = useMemo(() => {
    return resolveFounderSuggestions({
      sector,
      stage,
      targetPartnerType,
      title,
      shortDescription,
      intent,
    });
  }, [sector, stage, targetPartnerType, title, shortDescription, intent]);

  // Normalleştirilmiş dizi değerleri
  const selectedPartnershipTypes = useMemo(
    () => (Array.isArray(partnershipTypes) ? partnershipTypes : parseSelectedList(partnershipTypes)),
    [partnershipTypes]
  );

  const selectedProfessionalSkills = useMemo(
    () => (Array.isArray(professionalSkills) ? professionalSkills : parseSelectedList(professionalSkills)),
    [professionalSkills]
  );

  const selectedTechnicalSkills = useMemo(() => {
    const raw = technicalSkills || (expertise && expertise.length > 0 ? expertise : '');
    return Array.isArray(raw) ? raw : parseSelectedList(raw);
  }, [technicalSkills, expertise]);

  const selectedTools = useMemo(
    () => (Array.isArray(tools) ? tools : parseSelectedList(tools)),
    [tools]
  );

  return (
    <div className="space-y-6">
      {/* Akıllı Bilgilendirme Rozeti */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            {sector ? (
              isJoining ? (
                <>
                  <strong>{sector}</strong> ve hedeflediğiniz aşamaya göre katkı sağlayabileceğiniz ortaklık modelleri ve yetkinlikler listelenmiştir.
                </>
              ) : (
                <>
                  <strong>{sector}</strong> sektörü ve girişim aşamanıza göre en uygun ortaklık türleri ve yetkinlikler listelenmiştir.
                </>
              )
            ) : isJoining ? (
              <>Katkı sağlamak istediğiniz ortaklık modelleri ve yetkinlikleri seçebilirsiniz.</>
            ) : (
              <>Girişim hedefinize uygun ortaklık modelleri ve yetkinlikleri seçebilirsiniz.</>
            )}
          </span>
        </div>
        {selectedPartnershipTypes.length > 0 && (
          <Badge className="bg-amber-600 text-white font-semibold text-[11px] px-2 py-0.5 shrink-0">
            {selectedPartnershipTypes.length} {isJoining ? 'Rol/Model Seçili' : 'Ortaklık Seçili'}
          </Badge>
        )}
      </div>

      {/* 1. BLOK: ORTAKLIK MODELLERİ VE TÜRLERİ */}
      <div className="space-y-2">
        <CareerMultiSelect
          label={
            isJoining
              ? 'Sunduğum / Katkı Sağlayacağım Ortaklık Modelleri ve Rolleri *'
              : 'Aranan Ortaklık Modelleri ve Türleri *'
          }
          domain="partnership-types"
          themeColor="amber"
          options={suggestions.partnershipTypes}
          value={selectedPartnershipTypes}
          onChange={(next) => {
            onChange({
              partnershipTypes: next,
              partnershipType: next.join(', '),
              partnershipTypesOther,
              professionalSkills: joinSelectedList(selectedProfessionalSkills),
              professionalSkillsOther,
              technicalSkills: joinSelectedList(selectedTechnicalSkills),
              technicalSkillsOther,
              tools: joinSelectedList(selectedTools),
              toolsOther,
              expertise: selectedTechnicalSkills,
              expertiseOther,
            });
          }}
          manualValue={partnershipTypesOther}
          onManualChange={(next) => {
            onChange({
              partnershipTypes: selectedPartnershipTypes,
              partnershipType: selectedPartnershipTypes.join(', '),
              partnershipTypesOther: next,
              professionalSkills: joinSelectedList(selectedProfessionalSkills),
              professionalSkillsOther,
              technicalSkills: joinSelectedList(selectedTechnicalSkills),
              technicalSkillsOther,
              tools: joinSelectedList(selectedTools),
              toolsOther,
              expertise: selectedTechnicalSkills,
              expertiseOther,
            });
          }}
          manualPlaceholder={
            isJoining
              ? 'Listede olmayan katkı/ortaklık modelini yazın (Örn: Fabrika ve Üretim Tesisi Ortağı, Acentelik Ortağı)...'
              : 'Listede olmayan ortaklık modelini yazın (Örn: Fabrika ve Üretim Tesisi Ortağı, Acentelik Ortağı)...'
          }
          searchPlaceholder={isJoining ? 'Ortaklık rolü veya modeli ara...' : 'Ortaklık modeli ara...'}
          disabled={disabled}
          error={errors?.partnershipTypes}
        />
      </div>

      {/* 2. BLOK: MESLEKİ VE YÖNETSEL YETKİNLİKLER */}
      <div className="space-y-2 pt-1">
        <CareerMultiSelect
          label={
            isJoining
              ? 'Sunduğum Mesleki ve Yönetsel Yetkinlikler (İsteğe Bağlı)'
              : 'Aranan Mesleki ve Yönetsel Yetkinlikler (İsteğe Bağlı)'
          }
          domain="professional-skills"
          themeColor="amber"
          options={suggestions.professionalSkills}
          value={selectedProfessionalSkills}
          onChange={(next) => {
            onChange({
              partnershipTypes: selectedPartnershipTypes,
              partnershipType: selectedPartnershipTypes.join(', '),
              partnershipTypesOther,
              professionalSkills: joinSelectedList(next),
              professionalSkillsOther,
              technicalSkills: joinSelectedList(selectedTechnicalSkills),
              technicalSkillsOther,
              tools: joinSelectedList(selectedTools),
              toolsOther,
              expertise: selectedTechnicalSkills,
              expertiseOther,
            });
          }}
          manualValue={professionalSkillsOther}
          onManualChange={(next) => {
            onChange({
              partnershipTypes: selectedPartnershipTypes,
              partnershipType: selectedPartnershipTypes.join(', '),
              partnershipTypesOther,
              professionalSkills: joinSelectedList(selectedProfessionalSkills),
              professionalSkillsOther: next,
              technicalSkills: joinSelectedList(selectedTechnicalSkills),
              technicalSkillsOther,
              tools: joinSelectedList(selectedTools),
              toolsOther,
              expertise: selectedTechnicalSkills,
              expertiseOther,
            });
          }}
          manualPlaceholder={
            isJoining
              ? 'Listede olmayan mesleki yetkinliğinizi yazın (Örn: B2B Satış, Yatırımcı İlişkileri, İhale Yönetimi)...'
              : 'Listede olmayan mesleki yetkinliği yazın (Örn: B2B Satış, İhale Yönetimi, Yatırımcı İlişkileri)...'
          }
          searchPlaceholder="Yetkinlik ara..."
          disabled={disabled}
          error={errors?.professionalSkills}
        />
      </div>

      {/* 3. BLOK: TEKNİK VE SEKTÖREL UZMANLIKLAR */}
      <div className="space-y-2 pt-1">
        <CareerMultiSelect
          label={
            isJoining
              ? 'Sunduğum Teknik ve Sektörel Uzmanlıklar (İsteğe Bağlı)'
              : 'Aranan Teknik ve Sektörel Uzmanlıklar (İsteğe Bağlı)'
          }
          domain="technical-skills"
          themeColor="amber"
          options={suggestions.technicalSkills}
          value={selectedTechnicalSkills}
          onChange={(next) => {
            onChange({
              partnershipTypes: selectedPartnershipTypes,
              partnershipType: selectedPartnershipTypes.join(', '),
              partnershipTypesOther,
              professionalSkills: joinSelectedList(selectedProfessionalSkills),
              professionalSkillsOther,
              technicalSkills: joinSelectedList(next),
              technicalSkillsOther,
              tools: joinSelectedList(selectedTools),
              toolsOther,
              expertise: next,
              expertiseOther,
            });
          }}
          manualValue={technicalSkillsOther || expertiseOther}
          onManualChange={(next) => {
            onChange({
              partnershipTypes: selectedPartnershipTypes,
              partnershipType: selectedPartnershipTypes.join(', '),
              partnershipTypesOther,
              professionalSkills: joinSelectedList(selectedProfessionalSkills),
              professionalSkillsOther,
              technicalSkills: joinSelectedList(selectedTechnicalSkills),
              technicalSkillsOther: next,
              tools: joinSelectedList(selectedTools),
              toolsOther,
              expertise: selectedTechnicalSkills,
              expertiseOther: next,
            });
          }}
          manualPlaceholder={
            isJoining
              ? 'Listede olmayan teknik uzmanlığınızı yazın (Örn: SolidWorks, CAD/CAM, CNC, LLM Finetuning)...'
              : 'Listede olmayan teknik uzmanlığı yazın (Örn: SolidWorks, CAD/CAM, CNC, LLM Finetuning)...'
          }
          searchPlaceholder="Teknik uzmanlık ara..."
          disabled={disabled}
          error={errors?.technicalSkills}
        />
      </div>

      {/* 4. BLOK: KULLANILAN / YETKİN OLUNAN ARAÇLAR VE TEKNOLOJİLER */}
      <div className="space-y-2 pt-1">
        <CareerMultiSelect
          label={
            isJoining
              ? 'Kullandığım / Yetkin Olduğum Araçlar, Teknolojiler ve Ekipmanlar (İsteğe Bağlı)'
              : 'Kullanılan / Aranan Araçlar, Teknolojiler ve Ekipmanlar (İsteğe Bağlı)'
          }
          domain="tools"
          themeColor="amber"
          options={suggestions.tools}
          value={selectedTools}
          onChange={(next) => {
            onChange({
              partnershipTypes: selectedPartnershipTypes,
              partnershipType: selectedPartnershipTypes.join(', '),
              partnershipTypesOther,
              professionalSkills: joinSelectedList(selectedProfessionalSkills),
              professionalSkillsOther,
              technicalSkills: joinSelectedList(selectedTechnicalSkills),
              technicalSkillsOther,
              tools: joinSelectedList(next),
              toolsOther,
              expertise: selectedTechnicalSkills,
              expertiseOther,
            });
          }}
          manualValue={toolsOther}
          onManualChange={(next) => {
            onChange({
              partnershipTypes: selectedPartnershipTypes,
              partnershipType: selectedPartnershipTypes.join(', '),
              partnershipTypesOther,
              professionalSkills: joinSelectedList(selectedProfessionalSkills),
              professionalSkillsOther,
              technicalSkills: joinSelectedList(selectedTechnicalSkills),
              technicalSkillsOther,
              tools: joinSelectedList(selectedTools),
              toolsOther: next,
              expertise: selectedTechnicalSkills,
              expertiseOther,
            });
          }}
          manualPlaceholder={
            isJoining
              ? 'Listede olmayan araç veya ekipmanı yazın (Örn: SAP, SolidWorks, Adisyo, Salesforce)...'
              : 'Listede olmayan araç veya ekipmanı yazın (Örn: SAP, SolidWorks, Adisyo, Salesforce)...'
          }
          searchPlaceholder="Araç veya ekipman ara..."
          disabled={disabled}
          error={errors?.tools}
        />
      </div>
    </div>
  );
}
