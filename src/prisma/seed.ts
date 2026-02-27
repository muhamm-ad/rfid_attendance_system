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

// Persons: 25 students, 6 teachers, 5 staff, 10 visitors (46 total)
const PERSONS_SEED: PersonSeed[] = [
  // Students
  { rfid_uuid: "STU-0001", type: "student", nom: "Diallo", prenom: "Amadou", photo: "/photos/amadou_diallo.jpg" },
  { rfid_uuid: "STU-0002", type: "student", nom: "Sow", prenom: "Fatou", photo: "/photos/fatou_sow.jpg" },
  { rfid_uuid: "STU-0003", type: "student", nom: "Ba", prenom: "Ibrahima", photo: "/photos/ibrahima_ba.jpg" },
  { rfid_uuid: "STU-0004", type: "student", nom: "Camara", prenom: "Aissatou", photo: "/photos/aissatou_camara.jpg" },
  { rfid_uuid: "STU-0005", type: "student", nom: "Diop", prenom: "Moussa", photo: "/photos/moussa_diop.jpg" },
  { rfid_uuid: "STU-0006", type: "student", nom: "Fall", prenom: "Awa", photo: "/photos/awa_fall.jpg" },
  { rfid_uuid: "STU-0007", type: "student", nom: "Gueye", prenom: "Omar", photo: "/photos/omar_gueye.jpg" },
  { rfid_uuid: "STU-0008", type: "student", nom: "Kane", prenom: "Ramatoulaye", photo: "/photos/ramatoulaye_kane.jpg" },
  { rfid_uuid: "STU-0009", type: "student", nom: "Mbaye", prenom: "Cheikh", photo: "/photos/cheikh_mbaye.jpg" },
  { rfid_uuid: "STU-0010", type: "student", nom: "Sy", prenom: "Fatima", photo: "/photos/fatima_sy.jpg" },
  { rfid_uuid: "STU-0011", type: "student", nom: "Baldé", prenom: "Ousmane", photo: "/photos/ousmane_balde.jpg" },
  { rfid_uuid: "STU-0012", type: "student", nom: "Cissé", prenom: "Djeneba", photo: "/photos/djeneba_cisse.jpg" },
  { rfid_uuid: "STU-0013", type: "student", nom: "Diaw", prenom: "Modou", photo: "/photos/modou_diaw.jpg" },
  { rfid_uuid: "STU-0014", type: "student", nom: "Fofana", prenom: "Kadiatou", photo: "/photos/kadiatou_fofana.jpg" },
  { rfid_uuid: "STU-0015", type: "student", nom: "Konaté", prenom: "Seydou", photo: "/photos/seydou_konate.jpg" },
  { rfid_uuid: "STU-0016", type: "student", nom: "Ly", prenom: "Binta", photo: "/photos/binta_ly.jpg" },
  { rfid_uuid: "STU-0017", type: "student", nom: "Mane", prenom: "Ibou", photo: "/photos/ibou_mane.jpg" },
  { rfid_uuid: "STU-0018", type: "student", nom: "Niang", prenom: "Penda", photo: "/photos/penda_niang.jpg" },
  { rfid_uuid: "STU-0019", type: "student", nom: "Samb", prenom: "Idrissa", photo: "/photos/idrissa_samb.jpg" },
  { rfid_uuid: "STU-0020", type: "student", nom: "Traoré", prenom: "Assitan", photo: "/photos/assitan_traore.jpg" },
  { rfid_uuid: "STU-0021", type: "student", nom: "Wane", prenom: "Bakary", photo: "/photos/bakary_wane.jpg" },
  { rfid_uuid: "STU-0022", type: "student", nom: "Deme", prenom: "Sokhna", photo: "/photos/sokhna_deme.jpg" },
  { rfid_uuid: "STU-0023", type: "student", nom: "Coly", prenom: "El Hadj", photo: "/photos/elhadj_coly.jpg" },
  { rfid_uuid: "STU-0024", type: "student", nom: "Gassama", prenom: "Marieme", photo: "/photos/marieme_gassama.jpg" },
  { rfid_uuid: "STU-0025", type: "student", nom: "Tambedou", prenom: "Lamine", photo: "/photos/lamine_tambedou.jpg" },
  // Teachers
  { rfid_uuid: "TCH-0001", type: "teacher", nom: "Ndiaye", prenom: "Mariama", photo: "/photos/mariama_ndiaye.jpg" },
  { rfid_uuid: "TCH-0002", type: "teacher", nom: "Sall", prenom: "Abdoulaye", photo: "/photos/abdoulaye_sall.jpg" },
  { rfid_uuid: "TCH-0003", type: "teacher", nom: "Thiam", prenom: "Aminata", photo: "/photos/aminata_thiam.jpg" },
  { rfid_uuid: "TCH-0004", type: "teacher", nom: "Touré", prenom: "Mamadou", photo: "/photos/mamadou_toure.jpg" },
  { rfid_uuid: "TCH-0005", type: "teacher", nom: "Sène", prenom: "Bintou", photo: "/photos/bintou_sene.jpg" },
  { rfid_uuid: "TCH-0006", type: "teacher", nom: "Camara", prenom: "Moussa", photo: "/photos/moussa_camara.jpg" },
  // Staff
  { rfid_uuid: "STF-0001", type: "staff", nom: "Faye", prenom: "Astou", photo: "/photos/astou_faye.jpg" },
  { rfid_uuid: "STF-0002", type: "staff", nom: "Diagne", prenom: "Mame", photo: "/photos/mame_diagne.jpg" },
  { rfid_uuid: "STF-0003", type: "staff", nom: "Sène", prenom: "Pape", photo: "/photos/pape_sene.jpg" },
  { rfid_uuid: "STF-0004", type: "staff", nom: "Ndiaye", prenom: "Awa", photo: "/photos/awa_ndiaye.jpg" },
  { rfid_uuid: "STF-0005", type: "staff", nom: "Sow", prenom: "Moussa", photo: "/photos/moussa_sow.jpg" },
  // Visitors
  { rfid_uuid: "VIS-0001", type: "visitor", nom: "Dupont", prenom: "Jean", photo: "/photos/jean_dupont.jpg" },
  { rfid_uuid: "VIS-0002", type: "visitor", nom: "Martin", prenom: "Sophie", photo: "/photos/sophie_martin.jpg" },
  { rfid_uuid: "VIS-0003", type: "visitor", nom: "Bernard", prenom: "Pierre", photo: "/photos/pierre_bernard.jpg" },
  { rfid_uuid: "VIS-0004", type: "visitor", nom: "Petit", prenom: "Marie", photo: "/photos/marie_petit.jpg" },
  { rfid_uuid: "VIS-0005", type: "visitor", nom: "Durand", prenom: "Thomas", photo: "/photos/thomas_durand.jpg" },
  { rfid_uuid: "VIS-0006", type: "visitor", nom: "Leroy", prenom: "Isabelle", photo: "/photos/isabelle_leroy.jpg" },
  { rfid_uuid: "VIS-0007", type: "visitor", nom: "Moreau", prenom: "François", photo: "/photos/francois_moreau.jpg" },
  { rfid_uuid: "VIS-0008", type: "visitor", nom: "Simon", prenom: "Claire", photo: "/photos/claire_simon.jpg" },
  { rfid_uuid: "VIS-0009", type: "visitor", nom: "Laurent", prenom: "Philippe", photo: "/photos/philippe_laurent.jpg" },
  { rfid_uuid: "VIS-0010", type: "visitor", nom: "Lefebvre", prenom: "Sandrine", photo: "/photos/sandrine_lefebvre.jpg" },
];

// Attendance: données sur plusieurs jours/semaines (nov-déc 2024), avec combinaisons in/out, success/failed
const ATTENDANCE_SEED: AttendanceSeed[] = [
  // Student 1
  { rfid_uuid: "STU-0001", action: "in", status: "success", attendance_date: "2024-11-15T08:00:00Z" },
  { rfid_uuid: "STU-0001", action: "out", status: "success", attendance_date: "2024-11-15T16:00:00Z" },
  { rfid_uuid: "STU-0001", action: "in", status: "failed", attendance_date: "2024-11-16T08:05:00Z" },
  { rfid_uuid: "STU-0001", action: "in", status: "success", attendance_date: "2024-11-16T08:10:00Z" },
  { rfid_uuid: "STU-0001", action: "out", status: "success", attendance_date: "2024-11-16T15:55:00Z" },
  { rfid_uuid: "STU-0001", action: "in", status: "success", attendance_date: "2024-11-18T08:15:00Z" },
  { rfid_uuid: "STU-0001", action: "out", status: "success", attendance_date: "2024-11-18T16:10:00Z" },
  { rfid_uuid: "STU-0001", action: "in", status: "success", attendance_date: "2024-11-20T07:55:00Z" },
  { rfid_uuid: "STU-0001", action: "out", status: "success", attendance_date: "2024-11-20T16:05:00Z" },
  // Student 2
  { rfid_uuid: "STU-0002", action: "in", status: "success", attendance_date: "2024-11-15T08:10:00Z" },
  { rfid_uuid: "STU-0002", action: "out", status: "success", attendance_date: "2024-11-15T15:50:00Z" },
  { rfid_uuid: "STU-0002", action: "in", status: "success", attendance_date: "2024-11-16T08:20:00Z" },
  { rfid_uuid: "STU-0002", action: "out", status: "success", attendance_date: "2024-11-16T16:00:00Z" },
  { rfid_uuid: "STU-0002", action: "in", status: "success", attendance_date: "2024-11-19T08:05:00Z" },
  { rfid_uuid: "STU-0002", action: "out", status: "failed", attendance_date: "2024-11-19T15:45:00Z" },
  { rfid_uuid: "STU-0002", action: "out", status: "success", attendance_date: "2024-11-19T15:48:00Z" },
  // Students 3–10 (plusieurs jours chacun)
  { rfid_uuid: "STU-0003", action: "in", status: "success", attendance_date: "2024-11-15T08:25:00Z" },
  { rfid_uuid: "STU-0003", action: "out", status: "success", attendance_date: "2024-11-15T16:20:00Z" },
  { rfid_uuid: "STU-0003", action: "in", status: "success", attendance_date: "2024-11-18T08:30:00Z" },
  { rfid_uuid: "STU-0003", action: "out", status: "success", attendance_date: "2024-11-18T16:15:00Z" },
  { rfid_uuid: "STU-0004", action: "in", status: "success", attendance_date: "2024-11-15T08:35:00Z" },
  { rfid_uuid: "STU-0004", action: "out", status: "success", attendance_date: "2024-11-15T15:55:00Z" },
  { rfid_uuid: "STU-0004", action: "in", status: "success", attendance_date: "2024-11-20T08:00:00Z" },
  { rfid_uuid: "STU-0005", action: "in", status: "success", attendance_date: "2024-11-16T07:50:00Z" },
  { rfid_uuid: "STU-0005", action: "out", status: "success", attendance_date: "2024-11-16T16:30:00Z" },
  { rfid_uuid: "STU-0005", action: "in", status: "success", attendance_date: "2024-11-19T08:10:00Z" },
  { rfid_uuid: "STU-0005", action: "out", status: "success", attendance_date: "2024-11-19T16:00:00Z" },
  { rfid_uuid: "STU-0006", action: "in", status: "success", attendance_date: "2024-11-18T08:40:00Z" },
  { rfid_uuid: "STU-0006", action: "out", status: "success", attendance_date: "2024-11-18T16:25:00Z" },
  { rfid_uuid: "STU-0006", action: "in", status: "success", attendance_date: "2024-11-21T08:15:00Z" },
  { rfid_uuid: "STU-0007", action: "in", status: "success", attendance_date: "2024-11-15T08:45:00Z" },
  { rfid_uuid: "STU-0007", action: "out", status: "success", attendance_date: "2024-11-15T16:10:00Z" },
  { rfid_uuid: "STU-0007", action: "in", status: "success", attendance_date: "2024-11-22T08:20:00Z" },
  { rfid_uuid: "STU-0008", action: "in", status: "success", attendance_date: "2024-11-16T08:00:00Z" },
  { rfid_uuid: "STU-0008", action: "out", status: "success", attendance_date: "2024-11-16T15:45:00Z" },
  { rfid_uuid: "STU-0009", action: "in", status: "success", attendance_date: "2024-11-19T08:25:00Z" },
  { rfid_uuid: "STU-0009", action: "out", status: "success", attendance_date: "2024-11-19T16:20:00Z" },
  { rfid_uuid: "STU-0010", action: "in", status: "success", attendance_date: "2024-11-20T08:30:00Z" },
  { rfid_uuid: "STU-0010", action: "out", status: "success", attendance_date: "2024-11-20T16:15:00Z" },
  // Students 11–25 (présences sur nov 2024)
  { rfid_uuid: "STU-0011", action: "in", status: "success", attendance_date: "2024-11-15T08:50:00Z" },
  { rfid_uuid: "STU-0011", action: "out", status: "success", attendance_date: "2024-11-15T16:05:00Z" },
  { rfid_uuid: "STU-0012", action: "in", status: "success", attendance_date: "2024-11-16T08:15:00Z" },
  { rfid_uuid: "STU-0012", action: "out", status: "success", attendance_date: "2024-11-16T16:25:00Z" },
  { rfid_uuid: "STU-0013", action: "in", status: "success", attendance_date: "2024-11-18T08:35:00Z" },
  { rfid_uuid: "STU-0013", action: "out", status: "success", attendance_date: "2024-11-18T16:20:00Z" },
  { rfid_uuid: "STU-0014", action: "in", status: "success", attendance_date: "2024-11-19T08:00:00Z" },
  { rfid_uuid: "STU-0014", action: "out", status: "success", attendance_date: "2024-11-19T15:55:00Z" },
  { rfid_uuid: "STU-0015", action: "in", status: "success", attendance_date: "2024-11-20T08:10:00Z" },
  { rfid_uuid: "STU-0015", action: "out", status: "success", attendance_date: "2024-11-20T16:30:00Z" },
  { rfid_uuid: "STU-0016", action: "in", status: "success", attendance_date: "2024-11-15T08:55:00Z" },
  { rfid_uuid: "STU-0016", action: "out", status: "success", attendance_date: "2024-11-15T16:15:00Z" },
  { rfid_uuid: "STU-0017", action: "in", status: "success", attendance_date: "2024-11-16T08:40:00Z" },
  { rfid_uuid: "STU-0017", action: "out", status: "success", attendance_date: "2024-11-16T16:10:00Z" },
  { rfid_uuid: "STU-0018", action: "in", status: "success", attendance_date: "2024-11-18T08:25:00Z" },
  { rfid_uuid: "STU-0018", action: "out", status: "success", attendance_date: "2024-11-18T16:40:00Z" },
  { rfid_uuid: "STU-0019", action: "in", status: "success", attendance_date: "2024-11-19T08:30:00Z" },
  { rfid_uuid: "STU-0019", action: "out", status: "success", attendance_date: "2024-11-19T16:25:00Z" },
  { rfid_uuid: "STU-0020", action: "in", status: "success", attendance_date: "2024-11-20T08:20:00Z" },
  { rfid_uuid: "STU-0020", action: "out", status: "success", attendance_date: "2024-11-20T16:05:00Z" },
  { rfid_uuid: "STU-0021", action: "in", status: "success", attendance_date: "2024-11-21T08:05:00Z" },
  { rfid_uuid: "STU-0021", action: "out", status: "success", attendance_date: "2024-11-21T16:20:00Z" },
  { rfid_uuid: "STU-0022", action: "in", status: "success", attendance_date: "2024-11-22T08:15:00Z" },
  { rfid_uuid: "STU-0022", action: "out", status: "success", attendance_date: "2024-11-22T16:35:00Z" },
  { rfid_uuid: "STU-0023", action: "in", status: "success", attendance_date: "2024-11-18T08:45:00Z" },
  { rfid_uuid: "STU-0023", action: "out", status: "success", attendance_date: "2024-11-18T16:15:00Z" },
  { rfid_uuid: "STU-0024", action: "in", status: "success", attendance_date: "2024-11-19T08:50:00Z" },
  { rfid_uuid: "STU-0024", action: "out", status: "success", attendance_date: "2024-11-19T16:30:00Z" },
  { rfid_uuid: "STU-0025", action: "in", status: "success", attendance_date: "2024-11-20T08:00:00Z" },
  { rfid_uuid: "STU-0025", action: "out", status: "success", attendance_date: "2024-11-20T16:10:00Z" },
  // Teachers
  { rfid_uuid: "TCH-0001", action: "in", status: "success", attendance_date: "2024-11-15T07:30:00Z" },
  { rfid_uuid: "TCH-0001", action: "out", status: "success", attendance_date: "2024-11-15T17:00:00Z" },
  { rfid_uuid: "TCH-0001", action: "in", status: "success", attendance_date: "2024-11-18T07:25:00Z" },
  { rfid_uuid: "TCH-0001", action: "out", status: "success", attendance_date: "2024-11-18T17:10:00Z" },
  { rfid_uuid: "TCH-0001", action: "in", status: "success", attendance_date: "2024-11-20T07:35:00Z" },
  { rfid_uuid: "TCH-0001", action: "out", status: "success", attendance_date: "2024-11-20T17:05:00Z" },
  { rfid_uuid: "TCH-0002", action: "in", status: "success", attendance_date: "2024-11-15T07:40:00Z" },
  { rfid_uuid: "TCH-0002", action: "out", status: "success", attendance_date: "2024-11-15T16:45:00Z" },
  { rfid_uuid: "TCH-0002", action: "in", status: "success", attendance_date: "2024-11-19T07:50:00Z" },
  { rfid_uuid: "TCH-0002", action: "out", status: "success", attendance_date: "2024-11-19T17:15:00Z" },
  { rfid_uuid: "TCH-0003", action: "in", status: "success", attendance_date: "2024-11-16T07:20:00Z" },
  { rfid_uuid: "TCH-0003", action: "out", status: "success", attendance_date: "2024-11-16T17:20:00Z" },
  { rfid_uuid: "TCH-0004", action: "in", status: "success", attendance_date: "2024-11-18T07:45:00Z" },
  { rfid_uuid: "TCH-0004", action: "out", status: "success", attendance_date: "2024-11-18T16:50:00Z" },
  { rfid_uuid: "TCH-0005", action: "in", status: "success", attendance_date: "2024-11-15T07:35:00Z" },
  { rfid_uuid: "TCH-0005", action: "out", status: "success", attendance_date: "2024-11-15T17:15:00Z" },
  { rfid_uuid: "TCH-0006", action: "in", status: "success", attendance_date: "2024-11-19T07:40:00Z" },
  { rfid_uuid: "TCH-0006", action: "out", status: "success", attendance_date: "2024-11-19T17:00:00Z" },
  // Staff
  { rfid_uuid: "STF-0001", action: "in", status: "success", attendance_date: "2024-11-15T07:20:00Z" },
  { rfid_uuid: "STF-0001", action: "out", status: "success", attendance_date: "2024-11-15T18:00:00Z" },
  { rfid_uuid: "STF-0001", action: "in", status: "success", attendance_date: "2024-11-16T07:15:00Z" },
  { rfid_uuid: "STF-0001", action: "out", status: "success", attendance_date: "2024-11-16T18:10:00Z" },
  { rfid_uuid: "STF-0002", action: "in", status: "success", attendance_date: "2024-11-15T07:25:00Z" },
  { rfid_uuid: "STF-0002", action: "out", status: "success", attendance_date: "2024-11-15T17:45:00Z" },
  { rfid_uuid: "STF-0003", action: "in", status: "success", attendance_date: "2024-11-18T07:30:00Z" },
  { rfid_uuid: "STF-0003", action: "out", status: "success", attendance_date: "2024-11-18T17:55:00Z" },
  { rfid_uuid: "STF-0004", action: "in", status: "success", attendance_date: "2024-11-15T07:28:00Z" },
  { rfid_uuid: "STF-0004", action: "out", status: "success", attendance_date: "2024-11-15T17:50:00Z" },
  { rfid_uuid: "STF-0005", action: "in", status: "success", attendance_date: "2024-11-19T07:22:00Z" },
  { rfid_uuid: "STF-0005", action: "out", status: "success", attendance_date: "2024-11-19T18:05:00Z" },
  // Visitors
  { rfid_uuid: "VIS-0001", action: "in", status: "success", attendance_date: "2024-11-15T09:00:00Z" },
  { rfid_uuid: "VIS-0001", action: "out", status: "success", attendance_date: "2024-11-15T12:00:00Z" },
  { rfid_uuid: "VIS-0002", action: "in", status: "success", attendance_date: "2024-11-16T10:30:00Z" },
  { rfid_uuid: "VIS-0002", action: "out", status: "success", attendance_date: "2024-11-16T11:45:00Z" },
  { rfid_uuid: "VIS-0003", action: "in", status: "success", attendance_date: "2024-11-18T14:00:00Z" },
  { rfid_uuid: "VIS-0003", action: "out", status: "success", attendance_date: "2024-11-18T15:30:00Z" },
  { rfid_uuid: "VIS-0004", action: "in", status: "success", attendance_date: "2024-11-19T09:15:00Z" },
  { rfid_uuid: "VIS-0004", action: "out", status: "success", attendance_date: "2024-11-19T10:45:00Z" },
  { rfid_uuid: "VIS-0005", action: "in", status: "success", attendance_date: "2024-11-20T08:45:00Z" },
  { rfid_uuid: "VIS-0005", action: "out", status: "success", attendance_date: "2024-11-20T11:00:00Z" },
  { rfid_uuid: "VIS-0006", action: "in", status: "success", attendance_date: "2024-11-16T13:00:00Z" },
  { rfid_uuid: "VIS-0006", action: "out", status: "success", attendance_date: "2024-11-16T14:30:00Z" },
  { rfid_uuid: "VIS-0007", action: "in", status: "success", attendance_date: "2024-11-18T10:00:00Z" },
  { rfid_uuid: "VIS-0007", action: "out", status: "success", attendance_date: "2024-11-18T11:15:00Z" },
  { rfid_uuid: "VIS-0008", action: "in", status: "success", attendance_date: "2024-11-19T09:30:00Z" },
  { rfid_uuid: "VIS-0008", action: "out", status: "success", attendance_date: "2024-11-19T12:00:00Z" },
  { rfid_uuid: "VIS-0009", action: "in", status: "success", attendance_date: "2024-11-20T15:00:00Z" },
  { rfid_uuid: "VIS-0009", action: "out", status: "success", attendance_date: "2024-11-20T16:45:00Z" },
  { rfid_uuid: "VIS-0010", action: "in", status: "success", attendance_date: "2024-11-21T11:00:00Z" },
  { rfid_uuid: "VIS-0010", action: "out", status: "success", attendance_date: "2024-11-21T12:30:00Z" },
];

// Payments: tous les trimestres, méthodes de paiement variées, situations différentes (payé partiel/complet)
const PAYMENT_SEED: PaymentSeed[] = [
  // Student 1: tous les trimestres payés (méthodes variées)
  { rfid_uuid: "STU-0001", trimester: 1, amount: 50000, payment_method: "cash" },
  { rfid_uuid: "STU-0001", trimester: 2, amount: 50000, payment_method: "card" },
  { rfid_uuid: "STU-0001", trimester: 3, amount: 50000, payment_method: "bank_transfer" },
  // Student 2: seulement T1 (T2/T3 impayés)
  { rfid_uuid: "STU-0002", trimester: 1, amount: 48000, payment_method: "bank_transfer" },
  // Student 3: T1 et T2 payés
  { rfid_uuid: "STU-0003", trimester: 1, amount: 50000, payment_method: "card" },
  { rfid_uuid: "STU-0003", trimester: 2, amount: 50000, payment_method: "cash" },
  // Student 4: tous payés
  { rfid_uuid: "STU-0004", trimester: 1, amount: 45000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0004", trimester: 2, amount: 45000, payment_method: "card" },
  { rfid_uuid: "STU-0004", trimester: 3, amount: 45000, payment_method: "cash" },
  // Student 5: seulement T1
  { rfid_uuid: "STU-0005", trimester: 1, amount: 52000, payment_method: "cash" },
  // Student 6: T1 et T3 (T2 manquant)
  { rfid_uuid: "STU-0006", trimester: 1, amount: 48000, payment_method: "card" },
  { rfid_uuid: "STU-0006", trimester: 3, amount: 48000, payment_method: "bank_transfer" },
  // Student 7: tous payés en cash
  { rfid_uuid: "STU-0007", trimester: 1, amount: 50000, payment_method: "cash" },
  { rfid_uuid: "STU-0007", trimester: 2, amount: 50000, payment_method: "cash" },
  { rfid_uuid: "STU-0007", trimester: 3, amount: 50000, payment_method: "cash" },
  // Student 8: aucun paiement (test impayés)
  // Student 9: T2 et T3 payés (T1 manquant)
  { rfid_uuid: "STU-0009", trimester: 2, amount: 49000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0009", trimester: 3, amount: 49000, payment_method: "card" },
  // Student 10: T1 payé
  { rfid_uuid: "STU-0010", trimester: 1, amount: 51000, payment_method: "bank_transfer" },
  // Students 11–25 (situations variées)
  { rfid_uuid: "STU-0011", trimester: 1, amount: 49000, payment_method: "card" },
  { rfid_uuid: "STU-0011", trimester: 2, amount: 49000, payment_method: "cash" },
  { rfid_uuid: "STU-0012", trimester: 1, amount: 50000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0012", trimester: 2, amount: 50000, payment_method: "card" },
  { rfid_uuid: "STU-0012", trimester: 3, amount: 50000, payment_method: "cash" },
  { rfid_uuid: "STU-0013", trimester: 1, amount: 48000, payment_method: "cash" },
  { rfid_uuid: "STU-0014", trimester: 2, amount: 52000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0014", trimester: 3, amount: 52000, payment_method: "card" },
  { rfid_uuid: "STU-0015", trimester: 1, amount: 47000, payment_method: "card" },
  { rfid_uuid: "STU-0016", trimester: 1, amount: 51000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0016", trimester: 3, amount: 51000, payment_method: "cash" },
  { rfid_uuid: "STU-0017", trimester: 2, amount: 49500, payment_method: "cash" },
  { rfid_uuid: "STU-0018", trimester: 1, amount: 50000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0018", trimester: 2, amount: 50000, payment_method: "card" },
  { rfid_uuid: "STU-0019", trimester: 3, amount: 48500, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0020", trimester: 1, amount: 53000, payment_method: "card" },
  { rfid_uuid: "STU-0020", trimester: 2, amount: 53000, payment_method: "cash" },
  { rfid_uuid: "STU-0020", trimester: 3, amount: 53000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0021", trimester: 1, amount: 46000, payment_method: "cash" },
  { rfid_uuid: "STU-0022", trimester: 2, amount: 50500, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0023", trimester: 1, amount: 47500, payment_method: "card" },
  { rfid_uuid: "STU-0023", trimester: 2, amount: 47500, payment_method: "cash" },
  { rfid_uuid: "STU-0024", trimester: 1, amount: 50000, payment_method: "bank_transfer" },
  { rfid_uuid: "STU-0025", trimester: 3, amount: 49000, payment_method: "card" },
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
