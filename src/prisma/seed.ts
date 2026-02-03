// @/prisma/seed.ts

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";

export async function seedUsers() {
  // Create default users
  const defaultPassword = await hashPassword("Admin123!@#");
  const staffPassword = await hashPassword("Staff123!@#");
  const viewerPassword = await hashPassword("Viewer123!@#");

  await prisma.user.createMany({
    data: [
      {
        email: "admin@rfid.local",
        password: defaultPassword,
        first_name: "System",
        last_name: "Administrator",
        role: "ADMIN",
      },
      {
        email: "staff@rfid.local",
        password: staffPassword,
        first_name: "Staff",
        last_name: "Member",
        role: "STAFF",
      },
      {
        email: "viewer@rfid.local",
        password: viewerPassword,
        first_name: "Viewer",
        last_name: "User",
        role: "VIEWER",
      },
    ],
  });

  console.log("✅ Default users created:");
  console.log("   ADMIN: admin@rfid.local / Admin123!@#");
  console.log("   STAFF: staff@rfid.local / Staff123!@#");
  console.log("   VIEWER: viewer@rfid.local / Viewer123!@#");
  console.log("   ⚠️  Please change these passwords after first login!");
}

type PersonType = "student" | "teacher" | "staff" | "visitor";

type PersonSeed = {
  rfid_uuid: string;
  type: PersonType;
  nom: string;
  prenom: string;
  photo: string;
};

type AttendanceSeed = {
  rfid_uuid: string;
  action: "in" | "out";
  status: "success" | "failed";
  attendance_date: string;
};

type PaymentSeed = {
  rfid_uuid: string;
  trimester: 1 | 2 | 3;
  amount: number;
  payment_method: "cash" | "card" | "bank_transfer";
};

// Minimal persons: 2 students, 1 teacher, 1 staff, 1 visitor (covers all PersonType)
const PERSONS_SEED: PersonSeed[] = [
  { rfid_uuid: "STU-0001", type: "student", nom: "Diallo", prenom: "Amadou", photo: "/photos/amadou_diallo.jpg" },
  { rfid_uuid: "STU-0002", type: "student", nom: "Sow", prenom: "Fatou", photo: "/photos/fatou_sow.jpg" },
  { rfid_uuid: "TCH-0001", type: "teacher", nom: "Ndiaye", prenom: "Mariama", photo: "/photos/mariama_ndiaye.jpg" },
  { rfid_uuid: "STF-0001", type: "staff", nom: "Faye", prenom: "Astou", photo: "/photos/astou_faye.jpg" },
  { rfid_uuid: "VIS-0001", type: "visitor", nom: "Dupont", prenom: "Jean", photo: "/photos/jean_dupont.jpg" },
];

// Minimal attendance: all combinations of action (in/out) and status (success/failed), for each person type
const ATTENDANCE_SEED: AttendanceSeed[] = [
  // Student 1: in success, out success, in failed (retry success)
  { rfid_uuid: "STU-0001", action: "in", status: "success", attendance_date: "2024-11-15T08:00:00Z" },
  { rfid_uuid: "STU-0001", action: "out", status: "success", attendance_date: "2024-11-15T16:00:00Z" },
  { rfid_uuid: "STU-0001", action: "in", status: "failed", attendance_date: "2024-11-16T08:05:00Z" },
  { rfid_uuid: "STU-0001", action: "in", status: "success", attendance_date: "2024-11-16T08:10:00Z" },
  // Student 2: in/out success
  { rfid_uuid: "STU-0002", action: "in", status: "success", attendance_date: "2024-11-15T08:10:00Z" },
  { rfid_uuid: "STU-0002", action: "out", status: "success", attendance_date: "2024-11-15T15:50:00Z" },
  // Teacher: in/out success
  { rfid_uuid: "TCH-0001", action: "in", status: "success", attendance_date: "2024-11-15T07:30:00Z" },
  { rfid_uuid: "TCH-0001", action: "out", status: "success", attendance_date: "2024-11-15T17:00:00Z" },
  // Staff: in/out success
  { rfid_uuid: "STF-0001", action: "in", status: "success", attendance_date: "2024-11-15T07:20:00Z" },
  { rfid_uuid: "STF-0001", action: "out", status: "success", attendance_date: "2024-11-15T18:00:00Z" },
  // Visitor: in/out success
  { rfid_uuid: "VIS-0001", action: "in", status: "success", attendance_date: "2024-11-15T09:00:00Z" },
  { rfid_uuid: "VIS-0001", action: "out", status: "success", attendance_date: "2024-11-15T12:00:00Z" },
];

// Minimal payments: all trimesters (1,2,3) and all payment methods (cash, card, bank_transfer)
// Student 1: all 3 trimesters paid (one method each)
// Student 2: only trimester 1 (so unpaid T2/T3 exists)
const PAYMENT_SEED: PaymentSeed[] = [
  { rfid_uuid: "STU-0001", trimester: 1, amount: 50000, payment_method: "cash" },
  { rfid_uuid: "STU-0001", trimester: 2, amount: 50000, payment_method: "card" },
  { rfid_uuid: "STU-0001", trimester: 3, amount: 50000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0002", trimester: 1, amount: 48000, payment_method: "bank_transfer" },
];

export async function seedDatabase() {
  console.log("🌱 Seeding test data...");

  const personsCount = await prisma.person.count();
  if (personsCount > 0) {
    console.log("ℹ️ Database already contains data, no action needed.");
    return;
  }

  const personIndex = new Map<string, { id: number; type: PersonSeed["type"] }>();

  for (const person of PERSONS_SEED) {
    const created = await prisma.person.create({
      data: {
        rfid_uuid: person.rfid_uuid,
        type: person.type,
        last_name: person.nom,
        first_name: person.prenom,
        photo: person.photo,
      },
    });
    personIndex.set(person.rfid_uuid, { id: created.id, type: person.type });
  }

  for (const entry of ATTENDANCE_SEED) {
    const personMeta = personIndex.get(entry.rfid_uuid);
    if (!personMeta) continue;
    await prisma.attendance.create({
      data: {
        person_id: personMeta.id,
        action: entry.action,
        status: entry.status,
        attendance_date: new Date(entry.attendance_date),
      },
    });
  }

  for (const payment of PAYMENT_SEED) {
    const personMeta = personIndex.get(payment.rfid_uuid);
    if (!personMeta || personMeta.type !== "student") continue;
    const createdPayment = await prisma.payment.create({
      data: {
        amount: payment.amount,
        payment_method: payment.payment_method,
      },
    });
    await prisma.studentPayment.create({
      data: {
        student_id: personMeta.id,
        payment_id: createdPayment.id,
        trimester: payment.trimester,
      },
    });
  }

  console.log("✅ Test data seeded successfully!");
}

async function main() {
  await seedUsers();
  await seedDatabase();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
