// @/app/api/persons/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  prisma,
  requireAuth,
  requireWrite,
  getPersonWithPayments,
  handlePrismaUniqueConstraintError,
} from "@/lib";

// GET: Retrieve a person by ID (any authenticated user)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAuth(request);
    if (error) return error;

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const person = await prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    // If the person is a student, add payment info
    if (person.type === "student") {
      const personWithPayments = await getPersonWithPayments(person.rfid_uuid);
      return NextResponse.json(personWithPayments);
    }

    return NextResponse.json({
      ...person,
      created_at: person.created_at.toISOString(),
      updated_at: person.updated_at.toISOString(),
    });
  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Update a person
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { rfid_uuid, type, last_name, first_name, photo } = body;

    // Check that the person exists
    const existing = await prisma.person.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (rfid_uuid !== undefined) updateData.rfid_uuid = rfid_uuid;
    if (type !== undefined) updateData.type = type;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (first_name !== undefined) updateData.first_name = first_name;
    if (photo !== undefined)
      updateData.photo = photo && String(photo).trim() !== "" ? photo : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const updatedPerson = await prisma.person.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPerson);
  } catch (error: any) {
    console.error("Error:", error);
    const uniqueConstraintResponse = handlePrismaUniqueConstraintError(error);
    if (uniqueConstraintResponse) {
      return uniqueConstraintResponse;
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete a person (Admin or Staff only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireWrite(request);
    if (error) return error;

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.person.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Person successfully deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
