// @/app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PersonWithPayments } from "@/types";
import { prisma, requireViewerAuth, getPersonWithPayments } from "@/lib";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireViewerAuth(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // student, teacher, staff, visitor

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search must contain at least 2 characters" },
        { status: 400 },
      );
    }

    // Check if query is a number (for ID search)
    const isNumeric = !isNaN(Number(query));
    const queryId = isNumeric ? Number(query) : null;

    // Case-insensitive search for names and UUID
    const where: any = {
      OR: [
        { last_name: { contains: query, mode: "insensitive" } },
        { first_name: { contains: query, mode: "insensitive" } },
        { rfid_uuid: { contains: query, mode: "insensitive" } },
      ],
    };

    if (queryId !== null) {
      where.OR.push({ id: queryId });
    }

    if (type && ["student", "teacher", "staff", "visitor"].includes(type)) {
      where.type = type;
    }

    const results = await prisma.person.findMany({
      where,
      orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
      take: 50,
    });

    // For students, add payment info
    const personsWithPayments = await Promise.all(
      results.map(async (person) => {
        if (person.type === "student") {
          const personWithPayments = await getPersonWithPayments(
            person.rfid_uuid,
          );
          return personWithPayments || person;
        }
        return person;
      }),
    );

    const filtered = personsWithPayments.filter(
      (p): p is PersonWithPayments => p !== null,
    ) as PersonWithPayments[];

    // console.log(`🔍 Search: "${query}" - ${filtered.length} results`);
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("❌ Error during search:", error);
    return NextResponse.json({ error: "Error during search" }, { status: 500 });
  }
}
