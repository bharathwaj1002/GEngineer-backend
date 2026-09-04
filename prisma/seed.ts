import { PrismaClient, Role, Track, AssignmentStatus, RowKind } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function hash(pw: string) {
  return argon2.hash(pw);
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@gengineer.dev';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const candidatePassword = process.env.SEED_CANDIDATE_PASSWORD ?? 'ChangeMe123!';

  console.log('Seeding development data...');

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: await hash(adminPassword), role: Role.ADMIN },
  });

  // ---- Candidate A: 1-Day track, in progress ----
  const userA = await prisma.user.upsert({
    where: { email: 'candidate.oneday@gengineer.dev' },
    update: {},
    create: {
      email: 'candidate.oneday@gengineer.dev',
      passwordHash: await hash(candidatePassword),
      role: Role.CANDIDATE,
    },
  });
  const candidateA = await prisma.candidate.upsert({
    where: { userId: userA.id },
    update: {},
    create: {
      userId: userA.id,
      candidateId: 'GE-CAND-0001',
      fullName: 'Aditi Rao',
      roleTitle: 'Game Dev Trainee Applicant',
      phone: '+91 90000 00001',
      experience: '1 yr Unity (personal projects)',
    },
  });

  const existingA = await prisma.assignment.findFirst({ where: { candidateId: candidateA.id } });
  if (!existingA) {
    const startedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const assignmentA = await prisma.assignment.create({
      data: {
        candidateId: candidateA.id,
        track: Track.ONE_DAY,
        taskVersion: 's1-v1',
        startDate: new Date(new Date().toDateString()),
        startTime: '09:00',
        deadline: new Date(new Date().setHours(18, 30, 0, 0)),
        status: AssignmentStatus.IN_PROGRESS,
        actualStartedAt: startedAt,
        submission: {
          create: {
            answers: {
              's1-t1-topic': 'Player movement with Rigidbody',
              's1-t1-what': 'Using Unity’s Rigidbody + AddForce/MovePosition to move a character with proper physics interactions.',
              's1-t1-why': 'Almost every 3D/2D physics-based game needs correct, collision-aware movement — get this wrong and everything downstream (combat, platforming) breaks.',
            },
          },
        },
      },
      include: { submission: true },
    });

    await prisma.linkItem.create({
      data: {
        submissionId: assignmentA.submission!.id,
        sectionId: 's1-t1-sources',
        order: 0,
        title: 'Unity Rigidbody documentation',
        linkType: 'Documentation',
        url: 'https://docs.unity3d.com/Manual/class-Rigidbody.html',
        note: 'Reference for AddForce vs MovePosition semantics.',
      },
    });

    const lessonRows = [
      {
        lesson: 'Lesson 1 — Moving with forces',
        learn: 'The difference between AddForce and MovePosition.',
        show: 'A capsule that accelerates and decelerates smoothly.',
      },
      {},
      {},
    ];
    for (let i = 0; i < lessonRows.length; i++) {
      await prisma.repeatableRow.create({
        data: {
          submissionId: assignmentA.submission!.id,
          sectionId: 's1-t2',
          kind: RowKind.REPEATABLE,
          order: i,
          data: lessonRows[i],
        },
      });
    }
  }

  // ---- Candidate B: 2-Day track, submitted, media-reviewed ----
  const userB = await prisma.user.upsert({
    where: { email: 'candidate.twoday@gengineer.dev' },
    update: {},
    create: {
      email: 'candidate.twoday@gengineer.dev',
      passwordHash: await hash(candidatePassword),
      role: Role.CANDIDATE,
    },
  });
  const candidateB = await prisma.candidate.upsert({
    where: { userId: userB.id },
    update: {},
    create: {
      userId: userB.id,
      candidateId: 'GE-CAND-0002',
      fullName: 'Rohan Mehta',
      roleTitle: 'Game Dev Applicant',
      phone: '+91 90000 00002',
      experience: '3 yrs Unity, shipped 1 mobile title',
    },
  });

  const existingB = await prisma.assignment.findFirst({ where: { candidateId: candidateB.id } });
  if (!existingB) {
    const startedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const submittedAt = new Date(Date.now() - 20 * 60 * 60 * 1000);
    const assignmentB = await prisma.assignment.create({
      data: {
        candidateId: candidateB.id,
        track: Track.TWO_DAY,
        taskVersion: 's2-v1',
        startDate: startedAt,
        startTime: '09:00',
        deadline: submittedAt,
        status: AssignmentStatus.SUBMITTED,
        actualStartedAt: startedAt,
        actualSubmittedAt: submittedAt,
        submission: {
          create: {
            submittedAt,
            answers: {
              's2-d1r-topic': 'Inventory systems using ScriptableObjects',
              's2-d1r-learner': 'A junior developer who understands C# basics but has not used ScriptableObjects.',
              's2-d1r-why': 'Decoupled, designer-friendly data architecture is core to how mid-size Unity teams scale content.',
              's2-d2b-title': 'Building a Data-Driven Inventory in Unity',
              's2-d2b-learner': 'Junior Unity developers',
              's2-d2b-objective': 'Learner can define new item types without touching code.',
            },
          },
        },
      },
      include: { submission: true },
    });

    await prisma.mediaReview.create({
      data: {
        submissionId: assignmentB.submission!.id,
        topicClarity: 8,
        unityClarity: 7,
        nonTechClarity: 6,
        confidence: 8,
        overall: 7,
        reviewerNotes: 'Explained ScriptableObjects clearly; needed a follow-up question on serialization.',
        questionsAsked: 'Why not just use a JSON file instead of ScriptableObjects?',
        explanationSummary: 'Candidate connected the technical choice back to designer workflow benefits, which landed well with a non-technical audience.',
      },
    });
  }

  console.log('Seed complete.');
  console.log(`Admin login:      ${adminEmail} / ${adminPassword}`);
  console.log(`Candidate A (1-Day, in progress): candidate.oneday@gengineer.dev / ${candidatePassword}`);
  console.log(`Candidate B (2-Day, submitted):   candidate.twoday@gengineer.dev / ${candidatePassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
