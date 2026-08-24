'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Languages,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CareerCardInput } from '@/features/candidates/components/CareerProfilePreview';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getClientContainer } from '@/lib/persistence/container';
import { cn } from '@/lib/utils';

export interface JobApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  companyName?: string | null;
  onSuccess?: (result: { applicationId: string; conversationId?: string }) => void;
}

export function JobApplicationModal({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  companyName,
  onSuccess,
}: JobApplicationModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState<CareerCardInput | null>(null);
  const [coverMessage, setCoverMessage] = useState('');
  const [saveToMainProfile, setSaveToMainProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable draft fields
  const [draftRole, setDraftRole] = useState('');
  const [draftSector, setDraftSector] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [draftSkills, setDraftSkills] = useState('');
  const [draftLanguages, setDraftLanguages] = useState('');

  // Load user's career profile when modal opens
  useEffect(() => {
    if (!open || !user) return;

    let mounted = true;
    setIsLoadingProfile(true);

    async function load() {
      try {
        const container = getClientContainer();
        const careerService = new CareerProfileService(container.listingRepository);
        const pageData = await careerService.getPageData(user!.id as any);
        if (!mounted) return;

        const candidateRecord = pageData.seek;
        if (candidateRecord?.values) {
          const v = candidateRecord.values;
          const card: CareerCardInput = {
            displayName: v.fullName || user!.displayName || 'Aday',
            desiredRole: v.role || v.roles?.[0] || 'Uzman',
            primarySector: v.sector || v.sectors?.[0] || 'Genel',
            experienceLevel: v.experienceLevel || 'Deneyimli',
            residenceCity: v.city || 'İstanbul',
            residenceDistrict: v.preferredDistrict || '',
            preferredCity: v.city || 'İstanbul',
            workType: v.workType || 'Tam Zamanlı',
            workplacePreference: v.workplacePreference || 'Hibrit',
            educationLevel: v.educationLevel || 'Lisans',
            educationHistory: (v.educationHistory || []).map((e) => ({
              level: e.level || 'Lisans',
              field: e.field,
              school: e.school,
              graduationYear: e.graduationYear,
            })),
            experiences: v.experiences || [],
            languages: v.languages || '',
            certificates: v.certificates || '',
            professionalSkills: v.professionalSkillsList?.join(', ') || v.professionalSkills || '',
            technicalSkills: v.technicalSkillsList?.join(', ') || v.technicalSkills || '',
            tools: v.toolsList?.join(', ') || v.tools || '',
            longDescription: v.candidateTraits || '',
            salaryExpectation: v.salaryMin && v.salaryMax ? `${v.salaryMin} - ${v.salaryMax} TL` : '',
            availability: v.availability || 'Hemen',
          };
          setProfileData(card);
          setDraftRole(card.desiredRole || '');
          setDraftSector(card.primarySector || '');
          setDraftCity(card.preferredCity || card.residenceCity || '');
          setDraftSummary(card.longDescription || '');
          setDraftSkills([card.professionalSkills, card.technicalSkills].filter(Boolean).join(', '));
          setDraftLanguages(card.languages || '');
        } else {
          // Fallback profile from user object
          const fallback: CareerCardInput = {
            displayName: user!.displayName || 'Aday',
            desiredRole: 'Pozisyon Adayı',
            primarySector: 'Genel',
            residenceCity: 'İstanbul',
            workType: 'Tam Zamanlı',
            educationLevel: 'Lisans',
            experiences: [],
          };
          setProfileData(fallback);
          setDraftRole(fallback.desiredRole || '');
          setDraftSector(fallback.primarySector || '');
          setDraftCity(fallback.residenceCity || '');
        }
      } catch (err) {
        console.warn('Failed to load profile for application modal', err);
        const fallback: CareerCardInput = {
          displayName: user?.displayName || 'Aday',
          desiredRole: 'Pozisyon Adayı',
          residenceCity: 'İstanbul',
        };
        setProfileData(fallback);
      } finally {
        if (mounted) setIsLoadingProfile(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [open, user]);

  function handleSaveDraft() {
    if (!profileData) return;
    setProfileData({
      ...profileData,
      desiredRole: draftRole.trim() || profileData.desiredRole,
      primarySector: draftSector.trim() || profileData.primarySector,
      preferredCity: draftCity.trim() || profileData.preferredCity,
      residenceCity: draftCity.trim() || profileData.residenceCity,
      longDescription: draftSummary.trim() || profileData.longDescription,
      professionalSkills: draftSkills.trim() || profileData.professionalSkills,
      languages: draftLanguages.trim() || profileData.languages,
    });
    setIsEditing(false);
    toast.success('Başvuru profili güncellendi.');
  }

  async function handleApply() {
    if (!user || !profileData || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/candidates/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          coverMessage: coverMessage.trim() || null,
          profileSnapshot: profileData,
          saveToMainProfile,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Başvuru gönderilemedi.');
      }

      const application = json.data?.application || json.application;
      const convId =
        application?.conversationId ||
        application?.metadata?.conversationId;

      toast.success('İş başvurunuz başarıyla işverene iletildi!');

      onOpenChange(false);
      if (onSuccess && application?.id) {
        onSuccess({
          applicationId: application.id,
          conversationId: convId,
        });
      }

      if (convId) {
        router.push(`/mesajlarim?c=${convId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Başvuru yapılırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border bg-card">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white rounded-t-2xl relative">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="h-4 w-4" />
            İş Başvurusu
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {listingTitle}
          </DialogTitle>
          {companyName && (
            <DialogDescription className="text-emerald-100 text-sm mt-0.5">
              {companyName}
            </DialogDescription>
          )}
        </div>

        <div className="p-6 space-y-6">
          {isLoadingProfile ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Kariyer profiliniz hazırlanıyor…</p>
            </div>
          ) : (
            <>
              {/* Snapshot notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold">Güvenli Başvuru Snapshot'ı:</span> Başvurunuz gönderildiğinde kariyer profilinizin o anki değişmez bir kopyası (snapshot) işverene iletilir. İletişim bilgileriniz platform güvenliği altında korunur.
                </div>
              </div>

              {/* Profile Preview or Edit */}
              <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    Başvuruda Kullanılacak Profil
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-8 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {isEditing ? 'Önizlemeye Dön' : 'Profili Düzenle'}
                  </Button>
                </div>

                {isEditing ? (
                  /* Edit form */
                  <div className="space-y-3.5 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Ana Pozisyon / Unvan</Label>
                        <Input
                          value={draftRole}
                          onChange={(e) => setDraftRole(e.target.value)}
                          className="mt-1 h-9 text-xs"
                          placeholder="Örn: Operasyon Müdürü"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Sektör</Label>
                        <Input
                          value={draftSector}
                          onChange={(e) => setDraftSector(e.target.value)}
                          className="mt-1 h-9 text-xs"
                          placeholder="Örn: Çağrı Merkezi"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Şehir / Lokasyon</Label>
                        <Input
                          value={draftCity}
                          onChange={(e) => setDraftCity(e.target.value)}
                          className="mt-1 h-9 text-xs"
                          placeholder="Örn: İstanbul · Maltepe"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Diller</Label>
                        <Input
                          value={draftLanguages}
                          onChange={(e) => setDraftLanguages(e.target.value)}
                          className="mt-1 h-9 text-xs"
                          placeholder="Örn: İngilizce (İleri), Almanca"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Uzmanlık & Beceriler</Label>
                      <Input
                        value={draftSkills}
                        onChange={(e) => setDraftSkills(e.target.value)}
                        className="mt-1 h-9 text-xs"
                        placeholder="Örn: Takım Liderliği, KPI Yönetimi, CRM"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Kariyer Özeti</Label>
                      <Textarea
                        value={draftSummary}
                        onChange={(e) => setDraftSummary(e.target.value)}
                        rows={3}
                        className="mt-1 text-xs"
                        placeholder="Kariyer hedefleriniz ve öne çıkan deneyimleriniz..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="text-xs"
                      >
                        Vazgeç
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveDraft}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        Değişiklikleri Uygula
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Clean profile summary card */
                  <div className="space-y-3 pt-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold text-foreground">
                          {profileData?.displayName || user?.displayName}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {profileData?.desiredRole}
                          {profileData?.primarySector ? ` · ${profileData.primarySector}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {profileData?.preferredCity || profileData?.residenceCity || 'Türkiye'}
                          {profileData?.workType ? ` · ${profileData.workType}` : ''}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Profil Hazır
                        </span>
                      </div>
                    </div>

                    {profileData?.longDescription && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 bg-card p-3 rounded-lg border border-border/60">
                        {profileData.longDescription}
                      </p>
                    )}

                    {profileData?.experiences && profileData.experiences.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-emerald-600" />
                          Son Deneyimler ({profileData.experiences.length})
                        </p>
                        <div className="space-y-1">
                          {profileData.experiences.slice(0, 2).map((exp, idx) => (
                            <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span className="font-semibold">{exp.role || exp.roleOther || 'Pozisyon'}</span>
                              <span className="text-muted-foreground text-[11px]">{exp.company || exp.sector}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileData?.professionalSkills && (
                      <div className="space-y-1 pt-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-emerald-600" />
                          Uzmanlık & Beceriler
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {profileData.professionalSkills}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cover message textarea */}
              <div className="space-y-2">
                <Label htmlFor="coverMessage" className="text-xs font-semibold flex items-center justify-between">
                  <span>İşverene İletmek İstediğiniz Mesaj (Opsiyonel)</span>
                  <span className="text-[11px] text-muted-foreground">İlk mesajınız olarak iletilir</span>
                </Label>
                <Textarea
                  id="coverMessage"
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  placeholder="Merhaba, pozisyonla ilgili deneyimimin uygun olduğunu düşünüyorum. Değerlendirmeniz için teşekkür ederim..."
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              {/* Save to main profile checkbox */}
              {isEditing && (
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="saveToMain"
                    checked={saveToMainProfile}
                    onCheckedChange={(c) => setSaveToMainProfile(Boolean(c))}
                  />
                  <Label htmlFor="saveToMain" className="text-xs text-muted-foreground cursor-pointer">
                    Bu başvuruda yaptığım düzenlemeleri ana Kariyer Profilime de kaydet
                  </Label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 bg-muted/10">
          <p className="text-[11px] text-muted-foreground text-center sm:text-left flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-600" />
            Mesajlaşma ve başvuru takibi Mesajlarım üzerinden yürütülür.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-xs"
            >
              Vazgeç
            </Button>

            <Button
              type="button"
              onClick={handleApply}
              disabled={isSubmitting || isLoadingProfile}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Başvuru İletiliyor…</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Bu Profille Başvur</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
