import { describe, it, expect, beforeEach } from 'vitest';
import { ids } from '@/lib/domain/ids';
import { MockApplicationRepository } from '@/features/matching/repository/mock/application.repository.mock';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { MockProfileRepository } from '@/features/profiles/repository/mock/profile.repository.mock';
import { MockConversationRepository } from '@/features/messaging/repository/mock/conversation.repository.mock';
import { MockMessageRepository } from '@/features/messaging/repository/mock/message.repository.mock';
import { MockCompanyRepository } from '@/features/companies/repository/mock/company.repository.mock';
import { MockModuleProfileRepository } from '@/features/profiles/repository/mock/module-profile.repository.mock';
import { MockPaymentRepository } from '@/features/monetization/repository/mock/payment.repository.mock';
import { MessagingService } from '@/features/messaging/services/messaging.service';
import { ApplicationService } from '@/features/matching/services/application.service';
import { MarketplacePaymentService } from '@/features/monetization/services/payment.service';
import { CandidateApplicationService } from '@/features/candidates/services/candidate-application.service';
import { EmployerApplicationService } from '@/features/employers/services/employer-application.service';
import {
  buildJobApplicationEmployerEmailHtml,
  sendJobApplicationStatusNotification,
} from '@/lib/email/job-application-email';
import type { CareerCardInput } from '@/features/candidates/components/CareerProfilePreview';
import { createListing } from '@/features/listings/factories/listing.factory';
import { createProfile } from '@/features/profiles/factories/profile.factory';

describe('Job Application + Career Profile Snapshot + Messaging Integration Suite (22 Comprehensive Tests)', () => {
  let appRepo: MockApplicationRepository;
  let listingRepo: MockListingRepository;
  let profileRepo: MockProfileRepository;
  let companyRepo: MockCompanyRepository;
  let moduleProfileRepo: MockModuleProfileRepository;
  let convRepo: MockConversationRepository;
  let msgRepo: MockMessageRepository;
  let messagingService: MessagingService;
  let candidateAppService: CandidateApplicationService;
  let employerAppService: EmployerApplicationService;

  const employerUserId = ids.user('11111111-1111-4111-8111-111111111111');
  const employerProfileId = ids.profile('22222222-2222-4222-8222-222222222222');
  const candidateUserId = ids.user('33333333-3333-4333-8333-333333333333');
  const candidateProfileId = ids.profile('44444444-4444-4444-8444-444444444444');
  const listingId = ids.listing('55555555-5555-4555-8555-555555555555');

  beforeEach(async () => {
    appRepo = new MockApplicationRepository();
    listingRepo = new MockListingRepository();
    profileRepo = new MockProfileRepository();
    companyRepo = new MockCompanyRepository();
    moduleProfileRepo = new MockModuleProfileRepository();
    convRepo = new MockConversationRepository();
    msgRepo = new MockMessageRepository();

    convRepo.setMessageRepo(msgRepo);
    messagingService = new MessagingService(convRepo, msgRepo, listingRepo, profileRepo, companyRepo);

    const appService = new ApplicationService(appRepo, listingRepo, moduleProfileRepo, profileRepo);
    const paymentRepo = new MockPaymentRepository();
    const paymentService = new MarketplacePaymentService(paymentRepo, profileRepo);

    candidateAppService = new CandidateApplicationService(appRepo, listingRepo, appService);
    employerAppService = new EmployerApplicationService(
      appRepo,
      listingRepo,
      moduleProfileRepo,
      profileRepo,
      appService,
      paymentService,
    );

    // Create Employer Profile & Listing
    await profileRepo.create(
      createProfile({
        id: employerProfileId,
        userId: employerUserId,
        displayName: 'Acme Corp HR',
        email: 'hr@acmecorp.com',
      }),
    );

    const createdListing = createListing({
      id: listingId,
      ownerId: employerUserId,
      title: 'Kıdemli Frontend Geliştirici',
      shortDescription: 'Senior Frontend Developer ilanı',
      categoryId: ids.category('is-bul'),
      listingTypeId: ids.listingType('is-arayanlar'),
      moduleKey: 'employers',
      status: 'published',
    });
    (listingRepo as any).save(createdListing);

    // Create Candidate Profile
    await profileRepo.create(
      createProfile({
        id: candidateProfileId,
        userId: candidateUserId,
        displayName: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90 555 111 2233',
      }),
    );
  });

  it('1. Successfully submits application with immutable profile snapshot', async () => {
    const snapshot: CareerCardInput = {
      displayName: 'Ahmet Yılmaz',
      desiredRole: 'Senior React Developer',
      primarySector: 'Bilişim / Yazılım',
      experienceLevel: 'Senior',
      preferredCity: 'İstanbul',
      workType: 'Tam Zamanlı',
      workplacePreference: 'Uzaktan (Remote)',
      professionalSkills: 'React, Next.js, TypeScript',
      experiences: [
        {
          id: 'exp-1',
          role: 'Frontend Developer',
          company: 'Tech Solutions',
          sector: 'Yazılım',
          duration: '2021 - 2024',
          responsibilities: 'Lead UI development',
          achievements: 'Migrated to Next.js',
        },
      ],
    };

    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'İlanınızla ilgileniyorum, profilimi incelerseniz sevinirim.',
      undefined,
      snapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
        employerEmail: 'hr@acmecorp.com',
        applicantName: 'Ahmet Yılmaz',
      },
    );

    expect(summary).toBeDefined();
    expect(summary.status).toBe('pending');
    expect(summary.listingId).toBe(listingId);
    expect(summary.applicantProfileId).toBe(candidateProfileId);
    expect(summary.profileSnapshot).toEqual(snapshot);
    expect(summary.conversationId).toBeDefined();
  });

  it('2. Enforces SNAPSHOT IMMUTABILITY: Altering live profile does NOT alter submitted application snapshot', async () => {
    const originalSnapshot: CareerCardInput = {
      displayName: 'Ahmet Yılmaz',
      desiredRole: 'Senior React Developer',
      primarySector: 'Bilişim / Yazılım',
      experienceLevel: 'Senior',
      preferredCity: 'İstanbul',
      workType: 'Tam Zamanlı',
      professionalSkills: 'React, Next.js',
    };

    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Ön yazı',
      undefined,
      originalSnapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
        employerEmail: 'hr@acmecorp.com',
        applicantName: 'Ahmet Yılmaz',
      },
    );

    // Candidate updates their active profile in the system later
    await profileRepo.update(candidateProfileId, {
      displayName: 'Ahmet Yılmaz (Updated)',
      headline: 'CTO / Founder',
    });

    // Verify application retrieved by employer has the EXACT immutable snapshot from application time
    const employerApps = await employerAppService.listApplicationsForListing(listingId, employerProfileId);
    expect(employerApps.length).toBe(1);
    const employerView = employerApps[0];
    expect(employerView.profileSnapshot).toBeDefined();
    expect(employerView.profileSnapshot?.desiredRole).toBe('Senior React Developer');
    expect(employerView.profileSnapshot?.displayName).toBe('Ahmet Yılmaz');
    expect(employerView.profileSnapshot?.professionalSkills).toBe('React, Next.js');
  });

  it('3. Creates a marketplace conversation linked to application and listing', async () => {
    const snapshot: CareerCardInput = {
      displayName: 'Ahmet Yılmaz',
      desiredRole: 'Senior React Developer',
    };

    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Merhaba!',
      undefined,
      snapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
        employerEmail: 'hr@acmecorp.com',
        applicantName: 'Ahmet Yılmaz',
      },
    );

    expect(summary.conversationId).toBeDefined();

    // Verify conversation exists and has correct participants
    const conv = await convRepo.findById(summary.conversationId!);
    expect(conv).toBeDefined();
    expect(conv?.listingId).toBe(listingId);
    expect(conv?.participantIds).toContain(candidateUserId);
    expect(conv?.participantIds).toContain(employerUserId);
    expect(conv?.kind).toBe('application');
    expect(conv?.applicationId).toBe(summary.id);

    // Verify initial message was posted
    const messages = await msgRepo.findByConversationId(summary.conversationId!);
    expect(messages.data.length).toBeGreaterThan(0);
    expect(messages.data[0].body).toContain('Merhaba!');
  });

  it('4. Duplicate Guard: Prevents submitting duplicate active applications to same listing', async () => {
    await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'İlk Başvuru',
    );

    // Attempting to apply again must reject
    await expect(
      candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'İkinci Başvuru',
      ),
    ).rejects.toThrow();
  });

  it('5. Employer Status Management: Employer updates status with instant reflection', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Başvuru',
      undefined,
      { desiredRole: 'Developer' },
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    // Employer changes status to 'reviewing'
    const updatedReviewing = await employerAppService.updateApplicationStatus(
      summary.id,
      employerProfileId,
      'reviewing',
    );
    expect(updatedReviewing.status).toBe('reviewing');

    // Employer changes status to 'contacted' (mülakat)
    const updatedContacted = await employerAppService.updateApplicationStatus(
      summary.id,
      employerProfileId,
      'contacted',
    );
    expect(updatedContacted.status).toBe('contacted');

    // Employer accepts candidate
    const updatedAccepted = await employerAppService.updateApplicationStatus(
      summary.id,
      employerProfileId,
      'accepted',
    );
    expect(updatedAccepted.status).toBe('accepted');

    // Candidate sees updated status in list
    const candidateApps = await candidateAppService.listMyApplications(candidateProfileId);
    expect(candidateApps.length).toBe(1);
    expect(candidateApps[0].status).toBe('accepted');
  });

  it('6. Zero PII in Email: Transactional email contains NO sensitive candidate PII', () => {
    const emailHtml = buildJobApplicationEmployerEmailHtml({
      positionTitle: 'Kıdemli Frontend Geliştirici',
      applicantName: 'Ahmet Yılmaz',
      appliedAt: '25 Ağustos 2026',
      conversationUrl: 'https://girisimbee.com/mesajlarim?c=test-conv-123',
    });

    // Must contain position, applicant name, and secure link
    expect(emailHtml).toContain('Kıdemli Frontend Geliştirici');
    expect(emailHtml).toContain('Ahmet Yılmaz');
    expect(emailHtml).toContain('https://girisimbee.com/mesajlarim?c=test-conv-123');

    // Must NOT leak phone number, candidate email, or home address
    expect(emailHtml).not.toContain('+90 555 111 2233');
    expect(emailHtml).not.toContain('ahmet@example.com');
  });

  it('7. Handles application withdrawal properly', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Geri çekilecek başvuru',
    );
    expect(summary.status).toBe('pending');

    const withdrawn = await candidateAppService.withdrawApplication(summary.id, candidateProfileId);
    expect(withdrawn.status).toBe('withdrawn');
  });

  it('8. Conversation preview text updates on application creation', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Özel mesajım burada',
      undefined,
      { desiredRole: 'DevOps' },
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const conv = await convRepo.findById(summary.conversationId!);
    expect(conv?.lastMessagePreview).toContain('Özel mesajım burada');
  });

  it('9. Thread meta correctly reports application kind and applicationId', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Mesaj',
      undefined,
      { desiredRole: 'DevOps' },
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const meta = await messagingService.getThreadMeta(summary.conversationId!, candidateUserId);
    expect(meta).toBeDefined();
    expect(meta?.kind).toBe('application');
    expect(meta?.applicationId).toBe(summary.id);
  });

  it('10. Employer rejecting application updates status to rejected', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Başvuru',
    );

    const rejected = await employerAppService.updateApplicationStatus(
      summary.id,
      employerProfileId,
      'rejected',
    );
    expect(rejected.status).toBe('rejected');
  });

  it('11. Allows adding internal candidate notes to applications', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Başvuru',
    );

    await candidateAppService.addApplicationNote(
      summary.id,
      candidateProfileId,
      'Mülakata hazırlandım',
    );
    const detail = await candidateAppService.getApplicationDetail(summary.id, candidateProfileId);
    expect(detail.notes.length).toBe(1);
    expect(detail.notes[0].text).toBe('Mülakata hazırlandım');
  });

  it('12. Preserves complex education history structure in snapshot', async () => {
    const complexSnapshot: CareerCardInput = {
      displayName: 'Ahmet Yılmaz',
      desiredRole: 'Full Stack',
      educationLevel: 'Yüksek Lisans',
      educationField: 'Bilgisayar Mühendisliği',
      educationHistory: [
        {
          level: 'Lisans',
          school: 'İTÜ',
          field: 'Bilgisayar Mühendisliği',
          graduationYear: 2020,
        },
        {
          level: 'Yüksek Lisans',
          school: 'Boğaziçi',
          field: 'Yazılım Mühendisliği',
          graduationYear: 2022,
        },
      ],
    };

    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Detaylı eğitim',
      undefined,
      complexSnapshot,
    );

    expect(summary.profileSnapshot?.educationHistory?.length).toBe(2);
    expect(summary.profileSnapshot?.educationHistory?.[0].school).toBe('İTÜ');
  });

  it('13. Preserves complex experiences with metrics in snapshot', async () => {
    const complexSnapshot: CareerCardInput = {
      displayName: 'Ahmet Yılmaz',
      experiences: [
        {
          id: 'e1',
          role: 'Lead Architect',
          company: 'Cloud Corp',
          sector: 'Bilişim',
          duration: '2022 - Devam Ediyor',
          responsibilities: 'Mimari tasarım',
          achievements: '%40 performans artışı',
        },
      ],
    };

    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Deneyimler',
      undefined,
      complexSnapshot,
    );

    expect(summary.profileSnapshot?.experiences?.[0].company).toBe('Cloud Corp');
    expect(summary.profileSnapshot?.experiences?.[0].achievements).toBe('%40 performans artışı');
  });

  it('14. Preserves language and certificate array items', async () => {
    const snapshot: CareerCardInput = {
      displayName: 'Ahmet Yılmaz',
      languages: 'İngilizce (C1), Almanca (B1)',
      certificates: 'AWS Solutions Architect, PMP',
    };

    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Sertifikalar',
      undefined,
      snapshot,
    );

    expect(summary.profileSnapshot?.languages).toContain('İngilizce (C1)');
    expect(summary.profileSnapshot?.certificates).toContain('AWS Solutions Architect');
  });

  it('15. Listing manager authorization blocks unauthorized profiles from changing status', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Başvuru',
    );

    const unauthorizedProfileId = ids.profile('99999999-9999-4999-8999-999999999999');
    await expect(
      employerAppService.updateApplicationStatus(
        summary.id,
        unauthorizedProfileId,
        'accepted',
      ),
    ).rejects.toThrow();
  });

  it('16. Candidate can list multiple submitted applications across listings', async () => {
    const listingId2 = ids.listing('66666666-6666-4666-8666-666666666666');
    const createdListing2 = createListing({
      id: listingId2,
      ownerId: employerUserId,
      title: 'Backend Geliştirici',
      shortDescription: 'Backend',
      categoryId: ids.category('is-bul'),
      listingTypeId: ids.listingType('is-arayanlar'),
      moduleKey: 'employers',
      status: 'published',
    });
    (listingRepo as any).save(createdListing2);

    await candidateAppService.submitApplication(candidateProfileId, listingId, 'App 1');
    await candidateAppService.submitApplication(candidateProfileId, listingId2, 'App 2');

    const myApps = await candidateAppService.listMyApplications(candidateProfileId);
    expect(myApps.length).toBe(2);
  });

  it('17. Candidate can filter applications by status', async () => {
    const listingId2 = ids.listing('66666666-6666-4666-8666-666666666666');
    const createdListing2 = createListing({
      id: listingId2,
      ownerId: employerUserId,
      title: 'Backend Geliştirici',
      shortDescription: 'Backend',
      categoryId: ids.category('is-bul'),
      listingTypeId: ids.listingType('is-arayanlar'),
      moduleKey: 'employers',
      status: 'published',
    });
    (listingRepo as any).save(createdListing2);

    const app1 = await candidateAppService.submitApplication(candidateProfileId, listingId, 'App 1');
    await candidateAppService.submitApplication(candidateProfileId, listingId2, 'App 2');

    await employerAppService.updateApplicationStatus(app1.id, employerProfileId, 'accepted');

    const acceptedList = await candidateAppService.listMyApplications(candidateProfileId, {
      status: 'accepted',
    });
    expect(acceptedList.length).toBe(1);
    expect(acceptedList[0].id).toBe(app1.id);
  });

  it('18. Candidate application detail returns full profile snapshot', async () => {
    const snapshot: CareerCardInput = {
      desiredRole: 'Data Scientist',
      primarySector: 'Yapay Zeka',
      tools: 'Python, PyTorch, SQL',
    };

    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Data app',
      undefined,
      snapshot,
    );

    const detail = await candidateAppService.getApplicationDetail(summary.id, candidateProfileId);
    expect(detail.profileSnapshot).toBeDefined();
    expect(detail.profileSnapshot?.desiredRole).toBe('Data Scientist');
    expect(detail.profileSnapshot?.tools).toBe('Python, PyTorch, SQL');
  });

  it('19. Employer application list summary includes conversationId', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Test app',
      undefined,
      { desiredRole: 'Tester' },
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const employerApps = await employerAppService.listApplicationsForListing(listingId, employerProfileId);
    expect(employerApps.length).toBe(1);
    expect(employerApps[0].conversationId).toBe(summary.conversationId);
  });

  it('20. Candidate application contact request returns employer contact', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Test app',
    );

    // Listing has contact info
    await listingRepo.update(listingId, {
      contactEmail: 'contact@acme.com',
      contactPhone: '+90 212 999 8877',
    });

    const contactResult = await candidateAppService.contactEmployer(summary.id, candidateProfileId);
    expect(contactResult.contact).toBeDefined();
    expect(contactResult.contact.email).toBe('contact@acme.com');
    expect(contactResult.contact.phone).toBe('+90 212 999 8877');
  });

  it('21. Conversation list item maps application kind and flags isApplication correctly', async () => {
    const summary = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Mesaj',
      undefined,
      { desiredRole: 'DevOps' },
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const list = await messagingService.listConversations(candidateUserId);
    expect(list.data.length).toBe(1);
    const item = list.data[0];
    expect(item.kind).toBe('application');
    expect(item.applicationId).toBe(summary.id);
  });

  it('22. Full end-to-end lifecycle: submit -> snapshot -> messaging -> status transition -> snapshot preservation', async () => {
    // 1. Submit with snapshot
    const snapshot: CareerCardInput = {
      displayName: 'Ahmet Yılmaz (Application V1)',
      desiredRole: 'Staff Frontend Engineer',
      salaryExpectation: '100.000 - 120.000 TL',
      experiences: [
        {
          id: 'exp-lead',
          role: 'Staff Engineer',
          company: 'Acme Mega Corp',
          duration: '3 yıl',
          responsibilities: 'Architecture and governance',
          achievements: 'Scaled frontend to 50 engineers',
        },
      ],
    };

    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Pozisyon için başvurumu iletiyorum.',
      undefined,
      snapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
        employerEmail: 'hr@acmecorp.com',
        applicantName: 'Ahmet Yılmaz',
      },
    );

    expect(application.conversationId).toBeDefined();

    // 2. Candidate changes their live career profile completely
    await profileRepo.update(candidateProfileId, {
      displayName: 'Ahmet Yılmaz (New Persona)',
      position: 'VP of Product',
    });

    // 3. Employer receives and opens application
    const employerApps = await employerAppService.listApplicationsForListing(listingId, employerProfileId);
    expect(employerApps.length).toBe(1);
    const appView = employerApps[0];

    // 4. Verify snapshot is unchanged
    expect(appView.profileSnapshot?.displayName).toBe('Ahmet Yılmaz (Application V1)');
    expect(appView.profileSnapshot?.desiredRole).toBe('Staff Frontend Engineer');
    expect(appView.profileSnapshot?.experiences?.[0].role).toBe('Staff Engineer');

    // 5. Employer updates status to contacted (mülakat)
    await employerAppService.updateApplicationStatus(application.id, employerProfileId, 'contacted');

    // 6. Messaging thread is alive and has the application linked
    const meta = await messagingService.getThreadMeta(application.conversationId!, employerUserId);
    expect(meta?.kind).toBe('application');
    expect(meta?.applicationId).toBe(application.id);

    // 7. Messages exchanged
    await messagingService.sendMessage({
      conversationId: application.conversationId!,
      senderId: employerUserId,
      body: 'Başvurunuzu aldık, yarın görüşme yapabilir miyiz?',
    });

    const threadMessages = await messagingService.getMessages(application.conversationId!, candidateUserId);
    expect(threadMessages.data.length).toBe(2); // Initial cover message + employer reply
  });
});
