// app/api/payments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PUT: Update a payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { amount, payment_method, trimester } = body;

    // Check that the student payment exists
    const existingStudentPayment = await prisma.studentPayment.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!existingStudentPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Validate payment method if provided
    if (
      payment_method !== undefined &&
      !["cash", "card", "bank_transfer"].includes(payment_method)
    ) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Validate trimester if provided
    if (trimester !== undefined && ![1, 2, 3].includes(trimester)) {
      return NextResponse.json(
        { error: "Invalid trimester. Allowed values: 1, 2, 3" },
        { status: 400 }
      );
    }

    // If trimester is being changed, check for conflicts
    if (trimester !== undefined && trimester !== existingStudentPayment.trimester) {
      const conflictingPayment = await prisma.studentPayment.findFirst({
        where: {
          student_id: existingStudentPayment.student_id,
          trimester: trimester,
          id: { not: id },
        },
      });

      if (conflictingPayment) {
        return NextResponse.json(
          {
            error: `Payment for trimester ${trimester} already exists for this student`,
          },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (payment_method !== undefined)
      updateData.payment_method = payment_method;

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment if amount or method changed
      if (Object.keys(updateData).length > 0) {
        await tx.payment.update({
          where: { id: existingStudentPayment.payment_id },
          data: updateData,
        });
      }

      // Update student payment if trimester changed
      let updatedStudentPayment = existingStudentPayment;
      if (trimester !== undefined) {
        updatedStudentPayment = await tx.studentPayment.update({
          where: { id },
          data: { trimester },
        });
      }

      // Fetch updated payment
      const updatedPayment = await tx.payment.findUnique({
        where: { id: existingStudentPayment.payment_id },
      });

      return {
        id: updatedStudentPayment.id,
        student_id: updatedStudentPayment.student_id,
        trimester: updatedStudentPayment.trimester,
        payment_id: updatedPayment!.id,
        amount: updatedPayment!.amount,
        payment_method: updatedPayment!.payment_method,
        payment_date: updatedPayment!.payment_date.toISOString(),
      };
    });

    // console.log(`✅ Payment updated (ID: ${id})`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ Error while updating payment:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Conflict: Payment already exists for this trimester" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Error while updating payment" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check that the student payment exists
    const existingStudentPayment = await prisma.studentPayment.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!existingStudentPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete student payment (this will cascade or we need to delete payment too)
      await tx.studentPayment.delete({
        where: { id },
      });

      // Delete the associated payment
      await tx.payment.delete({
        where: { id: existingStudentPayment.payment_id },
      });
    });

    // console.log(`🗑️ Payment deleted (ID: ${id})`);
    return NextResponse.json({ message: "Payment successfully deleted" });
  } catch (error) {
    console.error("❌ Error while deleting payment:", error);
    return NextResponse.json(
      { error: "Error while deleting payment" },
      { status: 500 }
    );
  }
}

