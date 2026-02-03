// @/app/api/persons/route.ts

// TODO:
// - [ ] Add pagination
// - [ ] Add more filters
// - [ ] Validate rfid_uuid pattern
// - [ ] Validate first and last name
// - [ ] fix photo field

import { NextRequest, NextResponse } from "next/server";
import { PersonWithPayments, PersonType } from "@/types";
import {
  prisma,
  requireViewerAuth,
  requireStaffAuth,
  getPersonWithPayments,
  handlePrismaUniqueConstraintError,
} from "@/lib";

// GET: Retrieve all persons (any authenticated user)
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireViewerAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // Filter by type if provided

    const where: any = {};
    if (type && ["student", "teacher", "staff", "visitor"].includes(type)) {
      where.type = type;
    }

    const persons = await prisma.person.findMany({
      where,
      orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
    });

    // For students, add payment info
    // const personsWithPayments = await Promise.all(
    //   persons.map(async (person) => {
    //     if (person.type === "student") {
    //       return await getPersonWithPayments(person.rfid_uuid);
    //     }
    //     // For non-students, convert dates and add payment fields
    //     return {
    //       ...person,
    //       created_at: person.created_at.toISOString(),
    //       updated_at: person.updated_at.toISOString(),
    //       trimester1_paid: true,
    //       trimester2_paid: true,
    //       trimester3_paid: true,
    //     } as PersonWithPayments;
    //   }),
    // );

    // return NextResponse.json(personsWithPayments);
    return NextResponse.json(persons);
  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      { error: "Error while retrieving persons" },
      { status: 500 },
    );
  }
}

// POST: Create a new person (Admin or Staff only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireStaffAuth(request);
    if (error) return error;

    const body = await request.json();
    const {
      rfid_uuid,
      type,
      last_name,
      first_name,
      photo, // FIXME: get photo instead of photo_path
    } = body;

    // Validate required fields
    if (!rfid_uuid || !type || !last_name || !first_name) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (rfid_uuid, type, last_name, first_name)",
        },
        { status: 400 },
      );
    }

    // Validate type value
    if (!["student", "teacher", "staff", "visitor"].includes(type)) {
      return NextResponse.json(
        {
          error:
            "Invalid type. Allowed values: student, teacher, staff, visitor",
        },
        { status: 400 },
      );
    }

    // Insert the new person with rfid_uuid
    const newPerson = await prisma.person.create({
      data: {
        rfid_uuid,
        type: type as PersonType,
        last_name,
        first_name,
        photo: photo || null,
      },
    });

    return NextResponse.json(
      {
        ...newPerson,
        created_at: newPerson.created_at.toISOString(),
        updated_at: newPerson.updated_at.toISOString(),
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error:", error);

    const uniqueConstraintResponse = handlePrismaUniqueConstraintError(error);
    if (uniqueConstraintResponse) {
      return uniqueConstraintResponse;
    }

    return NextResponse.json(
      { error: "Error while creating the person" },
      { status: 500 },
    );
  }
}
