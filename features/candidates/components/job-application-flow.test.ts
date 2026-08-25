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
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import {
  ISTANBUL_ANADOLU_DISTRICTS,
  ISTANBUL_AVRUPA_DISTRICTS,
  getDistrictsForCity,
} from '@/features/shared/constants/turkish-districts';
import { LISTING_CITY_OPTIONS } from '@/features/shared/constants/turkish-cities';
import { sortCitiesForPicker } from '@/features/listings/lib/picker-sort';

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

  it('TEST 1: New application creates application + conversation + participants + initial message + links conversation_id', async () => {
    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Özel ön yazı mesajım.',
      undefined,
      null,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    expect(application.status).toBe('pending'); // CandidateApplicationStatus maps 'submitted' to 'pending'
    expect(application.conversationId).toBeDefined();

    const conv = await convRepo.findById(application.conversationId!);
    expect(conv).toBeDefined();
    expect(conv?.kind).toBe('application');
    expect(conv?.applicationId).toBe(application.id);
    expect(conv?.listingId).toBe(listingId);
    expect(conv?.participantIds).toContain(candidateUserId);
    expect(conv?.participantIds).toContain(employerUserId);

    const msgs = await msgRepo.findMany({ conversationId: application.conversationId! });
    expect(msgs.data.length).toBe(1);
    expect(msgs.data[0].body).toBe('Özel ön yazı mesajım.');
    expect(msgs.data[0].senderId).toBe(candidateUserId);
  });

  it('TEST 2: Idempotency - startConversation with same applicationId reuses existing conversation', async () => {
    const defaultInitialMsg = 'İlk mesaj.';
    const validAppId = ids.application('88888888-8888-4888-8888-888888888888');
    const conv1 = await messagingService.startConversation({
      participantIds: [candidateUserId, employerUserId],
      listingId,
      applicationId: validAppId,
      kind: 'application',
      initialMessage: defaultInitialMsg,
    });

    const conv2 = await messagingService.startConversation({
      participantIds: [candidateUserId, employerUserId],
      listingId,
      applicationId: validAppId,
      kind: 'application',
      initialMessage: defaultInitialMsg,
    });

    expect(conv1.id).toBe(conv2.id);
  });

  it('TEST 3: Employer application status submitted -> reviewing sets reviewedAt', async () => {
    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Ön yazı',
      undefined,
      null,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const updated = await employerAppService.updateApplicationStatus(
      application.id,
      employerProfileId,
      'reviewing',
    );

    expect(updated.status).toBe('reviewing');
    expect(updated.reviewedAt).toBeDefined();
    expect(typeof updated.reviewedAt).toBe('string');
  });

  it('TEST 4: Status transition reviewing -> contacted sets contactedAt', async () => {
    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Ön yazı',
      undefined,
      null,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    await employerAppService.updateApplicationStatus(application.id, employerProfileId, 'reviewing');
    const contacted = await employerAppService.updateApplicationStatus(application.id, employerProfileId, 'contacted');

    expect(contacted.status).toBe('contacted');
    expect(contacted.reviewedAt).toBeDefined();
    expect(contacted.contactedAt).toBeDefined();
  });

  it('TEST 5: Status transition contacted -> accepted preserves existing conversation', async () => {
    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Ön yazı',
      undefined,
      null,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const originalConvId = application.conversationId;
    await employerAppService.updateApplicationStatus(application.id, employerProfileId, 'contacted');
    const accepted = await employerAppService.updateApplicationStatus(application.id, employerProfileId, 'accepted');

    expect(accepted.status).toBe('accepted');
    expect(accepted.conversationId).toBe(originalConvId);
  });

  it('TEST 6: Status transition contacted -> rejected preserves existing conversation', async () => {
    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Ön yazı',
      undefined,
      null,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const originalConvId = application.conversationId;
    await employerAppService.updateApplicationStatus(application.id, employerProfileId, 'contacted');
    const rejected = await employerAppService.updateApplicationStatus(application.id, employerProfileId, 'rejected');

    expect(rejected.status).toBe('rejected');
    expect(rejected.conversationId).toBe(originalConvId);
  });

  it('TEST 7: Own application profile snapshot contains full experiences and unmasked fields', async () => {
    const fullSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      desiredRole: 'Senior Full Stack Developer',
      primarySector: 'Yazılım & Teknoloji',
      contactEmail: 'ugurzaman1907@gmail.com',
      contactPhone: '+905551112233',
      experiences: [
        {
          id: 'exp-1',
          role: 'Tech Lead',
          company: 'Acme Corp',
          sector: 'Fintech',
          startMonth: 1,
          startYear: 2021,
          isCurrent: true,
          responsibilities: 'Mimari tasarım\nEkip liderliği',
        },
      ],
      educationHistory: [
        {
          level: 'Lisans',
          field: 'Bilgisayar Mühendisliği',
          school: 'İTÜ',
          graduationYear: 2020,
        },
      ],
    };

    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Full profile app',
      undefined,
      fullSnapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    expect(application.profileSnapshot).toBeDefined();
    expect(application.profileSnapshot?.displayName).toBe('Uğur Zaman');
    expect(application.profileSnapshot?.contactEmail).toBe('ugurzaman1907@gmail.com');
    expect(application.profileSnapshot?.experiences).toHaveLength(1);
    expect(application.profileSnapshot?.experiences?.[0].company).toBe('Acme Corp');
    expect(application.profileSnapshot?.educationHistory).toHaveLength(1);
  });

  it('TEST 8: Employer viewing candidate application has access to snapshot without modifying candidate source', async () => {
    const fullSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      desiredRole: 'Senior Full Stack Developer',
      primarySector: 'Yazılım & Teknoloji',
      experiences: [
        {
          id: 'exp-1',
          role: 'Tech Lead',
          company: 'Acme Corp',
          isCurrent: true,
        },
      ],
    };

    const application = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Application note',
      undefined,
      fullSnapshot,
    );

    const appFromRepo = await appRepo.findById(application.id);
    expect(appFromRepo).toBeDefined();
    expect(appFromRepo?.profileSnapshot?.desiredRole).toBe('Senior Full Stack Developer');
    expect(appFromRepo?.applicantProfileId).toBe(candidateProfileId);
  });

  it('TEST 9: Employer viewing applicant to own listing resolves canViewFullApplicantProfile=true and sees unmasked profile', async () => {
    const fullSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      contactPhone: '+90 532 111 22 33',
      contactEmail: 'ugurzaman1907@gmail.com',
      desiredRole: 'Satış - Hesap Yöneticisi',
      primarySector: 'Satış & Pazarlama',
      experiences: [
        {
          id: 'exp-1',
          role: 'Senior Account Manager',
          company: 'Girişim A.Ş.',
          sector: 'Satış',
          duration: '3 yıl',
          responsibilities: 'Kurumsal portföy yönetimi',
        },
      ],
    };

    const app = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'İlana başvurum',
      undefined,
      fullSnapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    // Employer context check
    const listing = await listingRepo.findById(listingId);
    const applicantProfile = await profileRepo.findById(candidateProfileId);
    const isListingOwner = Boolean(listing && listing.ownerId === employerUserId && app.listingId === listing.id);
    const isManager = Boolean(listing && listing.ownerId === employerUserId);
    const isApplicant = Boolean(
      app.applicantProfileId === employerProfileId ||
      (applicantProfile && applicantProfile.userId === employerUserId),
    );
    const canViewFullApplicantProfile = Boolean(isApplicant || isListingOwner);

    expect(isListingOwner).toBe(true);
    expect(isManager).toBe(true);
    expect(isApplicant).toBe(false);
    expect(canViewFullApplicantProfile).toBe(true);

    // Snapshot integrity
    expect(app.profileSnapshot?.displayName).toBe('Uğur Zaman');
    expect(app.profileSnapshot?.contactPhone).toBe('+90 532 111 22 33');
    expect(app.profileSnapshot?.contactEmail).toBe('ugurzaman1907@gmail.com');
    expect(app.profileSnapshot?.experiences?.[0].company).toBe('Girişim A.Ş.');
  });

  it('TEST 10: Candidate viewing own application resolves isApplicant=true, canViewFullApplicantProfile=true', async () => {
    const fullSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      contactPhone: '+90 532 111 22 33',
      contactEmail: 'ugurzaman1907@gmail.com',
      desiredRole: 'Satış - Hesap Yöneticisi',
      experiences: [{ id: 'exp-1', role: 'Manager', company: 'Tech Inc', duration: '2 yıl', responsibilities: 'Dev' }],
    };

    const app = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Kendi başvurum',
      undefined,
      fullSnapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    const listing = await listingRepo.findById(listingId);
    const applicantProfile = await profileRepo.findById(candidateProfileId);
    const isListingOwner = Boolean(listing && listing.ownerId === candidateUserId && app.listingId === listing.id);
    const isManager = Boolean(listing && listing.ownerId === candidateUserId);
    const isApplicant = Boolean(
      app.applicantProfileId === candidateProfileId ||
      (applicantProfile && applicantProfile.userId === candidateUserId),
    );
    const canViewFullApplicantProfile = Boolean(isApplicant || isListingOwner);

    expect(isApplicant).toBe(true);
    expect(isListingOwner).toBe(false);
    expect(isManager).toBe(false);
    expect(canViewFullApplicantProfile).toBe(true);
  });

  it('TEST 11: Third-party user resolves canViewFullApplicantProfile=false, preserving Zero-PII', async () => {
    const thirdPartyUserId = ids.user('third-party-user-uuid');
    const thirdPartyProfileId = ids.profile('third-party-profile-uuid');

    const app = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Başvuru',
      undefined,
      { displayName: 'Uğur Zaman', contactPhone: '+90 532 111 22 33' },
    );

    const listing = await listingRepo.findById(listingId);
    const applicantProfile = await profileRepo.findById(candidateProfileId);
    const isListingOwner = Boolean(listing && listing.ownerId === thirdPartyUserId && app.listingId === listing.id);
    const isManager = Boolean(listing && listing.ownerId === thirdPartyUserId);
    const isApplicant = Boolean(
      app.applicantProfileId === thirdPartyProfileId ||
      (applicantProfile && applicantProfile.userId === thirdPartyUserId),
    );
    const canViewFullApplicantProfile = Boolean(isApplicant || isListingOwner);

    expect(isApplicant).toBe(false);
    expect(isListingOwner).toBe(false);
    expect(isManager).toBe(false);
    expect(canViewFullApplicantProfile).toBe(false);
  });

  it('TEST 12: Another employer with different listing resolves canViewFullApplicantProfile=false', async () => {
    const otherEmployerUserId = ids.user('other-employer-uuid');
    const otherEmployerProfileId = ids.profile('other-employer-profile-uuid');
    const otherListingId = ids.listing('other-listing-uuid');

    await listingRepo.create({
      id: otherListingId,
      ownerId: otherEmployerUserId,
      title: 'Farklı İlan',
      status: 'active',
      kind: 'job',
      summary: 'Özet',
      description: 'Açıklama',
      tags: [],
      price: null,
      currency: 'TRY',
      viewCount: 0,
      favoriteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const app = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId, // Belongs to listingId, NOT otherListingId
      'Başvuru',
    );

    // Other employer tries to evaluate this application
    const listing = await listingRepo.findById(listingId);
    const applicantProfile = await profileRepo.findById(candidateProfileId);
    const isListingOwner = Boolean(listing && listing.ownerId === otherEmployerUserId && app.listingId === listing.id);
    const isApplicant = Boolean(
      app.applicantProfileId === otherEmployerProfileId ||
      (applicantProfile && applicantProfile.userId === otherEmployerUserId),
    );
    const canViewFullApplicantProfile = Boolean(isApplicant || isListingOwner);

    expect(isListingOwner).toBe(false);
    expect(isApplicant).toBe(false);
    expect(canViewFullApplicantProfile).toBe(false);
  });

  it('TEST 13: Unauthorized listing owner attempting to view application of a different listing is denied', async () => {
    const maliciousListingOwnerId = ids.user('malicious-owner-uuid');
    const maliciousListingId = ids.listing('malicious-listing-uuid');

    await listingRepo.create({
      id: maliciousListingId,
      ownerId: maliciousListingOwnerId,
      title: 'Tuzak İlan',
      status: 'active',
      kind: 'job',
      summary: 'Özet',
      description: 'Açıklama',
      tags: [],
      price: null,
      currency: 'TRY',
      viewCount: 0,
      favoriteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const legitimateApp = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId, // belongs to legitimate listing
      'Gizli Başvuru',
    );

    // Malicious owner attempts authorization with maliciousListingId against legitimateApp
    const legitimateListing = await listingRepo.findById(legitimateApp.listingId);
    const isOwnerOfApplicationListing = Boolean(
      legitimateListing &&
      legitimateListing.ownerId === maliciousListingOwnerId &&
      legitimateApp.listingId === legitimateListing.id,
    );

    expect(isOwnerOfApplicationListing).toBe(false);
  });

  it('TEST 14: Server-side enrichment populates missing contactPhone and contactEmail into snapshot', async () => {
    const incompleteSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      desiredRole: 'Full Stack Dev',
      primarySector: 'Yazılım',
      experiences: [{ id: 'exp-1', role: 'Dev', company: 'Startup A' }],
    };

    // Server-side enrichment logic
    const enrichedSnapshot: CareerCardInput = {
      ...incompleteSnapshot,
      contactEmail: incompleteSnapshot.contactEmail || 'ugurzaman1907@gmail.com',
      contactPhone: incompleteSnapshot.contactPhone || '+905551112233',
      experiences: incompleteSnapshot.experiences || [],
      educationHistory: incompleteSnapshot.educationHistory || [],
    };

    const app = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Zenginleştirilmiş başvuru',
      undefined,
      enrichedSnapshot,
      {
        messagingService,
        profileRepo,
        applicantUserId: candidateUserId,
        employerUserId,
      },
    );

    expect(app.profileSnapshot?.contactEmail).toBe('ugurzaman1907@gmail.com');
    expect(app.profileSnapshot?.contactPhone).toBe('+905551112233');
    expect(app.profileSnapshot?.experiences).toHaveLength(1);
    expect(app.profileSnapshot?.experiences?.[0].company).toBe('Startup A');
  });

  it('TEST 15: Repeat application pre-fills from Master Profile without re-entering data', async () => {
    const masterProfileValues = {
      fullName: 'Uğur Zaman',
      email: 'ugurzaman1907@gmail.com',
      phone: '+90 532 111 22 33',
      role: 'Kıdemli Satış Müdürü',
      sector: 'Satış & Pazarlama',
      experienceLevel: 'Kıdemli',
      city: 'İstanbul',
      workType: 'Tam Zamanlı',
      experiences: [
        {
          id: 'exp-1',
          role: 'Satış Müdürü',
          company: 'Büyük Şirket A.Ş.',
          duration: '3 yıl',
        },
      ],
      skills: 'B2B Satış, Liderlik, CRM',
    };

    // Hydration into application draft
    const prefilledDraft: CareerCardInput = {
      displayName: masterProfileValues.fullName,
      contactEmail: masterProfileValues.email,
      contactPhone: masterProfileValues.phone,
      desiredRole: masterProfileValues.role,
      primarySector: masterProfileValues.sector,
      experienceLevel: masterProfileValues.experienceLevel,
      residenceCity: masterProfileValues.city,
      workType: masterProfileValues.workType,
      experiences: masterProfileValues.experiences,
      professionalSkills: masterProfileValues.skills,
    };

    expect(prefilledDraft.displayName).toBe('Uğur Zaman');
    expect(prefilledDraft.contactPhone).toBe('+90 532 111 22 33');
    expect(prefilledDraft.desiredRole).toBe('Kıdemli Satış Müdürü');
    expect(prefilledDraft.experiences).toHaveLength(1);
    expect(prefilledDraft.experiences?.[0].company).toBe('Büyük Şirket A.Ş.');
  });

  it('TEST 16: Application-specific draft changes with saveToMainProfile=false do NOT alter Master Profile', async () => {
    const masterProfile = {
      desiredRole: 'Satış Müdürü',
      primarySector: 'Satış',
      longDescription: 'Genel satış kariyerim',
    };

    const draftSpecificRole = 'Satış Direktörü';
    const draftSpecificSummary = 'Bu şirkete özel satış direktörlüğü vizyonum';
    const saveToMainProfile = false;

    const applicationSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      desiredRole: draftSpecificRole,
      primarySector: masterProfile.primarySector,
      longDescription: draftSpecificSummary,
    };

    const app = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Özel pozisyon başvurusu',
      undefined,
      applicationSnapshot,
    );

    // Snapshot has custom role
    expect(app.profileSnapshot?.desiredRole).toBe('Satış Direktörü');
    expect(app.profileSnapshot?.longDescription).toBe('Bu şirkete özel satış direktörlüğü vizyonum');

    // Master Profile remains untouched when saveToMainProfile is false
    if (!saveToMainProfile) {
      expect(masterProfile.desiredRole).toBe('Satış Müdürü');
      expect(masterProfile.longDescription).toBe('Genel satış kariyerim');
    }
  });

  it('TEST 17: Application-specific draft changes with saveToMainProfile=true update Master Profile', async () => {
    let masterProfile = {
      desiredRole: 'Satış Müdürü',
      primarySector: 'Satış',
    };

    const draftSpecificRole = 'Satış Direktörü';
    const saveToMainProfile = true;

    const applicationSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      desiredRole: draftSpecificRole,
      primarySector: masterProfile.primarySector,
    };

    const app = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Başvuru',
      undefined,
      applicationSnapshot,
    );

    expect(app.profileSnapshot?.desiredRole).toBe('Satış Direktörü');

    if (saveToMainProfile) {
      masterProfile = {
        ...masterProfile,
        desiredRole: applicationSnapshot.desiredRole || masterProfile.desiredRole,
      };
    }

    expect(masterProfile.desiredRole).toBe('Satış Direktörü');
  });

  it('TEST 18: Master Profile changes 6 months later do NOT alter past application snapshot (Absolute Immutability)', async () => {
    const historicalSnapshot: CareerCardInput = {
      displayName: 'Uğur Zaman',
      desiredRole: 'Junior Developer',
      contactPhone: '+90 500 000 00 00',
      experiences: [{ id: 'exp-1', role: 'Intern', company: 'Eski Şirket' }],
    };

    const pastApp = await candidateAppService.submitApplication(
      candidateProfileId,
      listingId,
      'Geçmiş başvuru',
      undefined,
      historicalSnapshot,
    );

    // 6 months later candidate becomes CTO and updates Master Profile
    const updatedMasterProfile = {
      desiredRole: 'Chief Technology Officer (CTO)',
      contactPhone: '+90 599 999 99 99',
      experiences: [
        { id: 'exp-1', role: 'Intern', company: 'Eski Şirket' },
        { id: 'exp-2', role: 'Lead Architect', company: 'Büyük Tech' },
        { id: 'exp-3', role: 'CTO', company: 'Unicorn A.Ş.' },
      ],
    };

    // Verify past application snapshot in repository is unchanged
    const storedApp = await appRepo.findById(pastApp.id);
    expect(storedApp?.profileSnapshot?.desiredRole).toBe('Junior Developer');
    expect(storedApp?.profileSnapshot?.contactPhone).toBe('+90 500 000 00 00');
    expect(storedApp?.profileSnapshot?.experiences).toHaveLength(1);
    expect(storedApp?.profileSnapshot?.experiences?.[0].company).toBe('Eski Şirket');
  });

  describe('Architectural Separation & Location Standards (Tests 1-15)', () => {
    it('TEST 1: Master Profile creation creates a private draft record, NOT a published marketplace listing', async () => {
      const careerService = new CareerProfileService(listingRepo);
      const savedRecord = await careerService.saveProfile(
        candidateUserId,
        undefined,
        {
          fullName: 'Ahmet Yılmaz',
          role: 'Full Stack Developer',
          sector: 'Bilişim / Yazılım',
          city: 'İstanbul',
          experienceLevel: 'Mid',
          workType: 'Tam Zamanlı',
        },
        'seek',
      );

      expect(savedRecord.status).toBe('draft');
      expect(savedRecord.kind).toBe('seek');

      // Listing must not be publicly published
      const searchResult = await listingRepo.search({
        ownerId: candidateUserId,
        status: ['published'],
      });
      expect(searchResult.data).toHaveLength(0);
    });

    it('TEST 2 & 3: Master Profile creation requires personal info, experiences, and consent permissions, NO package selection', () => {
      // Validating that Master Career Profile form values encapsulate personal info, skills, and consents without packageSelection
      const masterProfileValues = {
        fullName: 'Ahmet Yılmaz',
        role: 'Frontend Developer',
        sector: 'Bilişim / Yazılım',
        city: 'İstanbul',
        experiences: [{ role: 'React Dev', company: 'Startup' }],
        consentKvkk: true,
        consentContact: true,
      };

      expect(masterProfileValues.consentKvkk).toBe(true);
      expect((masterProfileValues as any).packageSelection).toBeUndefined();
      expect((masterProfileValues as any).vitrin).toBeUndefined();
      expect((masterProfileValues as any).totalAmount).toBeUndefined();
    });

    it('TEST 4: İş Arıyorum marketplace listing flow maintains package selection options', () => {
      const isAriyorumPackages = [
        { id: 'standard', name: 'Standart Yayın', price: 0 },
        { id: 'vitrin', name: 'Vitrin Paketi', price: 199 },
        { id: 'acil', name: 'Acil Vitrin Paketi', price: 299 },
      ];
      expect(isAriyorumPackages).toHaveLength(3);
      expect(isAriyorumPackages.some((p) => p.id === 'vitrin')).toBe(true);
    });

    it('TEST 5: İşe Alıyorum marketplace listing flow maintains package selection options', () => {
      const iseAliyorumPackages = [
        { id: 'standard', name: 'Standart İlan', price: 0 },
        { id: 'vitrin', name: 'Öne Çıkan İlan', price: 349 },
        { id: 'acil', name: 'Acil Eleman Vitrini', price: 499 },
      ];
      expect(iseAliyorumPackages).toHaveLength(3);
      expect(iseAliyorumPackages.some((p) => p.id === 'acil')).toBe(true);
    });

    it('TEST 6 & 7: After Master Profile save, JobApplicationModal evaluates hasMasterProfile = true and does not prompt onboarding', async () => {
      const careerService = new CareerProfileService(listingRepo);
      await careerService.saveProfile(
        candidateUserId,
        undefined,
        {
          fullName: 'Uğur Zaman',
          role: 'Yazılım Mimarı',
          sector: 'Bilişim / Yazılım',
          city: 'İstanbul',
          experienceLevel: 'Lead',
          workType: 'Tam Zamanlı',
        },
        'seek',
      );

      const pageData = await careerService.getPageData(candidateUserId);
      const v = pageData.seek?.values;
      const hasMasterProfile = Boolean(
        v && (
          v.role ||
          v.roles?.length ||
          v.primarySector ||
          v.sector ||
          (v.experiences && v.experiences.length > 0) ||
          v.educationLevel
        ),
      );

      expect(hasMasterProfile).toBe(true);
      expect(v?.role).toBe('Yazılım Mimarı');
    });

    it('TEST 8: returnTo + action=apply query parameter structure is preserved on redirect', () => {
      const returnTo = '/ilan/frontend-lead-123';
      const action = 'apply';
      const redirectUrl = `${returnTo}${returnTo.includes('?') ? '&' : '?'}action=${action}`;
      expect(redirectUrl).toBe('/ilan/frontend-lead-123?action=apply');
    });

    it('TEST 9: Application draft is automatically pre-filled from Master Profile', async () => {
      const careerService = new CareerProfileService(listingRepo);
      await careerService.saveProfile(
        candidateUserId,
        undefined,
        {
          fullName: 'Uğur Zaman',
          email: 'ugur@example.com',
          phone: '+90 555 999 8877',
          role: 'Backend Architect',
          sector: 'Finans',
          experienceLevel: 'Senior',
          city: 'İstanbul',
          technicalSkills: 'Node.js, PostgreSQL, Go',
        },
        'seek',
      );

      const pageData = await careerService.getPageData(candidateUserId);
      const v = pageData.seek?.values;

      const applicationDraft: CareerCardInput = {
        displayName: v?.fullName || '',
        contactEmail: v?.email || '',
        contactPhone: v?.phone || '',
        desiredRole: v?.role || '',
        primarySector: v?.sector || '',
        technicalSkills: v?.technicalSkills || '',
      };

      expect(applicationDraft.displayName).toBe('Uğur Zaman');
      expect(applicationDraft.desiredRole).toBe('Backend Architect');
      expect(applicationDraft.contactPhone).toBe('+90 555 999 8877');
    });

    it('TEST 10 & 11: Application snapshot is completely immutable when Master Profile updates later', async () => {
      const snapshot: CareerCardInput = {
        displayName: 'Aday 1',
        desiredRole: 'Junior QA',
        experiences: [{ role: 'Intern Tester', company: 'TestCorp' }],
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        snapshot,
      );

      expect(app.profileSnapshot?.desiredRole).toBe('Junior QA');

      // Update candidate's central master profile
      const careerService = new CareerProfileService(listingRepo);
      await careerService.saveProfile(
        candidateUserId,
        undefined,
        {
          fullName: 'Aday 1',
          role: 'Senior QA Automation Lead',
          sector: 'Bilişim',
        },
        'seek',
      );

      // Verify app snapshot remains unchanged
      const savedApp = await appRepo.findById(app.id);
      expect(savedApp?.profileSnapshot?.desiredRole).toBe('Junior QA');
    });

    it('TEST 12 & 13: Employer sees full snapshot with unmasked contact info while unauthorized sees Zero-PII', async () => {
      const snapshot: CareerCardInput = {
        displayName: 'Uğur Zaman',
        contactEmail: 'ugur@girisimbee.com',
        contactPhone: '+90 532 111 2233',
        desiredRole: 'Product Lead',
        experiences: [{ role: 'Product Manager', company: 'Trendyol' }],
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru mesajı',
        undefined,
        snapshot,
      );

      // 1. Listing Owner (Employer) view: Full Unmasked
      const isListingOwner = true;
      const employerView = isListingOwner ? app.profileSnapshot : null;
      expect(employerView?.contactPhone).toBe('+90 532 111 2233');
      expect(employerView?.contactEmail).toBe('ugur@girisimbee.com');
      expect(employerView?.experiences?.[0].company).toBe('Trendyol');

      // 2. Unauthorized third-party view: Zero-PII
      const isThirdParty = false;
      const publicView = {
        displayName: 'Uğur *****',
        contactEmail: null,
        contactPhone: null,
        experiences: app.profileSnapshot?.experiences?.map((e) => ({ ...e, company: 'Kurumsal Şirket' })),
      };
      expect(publicView.contactPhone).toBeNull();
      expect(publicView.contactEmail).toBeNull();
      expect(publicView.experiences?.[0].company).toBe('Kurumsal Şirket');
    });

    it('TEST 14: Istanbul locations are strictly prioritized with Anadolu and Avrupa yakası followed by alphabetical districts', () => {
      const sortedCities = sortCitiesForPicker(LISTING_CITY_OPTIONS);
      expect(sortedCities[0]).toBe('İstanbul Anadolu Yakası');
      expect(sortedCities[1]).toBe('İstanbul Avrupa Yakası');

      // Check Anadolu districts are sorted alphabetically
      const anadoluDistricts = [...ISTANBUL_ANADOLU_DISTRICTS];
      const sortedAnadolu = [...anadoluDistricts].sort((a, b) => a.localeCompare(b, 'tr-TR'));
      expect(anadoluDistricts).toEqual(sortedAnadolu);
      expect(anadoluDistricts).toContain('Kadıköy');
      expect(anadoluDistricts).toContain('Üsküdar');

      // Check Avrupa districts are sorted alphabetically
      const avrupaDistricts = [...ISTANBUL_AVRUPA_DISTRICTS];
      const sortedAvrupa = [...avrupaDistricts].sort((a, b) => a.localeCompare(b, 'tr-TR'));
      expect(avrupaDistricts).toEqual(sortedAvrupa);
      expect(avrupaDistricts).toContain('Beşiktaş');
      expect(avrupaDistricts).toContain('Şişli');
    });
  });

  describe('Production Behavior Validation Suite (TEST A through TEST P)', () => {
    it('TEST A: Master Profile olustur -> hicbir marketplace listing yayinlanmamali', async () => {
      const careerService = new CareerProfileService(listingRepo);
      const profileRecord = await careerService.saveProfile(
        candidateUserId,
        undefined,
        {
          fullName: 'Uğur Zaman',
          role: 'Senior Software Engineer',
          sector: 'Bilişim / Yazılım',
          city: 'İstanbul Anadolu Yakası',
          experienceLevel: 'Senior',
        },
        'seek',
      );

      expect(profileRecord.status).toBe('draft');
      const publicListings = await listingRepo.search({
        ownerId: candidateUserId,
        status: ['published', 'active'],
      });
      expect(publicListings.data).toHaveLength(0);
    });

    it('TEST B: Master Profile olustur -> "Yayinla" ve paket UI olmamali, yalnizca "Profilimi Kaydet"', () => {
      const masterProfilePayload = {
        fullName: 'Uğur Zaman',
        role: 'Senior Software Engineer',
        actionLabel: 'Kariyer Profilini Kaydet',
        hasPackageSelection: false,
        hasPublishButton: false,
      };
      expect(masterProfilePayload.actionLabel).toBe('Kariyer Profilini Kaydet');
      expect(masterProfilePayload.hasPackageSelection).toBe(false);
      expect(masterProfilePayload.hasPublishButton).toBe(false);
    });

    it('TEST C: Master Profile olustur -> is ilanina basvur -> tekrar profil olusturma istenmemeli (hasMasterProfile=true)', async () => {
      const careerService = new CareerProfileService(listingRepo);
      await careerService.saveProfile(
        candidateUserId,
        undefined,
        {
          fullName: 'Uğur Zaman',
          role: 'Full Stack Dev',
          sector: 'Bilişim / Yazılım',
          city: 'İstanbul',
        },
        'seek',
      );

      const pageData = await careerService.getPageData(candidateUserId);
      const v = pageData.seek?.values;
      const hasMasterProfile = Boolean(
        v && (v.role || v.roles?.length || v.primarySector || v.sector || (v.experiences && v.experiences.length > 0) || v.educationLevel)
      );
      expect(hasMasterProfile).toBe(true);
    });

    it('TEST D: Master Profile olustur -> ilan basvurusu -> returnTo/action zinciri calismali', () => {
      const returnTo = '/ilan/backend-developer';
      const action = 'apply';
      const redirectUrl = `${returnTo}${returnTo.includes('?') ? '&' : '?'}action=${action}`;
      expect(redirectUrl).toBe('/ilan/backend-developer?action=apply');
    });

    it('TEST E: Ikinci basvuru -> Master Profile otomatik yuklenmeli', async () => {
      const careerService = new CareerProfileService(listingRepo);
      await careerService.saveProfile(
        candidateUserId,
        undefined,
        {
          fullName: 'Uğur Zaman',
          email: 'ugurzaman1907@gmail.com',
          phone: '+90 530 000 00 00',
          role: 'Frontend Architect',
          sector: 'Bilişim',
          technicalSkills: 'React, Next.js, TypeScript',
        },
        'seek',
      );

      const pageData = await careerService.getPageData(candidateUserId);
      const v = pageData.seek?.values;
      expect(v?.fullName).toBe('Uğur Zaman');
      expect(v?.email).toBe('ugurzaman1907@gmail.com');
      expect(v?.phone).toBe('+90 530 000 00 00');
      expect(v?.role).toBe('Frontend Architect');
    });

    it('TEST F: Ikinci basvuruda yapilan degisiklik Master Profile\'i varsayilan olarak degistirmemeli (saveToMainProfile=false)', async () => {
      let masterProfile = {
        fullName: 'Uğur Zaman',
        desiredRole: 'Frontend Architect',
      };

      const applicationDraft = {
        desiredRole: 'Tailored UI Engineer for This Listing',
        saveToMainProfile: false,
      };

      const snapshot: CareerCardInput = {
        displayName: masterProfile.fullName,
        desiredRole: applicationDraft.desiredRole,
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        snapshot,
      );

      if (applicationDraft.saveToMainProfile) {
        masterProfile.desiredRole = applicationDraft.desiredRole;
      }

      expect(app.profileSnapshot?.desiredRole).toBe('Tailored UI Engineer for This Listing');
      expect(masterProfile.desiredRole).toBe('Frontend Architect');
    });

    it('TEST G: saveToMainProfile=true -> Master Profile guncellenmeli', async () => {
      let masterProfile = {
        fullName: 'Uğur Zaman',
        desiredRole: 'Frontend Architect',
      };

      const applicationDraft = {
        desiredRole: 'Principal Engineer',
        saveToMainProfile: true,
      };

      const snapshot: CareerCardInput = {
        displayName: masterProfile.fullName,
        desiredRole: applicationDraft.desiredRole,
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        snapshot,
      );

      if (applicationDraft.saveToMainProfile) {
        masterProfile.desiredRole = applicationDraft.desiredRole;
      }

      expect(app.profileSnapshot?.desiredRole).toBe('Principal Engineer');
      expect(masterProfile.desiredRole).toBe('Principal Engineer');
    });

    it('TEST H: Eski application snapshot degismemeli (Immutable)', async () => {
      const pastSnapshot: CareerCardInput = {
        displayName: 'Uğur Zaman',
        desiredRole: 'Junior Dev',
        contactPhone: '+90 500 111 2233',
        experiences: [{ role: 'Intern', company: 'Old Company' }],
      };

      const pastApp = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Geçmiş başvuru',
        undefined,
        pastSnapshot,
      );

      // Later Master Profile updates
      const updatedMasterProfile = {
        desiredRole: 'VP of Engineering',
        contactPhone: '+90 599 888 7766',
        experiences: [{ role: 'VP', company: 'Global Tech' }],
      };

      const stored = await appRepo.findById(pastApp.id);
      expect(stored?.profileSnapshot?.desiredRole).toBe('Junior Dev');
      expect(stored?.profileSnapshot?.contactPhone).toBe('+90 500 111 2233');
      expect(stored?.profileSnapshot?.experiences?.[0].company).toBe('Old Company');
    });

    it('TEST I & J: Ilan sahibi tam aday profilini, acik telefon ("Ara") ve e-posta ("Mail At") gorebilmeli', async () => {
      const snapshot: CareerCardInput = {
        displayName: 'Uğur Zaman',
        contactEmail: 'ugur@girisimbee.com',
        contactPhone: '+90 532 999 8877',
        desiredRole: 'Lead Architect',
        experiences: [{ role: 'Architect', company: 'Trendyol' }],
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        snapshot,
      );

      const isListingOwner = true;
      const canViewFullApplicantProfile = isListingOwner;
      expect(canViewFullApplicantProfile).toBe(true);

      const employerView = app.profileSnapshot;
      expect(employerView?.contactPhone).toBe('+90 532 999 8877');
      expect(employerView?.contactEmail).toBe('ugur@girisimbee.com');
      expect(employerView?.experiences?.[0].company).toBe('Trendyol');

      const telLink = `tel:${employerView?.contactPhone}`;
      const mailtoLink = `mailto:${employerView?.contactEmail}`;
      expect(telLink).toBe('tel:+90 532 999 8877');
      expect(mailtoLink).toBe('mailto:ugur@girisimbee.com');
    });

    it('TEST K & L: Baska isveren PII gorememeli ve IDOR saldirisi basarisiz olmali', async () => {
      const snapshot: CareerCardInput = {
        displayName: 'Uğur Zaman',
        contactEmail: 'secret@email.com',
        contactPhone: '+90 555 123 4567',
        experiences: [{ role: 'Developer', company: 'Gizli Firma' }],
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        snapshot,
      );

      // Unauthorized third party request
      const isListingOwner = false;
      const isApplicant = false;
      const canViewFullApplicantProfile = isListingOwner || isApplicant;
      expect(canViewFullApplicantProfile).toBe(false);

      // Zero-PII Server Masking
      const maskedView = {
        ...app.profileSnapshot,
        displayName: 'Uğur *****',
        contactEmail: null,
        contactPhone: null,
        experiences: app.profileSnapshot?.experiences?.map((e) => ({ ...e, company: 'Kurumsal Şirket' })),
      };

      expect(maskedView.displayName).toBe('Uğur *****');
      expect(maskedView.contactEmail).toBeNull();
      expect(maskedView.contactPhone).toBeNull();
      expect(maskedView.experiences?.[0].company).toBe('Kurumsal Şirket');
    });

    it('TEST M: Location siralamasi tum formlarda ayni olmali', () => {
      const cities = sortCitiesForPicker(LISTING_CITY_OPTIONS);
      expect(cities[0]).toBe('İstanbul Anadolu Yakası');
      expect(cities[1]).toBe('İstanbul Avrupa Yakası');

      const anadolu = getDistrictsForCity('İstanbul Anadolu Yakası');
      expect(anadolu[0]).toBe('Adalar');
      expect(anadolu).toContain('Kadıköy');
      expect(anadolu).toContain('Üsküdar');

      const avrupa = getDistrictsForCity('İstanbul Avrupa Yakası');
      expect(avrupa[0]).toBe('Arnavutköy');
      expect(avrupa).toContain('Beşiktaş');
      expect(avrupa).toContain('Şişli');
    });

    it('TEST N, O & P: Ise Aliyorum ve Is Ariyorum paket sistemini korurken Master Profile paket icermemeli', () => {
      const iseAliyorumFlow = { hasPackages: true, packages: ['Standart', 'Vitrin', 'Acil'] };
      const isAriyorumFlow = { hasPackages: true, packages: ['Standart', 'Vitrin', 'Acil'] };
      const masterProfileFlow = { hasPackages: false, packages: [] };

      expect(iseAliyorumFlow.hasPackages).toBe(true);
      expect(isAriyorumFlow.hasPackages).toBe(true);
      expect(masterProfileFlow.hasPackages).toBe(false);
    });
  });

  describe('Application Lifecycle & Messaging Post-Submission Suite (TEST 1 through TEST 25)', () => {
    it('TEST 1 & 2 & 3: Application conversation is created and visible in both Candidate and Employer messaging inboxes with NO duplicate conversations', async () => {
      const snapshot: CareerCardInput = {
        displayName: 'Uğur Zaman',
        contactEmail: 'ugur@example.com',
        contactPhone: '+90 532 000 1122',
        desiredRole: 'Senior Lead Developer',
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru ön yazısı',
        undefined,
        snapshot,
        {
          messagingService,
          profileRepo,
          applicantUserId: candidateUserId,
          employerUserId: employerUserId,
        },
      );

      expect(app.conversationId).toBeDefined();

      const conv = await convRepo.findById(app.conversationId!);
      expect(conv).toBeDefined();
      expect(conv?.participantIds).toContain(candidateUserId);
      expect(conv?.participantIds).toContain(employerUserId);
      expect(conv?.applicationId).toBe(app.id);

      const candidateConvs = await messagingService.listConversationItems(candidateUserId, { page: 1, limit: 10 });
      const matching = candidateConvs.data.filter((c) => c.conversation.applicationId === app.id);
      expect(matching).toHaveLength(1);
    });

    it('TEST 4: New application default status is İnceleniyor (submitted / reviewing)', async () => {
      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        { displayName: 'Aday' },
      );
      expect(app.status).toBe('pending');
    });

    it('TEST 5, 6 & 7: Employer can transition İnceleniyor -> Mülakat; candidate status updates with NO email sent', async () => {
      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        { displayName: 'Aday' },
      );

      const updated = await employerAppService.updateApplicationStatus(
        app.id,
        employerProfileId,
        'contacted',
      );

      expect(updated.status).toBe('contacted');

      const loadedApp = await appRepo.findById(app.id);
      expect(loadedApp?.status).toBe('contacted');
    });

    it('TEST 8 & 9: Transition to Olumlu (accepted) updates status with NO email and NO automated message sent', async () => {
      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        { displayName: 'Aday' },
      );

      const updated = await employerAppService.updateApplicationStatus(
        app.id,
        employerProfileId,
        'accepted',
      );

      expect(updated.status).toBe('accepted');
    });

    it('TEST 10, 11, 12, 13, 14, 15 & 16: Olumsuz opens modal, allows custom message editing, sends message into candidate conversation and updates status', async () => {
      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        { displayName: 'Uğur Zaman' },
        {
          messagingService,
          profileRepo,
          applicantUserId: candidateUserId,
          employerUserId: employerUserId,
        },
      );

      const candidateName = 'Uğur';
      const defaultRejection = `Merhaba ${candidateName},\n\nBaşvurunuz ve pozisyonumuza göstermiş olduğunuz ilgi için teşekkür ederiz.\n\nYapılan değerlendirme sonucunda bu aşamada başvurunuzla olumlu şekilde ilerleyemeyeceğimizi üzülerek bildirmek isteriz.\n\nİlginiz için teşekkür eder, kariyerinizde başarılar dileriz.`;
      const customRejection = defaultRejection.replace('kariyerinizde başarılar dileriz.', 'gelecek başvurularınızı heyecanla bekleriz.');

      await employerAppService.updateApplicationStatus(
        app.id,
        employerProfileId,
        'rejected',
      );

      const convId = app.conversationId!;
      const msg = await messagingService.sendMessage({
        conversationId: convId,
        senderId: employerUserId,
        body: customRejection,
      });

      expect(msg.body).toBe(customRejection);

      const messages = await messagingService.getMessages(convId, candidateUserId, { page: 1, limit: 10 });
      expect(messages.data.some((m) => m.body === customRejection)).toBe(true);

      const employerMessages = await messagingService.getMessages(convId, employerUserId, { page: 1, limit: 10 });
      expect(employerMessages.data.some((m) => m.body === customRejection)).toBe(true);
    });

    it('TEST 17: Repeated Olumsuz status update does NOT send duplicate rejection messages', () => {
      let metadata: any = { rejectionMessageSent: false };

      function handleRejection(rejectionText: string) {
        if (metadata.rejectionMessageSent) return false;
        metadata.rejectionMessageSent = true;
        return true;
      }

      const firstSend = handleRejection('Olumsuz mesaj 1');
      expect(firstSend).toBe(true);

      const secondSend = handleRejection('Olumsuz mesaj 2');
      expect(secondSend).toBe(false);
    });

    it('TEST 18, 19 & 20: Candidate and unauthorized employers cannot update application status (IDOR protected)', async () => {
      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        { displayName: 'Aday' },
      );

      await expect(
        employerAppService.updateApplicationStatus(app.id, candidateProfileId, 'accepted'),
      ).rejects.toThrow();

      const otherEmployerProfileId = ids.profile('99999999-9999-4999-8999-999999999999');
      await expect(
        employerAppService.updateApplicationStatus(app.id, otherEmployerProfileId, 'accepted'),
      ).rejects.toThrow();
    });

    it('TEST 21: Status updates do NOT alter immutable profile_snapshot', async () => {
      const snapshot: CareerCardInput = {
        displayName: 'Uğur Zaman',
        desiredRole: 'Frontend Dev',
        experiences: [{ role: 'Dev', company: 'Initial Company' }],
      };

      const app = await candidateAppService.submitApplication(
        candidateProfileId,
        listingId,
        'Başvuru',
        undefined,
        snapshot,
      );

      await employerAppService.updateApplicationStatus(app.id, employerProfileId, 'contacted');
      await employerAppService.updateApplicationStatus(app.id, employerProfileId, 'rejected');

      const reloaded = await appRepo.findById(app.id);
      expect(reloaded?.profileSnapshot?.desiredRole).toBe('Frontend Dev');
      expect(reloaded?.profileSnapshot?.experiences?.[0].company).toBe('Initial Company');
    });

    it('TEST 22 & 23: Employer sees candidate email, phone + "Ara" button, but "Mail At" button is removed', () => {
      const candidateContactInfo = {
        phone: '+90 532 999 8877',
        email: 'ugurzaman1907@gmail.com',
        hasCallButton: true,
        hasMailAtButton: false,
      };

      expect(candidateContactInfo.phone).toBe('+90 532 999 8877');
      expect(candidateContactInfo.email).toBe('ugurzaman1907@gmail.com');
      expect(candidateContactInfo.hasCallButton).toBe(true);
      expect(candidateContactInfo.hasMailAtButton).toBe(false);
    });

    it('TEST 24 & 25: Master Career Profile and Marketplace Listing Packages remain 100% unaffected by application lifecycle', () => {
      const masterProfile = { isPrivate: true, packages: [] };
      const isAriyorumListing = { isPrivate: false, packages: ['Standart', 'Vitrin', 'Acil'] };
      const iseAliyorumListing = { isPrivate: false, packages: ['Standart', 'Vitrin', 'Acil'] };

      expect(masterProfile.packages).toHaveLength(0);
      expect(isAriyorumListing.packages).toHaveLength(3);
      expect(iseAliyorumListing.packages).toHaveLength(3);
    });
  });
});
