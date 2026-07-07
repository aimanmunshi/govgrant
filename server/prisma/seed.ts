import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Password123!';

const daysFromNow = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
};

async function main() {
  console.log('Wiping existing data...');
  // Delete in FK-safe order
  await prisma.activityLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.proposalAssignment.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: { name: 'ADMIN', email: 'admin@gmail.com', password, role: 'ADMIN' },
  });

  const [reviewer1, reviewer2, reviewer3] = await Promise.all([
    prisma.user.create({
      data: { name: 'reviewer1', email: 'reviewer1@govgrant.in', password, role: 'REVIEWER' },
    }),
    prisma.user.create({
      data: { name: 'reviewer2', email: 'reviewer2@govgrant.in', password, role: 'REVIEWER' },
    }),
    prisma.user.create({
      data: { name: 'reviewer3', email: 'reviewer3@govgrant.in', password, role: 'REVIEWER' },
    }),
  ]);

  const [applicant1, applicant2, applicant3] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'applicant1', email: 'applicant1@govgrant.in', password, role: 'APPLICANT',
        organization: 'IIT Delhi',
      },
    }),
    prisma.user.create({
      data: {
        name: 'applicant2', email: 'applicant2@govgrant.in', password, role: 'APPLICANT',
        organization: 'C-DOT',
      },
    }),
    prisma.user.create({
      data: {
        name: 'applicant3', email: 'applicant3@govgrant.in', password, role: 'APPLICANT',
        organization: 'IIT Bombay',
      },
    }),
  ]);

  console.log('Creating proposals...');

  // ── DRAFT: applicant still editing, never submitted ──────────────────────
  const draft1 = await prisma.proposal.create({
    data: {
      title: 'AI-Based Network Anomaly Detection',
      description:
        'A machine-learning system to detect anomalous traffic patterns in telecom core networks in real time.',
      trlLevel: 3,
      fundingAmount: 8_000_000,
      domain: 'AI/ML for Networks',
      status: 'DRAFT',
      applicantId: applicant1.id,
    },
  });

  const draft2 = await prisma.proposal.create({
    data: {
      title: 'Quantum Key Distribution Testbed',
      description:
        'Building a campus-scale QKD testbed to evaluate quantum-secure links for future telecom infrastructure.',
      trlLevel: 2,
      fundingAmount: 45_000_000,
      domain: 'Quantum Communication',
      status: 'DRAFT',
      applicantId: applicant3.id,
    },
  });

  // ── SUBMITTED: waiting for admin to assign reviewers ──────────────────────
  const submitted1 = await prisma.proposal.create({
    data: {
      title: 'Low-Cost Rural Broadband via TV White Space',
      description:
        'Using unused TV spectrum to deliver affordable broadband connectivity to unconnected rural villages.',
      trlLevel: 5,
      fundingAmount: 60_000_000,
      domain: 'Rural Broadband',
      status: 'SUBMITTED',
      submittedAt: daysFromNow(-2),
      applicantId: applicant2.id,
    },
  });

  const submitted2 = await prisma.proposal.create({
    data: {
      title: 'Smart IoT Sensor Mesh for Agriculture',
      description:
        'A low-power IoT mesh network for soil and irrigation monitoring across smallholder farms.',
      trlLevel: 4,
      fundingAmount: 15_000_000,
      domain: 'IoT & Sensors',
      status: 'SUBMITTED',
      submittedAt: daysFromNow(-1),
      applicantId: applicant1.id,
    },
  });

  // ── UNDER_REVIEW: reviewers assigned, reviews in various states ──────────
  const underReview1 = await prisma.proposal.create({
    data: {
      title: '5G Small Cell Deployment Framework',
      description:
        'A cost-optimized framework for dense urban 5G small-cell deployment using shared municipal infrastructure.',
      trlLevel: 6,
      fundingAmount: 90_000_000,
      domain: '5G Technology',
      status: 'UNDER_REVIEW',
      submittedAt: daysFromNow(-10),
      applicantId: applicant2.id,
    },
  });
  await prisma.proposalAssignment.createMany({
    data: [
      { proposalId: underReview1.id, reviewerId: reviewer1.id },
      { proposalId: underReview1.id, reviewerId: reviewer2.id },
    ],
  });
  // reviewer1 has reviewed, reviewer2 has not — tests partial-review state
  await prisma.review.create({
    data: {
      proposalId: underReview1.id,
      reviewerId: reviewer1.id,
      score: 78,
      comments:
        'Solid technical approach and realistic deployment plan. Cost model could use more validation against pilot data.',
    },
  });

  const underReview2 = await prisma.proposal.create({
    data: {
      title: 'Satellite IoT Backhaul for Remote Areas',
      description:
        'LEO satellite backhaul solution to connect IoT gateways in regions with no terrestrial network coverage.',
      trlLevel: 5,
      fundingAmount: 70_000_000,
      domain: 'Satellite Communication',
      status: 'UNDER_REVIEW',
      submittedAt: daysFromNow(-7),
      applicantId: applicant3.id,
    },
  });
  await prisma.proposalAssignment.createMany({
    data: [
      { proposalId: underReview2.id, reviewerId: reviewer2.id },
      { proposalId: underReview2.id, reviewerId: reviewer3.id },
    ],
  });
  // no reviews yet at all — tests fully-pending review state

  // ── APPROVED: past review, now executing milestones ──────────────────────
  const approved1 = await prisma.proposal.create({
    data: {
      title: 'Indigenous Optical Fiber Cable Manufacturing',
      description:
        'Setting up domestic manufacturing capacity for high-grade optical fiber cable to reduce import dependency.',
      trlLevel: 7,
      fundingAmount: 250_000_000,
      domain: 'Optical Fiber',
      status: 'APPROVED',
      submittedAt: daysFromNow(-30),
      applicantId: applicant1.id,
    },
  });
  await prisma.proposalAssignment.createMany({
    data: [
      { proposalId: approved1.id, reviewerId: reviewer1.id },
      { proposalId: approved1.id, reviewerId: reviewer3.id },
    ],
  });
  await prisma.review.createMany({
    data: [
      { proposalId: approved1.id, reviewerId: reviewer1.id, score: 85, comments: 'Strong industrial capability and clear import-substitution case. Recommended for funding.' },
      { proposalId: approved1.id, reviewerId: reviewer3.id, score: 80, comments: 'Good proposal; timeline for Phase 2 tooling seems slightly optimistic.' },
    ],
  });
  await prisma.milestone.createMany({
    data: [
      { proposalId: approved1.id, title: 'Phase 1: Facility Setup', description: 'Land acquisition and cleanroom construction.', dueDate: daysFromNow(-20), status: 'COMPLETED', fundRelease: 50_000_000 },
      { proposalId: approved1.id, title: 'Phase 2: Production Line Installation', description: 'Fiber drawing tower and coating line installation.', dueDate: daysFromNow(10), status: 'IN_PROGRESS', fundRelease: 100_000_000 },
      { proposalId: approved1.id, title: 'Phase 3: Certification & First Batch', description: 'ITU-T compliance testing and first commercial batch.', dueDate: daysFromNow(60), status: 'PENDING', fundRelease: 100_000_000 },
    ],
  });

  const approved2 = await prisma.proposal.create({
    data: {
      title: 'Cybersecurity Framework for Telecom Core Networks',
      description:
        'A threat-detection and zero-trust access framework purpose-built for telecom core network operators.',
      trlLevel: 6,
      fundingAmount: 40_000_000,
      domain: 'Cybersecurity',
      status: 'APPROVED',
      submittedAt: daysFromNow(-25),
      applicantId: applicant2.id,
    },
  });
  await prisma.proposalAssignment.create({
    data: { proposalId: approved2.id, reviewerId: reviewer2.id },
  });
  await prisma.review.create({
    data: {
      proposalId: approved2.id, reviewerId: reviewer2.id, score: 72,
      comments: 'Relevant and timely given recent sector incidents. Would like tighter integration testing with legacy OSS/BSS systems.',
    },
  });
  await prisma.milestone.createMany({
    data: [
      { proposalId: approved2.id, title: 'Threat Model & Architecture', description: 'Complete threat modeling and reference architecture.', dueDate: daysFromNow(-15), status: 'COMPLETED', fundRelease: 10_000_000 },
      // overdue: due date has passed but still not completed
      { proposalId: approved2.id, title: 'Pilot Deployment', description: 'Pilot deployment on a regional core network segment.', dueDate: daysFromNow(-5), status: 'OVERDUE', fundRelease: 15_000_000 },
      { proposalId: approved2.id, title: 'Full Rollout & Audit', description: 'Full rollout and independent security audit.', dueDate: daysFromNow(45), status: 'PENDING', fundRelease: 15_000_000 },
    ],
  });

  // ── REJECTED ────────────────────────────────────────────────────────────
  const rejected1 = await prisma.proposal.create({
    data: {
      title: 'Legacy 3G Infrastructure Extension',
      description:
        'Proposal to extend the operational life of existing 3G infrastructure in select rural circles.',
      trlLevel: 4,
      fundingAmount: 20_000_000,
      domain: '5G Technology',
      status: 'REJECTED',
      submittedAt: daysFromNow(-40),
      applicantId: applicant3.id,
    },
  });
  await prisma.proposalAssignment.create({
    data: { proposalId: rejected1.id, reviewerId: reviewer1.id },
  });
  await prisma.review.create({
    data: {
      proposalId: rejected1.id, reviewerId: reviewer1.id, score: 35,
      comments: 'Investing further in 3G runs counter to national spectrum refarming plans. Not recommended for funding.',
    },
  });

  // ── FUNDED: fully approved and all milestones completed ──────────────────
  const funded1 = await prisma.proposal.create({
    data: {
      title: 'Optical Ground Station Network for Satellite Comm',
      description:
        'A network of optical ground stations to support high-throughput free-space optical satellite links.',
      trlLevel: 8,
      fundingAmount: 180_000_000,
      domain: 'Satellite Communication',
      status: 'FUNDED',
      submittedAt: daysFromNow(-90),
      applicantId: applicant1.id,
    },
  });
  await prisma.proposalAssignment.createMany({
    data: [
      { proposalId: funded1.id, reviewerId: reviewer1.id },
      { proposalId: funded1.id, reviewerId: reviewer2.id },
    ],
  });
  await prisma.review.createMany({
    data: [
      { proposalId: funded1.id, reviewerId: reviewer1.id, score: 90, comments: 'Excellent technical maturity and a clear commercialization path. Strongly recommended.' },
      { proposalId: funded1.id, reviewerId: reviewer2.id, score: 88, comments: 'Well-executed pilot data. One of the stronger proposals this cycle.' },
    ],
  });
  await prisma.milestone.createMany({
    data: [
      { proposalId: funded1.id, title: 'Site Selection & Ground Station 1', dueDate: daysFromNow(-70), status: 'COMPLETED', fundRelease: 60_000_000 },
      { proposalId: funded1.id, title: 'Ground Station 2 & Link Testing', dueDate: daysFromNow(-40), status: 'COMPLETED', fundRelease: 60_000_000 },
      { proposalId: funded1.id, title: 'Network Integration & Handover', dueDate: daysFromNow(-10), status: 'COMPLETED', fundRelease: 60_000_000 },
    ],
  });

  const funded2 = await prisma.proposal.create({
    data: {
      title: 'Rural 4G/5G Tower Sharing Optimization',
      description:
        'An optimization platform enabling multiple operators to share tower infrastructure in low-ARPU rural circles.',
      trlLevel: 8,
      fundingAmount: 95_000_000,
      domain: 'Rural Broadband',
      status: 'FUNDED',
      submittedAt: daysFromNow(-120),
      applicantId: applicant2.id,
    },
  });
  await prisma.proposalAssignment.create({
    data: { proposalId: funded2.id, reviewerId: reviewer3.id },
  });
  await prisma.review.create({
    data: {
      proposalId: funded2.id, reviewerId: reviewer3.id, score: 82,
      comments: 'Demonstrated meaningful capex reduction across pilot circles. Approved for full rollout funding.',
    },
  });
  await prisma.milestone.createMany({
    data: [
      { proposalId: funded2.id, title: 'Pilot Circle Rollout', dueDate: daysFromNow(-90), status: 'COMPLETED', fundRelease: 45_000_000 },
      { proposalId: funded2.id, title: 'Multi-Operator Platform Rollout', dueDate: daysFromNow(-30), status: 'COMPLETED', fundRelease: 50_000_000 },
    ],
  });

  console.log('Creating activity log entries...');
  await prisma.activityLog.createMany({
    data: [
      { userId: applicant2.id, proposalId: submitted1.id, action: 'PROPOSAL_SUBMITTED', description: `Proposal "${submitted1.title}" submitted for review` },
      { userId: applicant1.id, proposalId: submitted2.id, action: 'PROPOSAL_SUBMITTED', description: `Proposal "${submitted2.title}" submitted for review` },
      { userId: admin.id, proposalId: underReview1.id, action: 'REVIEWER_ASSIGNED', description: `Reviewers assigned to "${underReview1.title}"` },
      { userId: reviewer1.id, proposalId: underReview1.id, action: 'REVIEW_SUBMITTED', description: `Review submitted for "${underReview1.title}" with score 78` },
      { userId: admin.id, proposalId: approved1.id, action: 'PROPOSAL_STATUS_CHANGED', description: `Proposal "${approved1.title}" status changed to APPROVED` },
      { userId: admin.id, proposalId: approved2.id, action: 'PROPOSAL_STATUS_CHANGED', description: `Proposal "${approved2.title}" status changed to APPROVED` },
      { userId: admin.id, proposalId: rejected1.id, action: 'PROPOSAL_STATUS_CHANGED', description: `Proposal "${rejected1.title}" status changed to REJECTED` },
      { userId: admin.id, proposalId: funded1.id, action: 'PROPOSAL_STATUS_CHANGED', description: `Proposal "${funded1.title}" status changed to FUNDED` },
      { userId: admin.id, proposalId: funded2.id, action: 'PROPOSAL_STATUS_CHANGED', description: `Proposal "${funded2.title}" status changed to FUNDED` },
    ],
  });

  console.log('\nSeed complete.');
  console.log(`All accounts use password: ${SEED_PASSWORD}`);
  console.log('  admin@gmail.com          (ADMIN)');
  console.log('  reviewer1@govgrant.in    (REVIEWER)');
  console.log('  reviewer2@govgrant.in    (REVIEWER)');
  console.log('  reviewer3@govgrant.in    (REVIEWER)');
  console.log('  applicant1@govgrant.in   (APPLICANT, IIT Delhi)');
  console.log('  applicant2@govgrant.in   (APPLICANT, C-DOT)');
  console.log('  applicant3@govgrant.in   (APPLICANT, IIT Bombay)');
  console.log('\nProposals: 2 DRAFT, 2 SUBMITTED, 2 UNDER_REVIEW, 2 APPROVED, 1 REJECTED, 2 FUNDED');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
