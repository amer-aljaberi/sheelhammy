import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get single referrer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ referrerId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referrerId } = await params;

    const referrer = await prisma.referrer.findUnique({
      where: { id: referrerId },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalPrice: true,
            referrerCommission: true,
            status: true,
            createdAt: true,
            student: {
              select: {
                name: true,
              },
            },
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    const totalEarnings = referrer.orders.reduce(
      (sum, order) => sum + (order.referrerCommission || 0),
      0
    );
    const totalPaid = referrer.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return NextResponse.json({
      ...referrer,
      stats: {
        totalOrders: referrer.orders.length,
        totalEarnings,
        totalPaid,
        remaining: totalEarnings - totalPaid,
      },
    });
  } catch (error: any) {
    console.error("Error fetching referrer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch referrer" },
      { status: 500 }
    );
  }
}

// PATCH - Update referrer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ referrerId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referrerId } = await params;
    const body = await request.json();
    const {
      name,
      phone,
      phoneCountryCode,
      code,
      commissionRate,
      isActive,
      country,
      university,
      academicYear,
      grade,
      importantNotes,
      notes,
      sourceType,
      sourceId,
    } = body;

    // If code is being changed, check if it's unique
    if (code) {
      const existingReferrer = await prisma.referrer.findFirst({
        where: {
          code: code.toUpperCase(),
          NOT: { id: referrerId },
        },
      });

      if (existingReferrer) {
        return NextResponse.json(
          { error: "Referrer code already exists" },
          { status: 400 }
        );
      }
    }

    // If sourceType is provided, fetch data from source
    let updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (phoneCountryCode !== undefined) updateData.phoneCountryCode = phoneCountryCode;
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (country !== undefined) updateData.country = country;
    if (university !== undefined) updateData.university = university;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (grade !== undefined) updateData.grade = grade;
    if (importantNotes !== undefined) updateData.importantNotes = importantNotes;
    if (notes !== undefined) updateData.notes = notes;
    if (sourceType !== undefined) updateData.sourceType = sourceType;
    if (sourceId !== undefined) updateData.sourceId = sourceId;

    // If sourceType is provided, fetch data from source
    if (sourceType === "employee" && sourceId) {
      const employee = await prisma.user.findUnique({
        where: { id: sourceId },
        select: { name: true, phone: true, phoneCountryCode: true },
      });
      if (employee) {
        updateData.name = employee.name;
        if (!updateData.phone) updateData.phone = employee.phone;
        if (!updateData.phoneCountryCode) updateData.phoneCountryCode = employee.phoneCountryCode;
      }
    } else if (sourceType === "student" && sourceId) {
      const student = await prisma.student.findUnique({
        where: { id: sourceId },
        select: { name: true, whatsapp: true, phoneCountryCode: true },
      });
      if (student) {
        updateData.name = student.name;
        if (!updateData.phone) updateData.phone = student.whatsapp;
        if (!updateData.phoneCountryCode) updateData.phoneCountryCode = student.phoneCountryCode;
      }
    }

    const referrer = await prisma.referrer.update({
      where: { id: referrerId },
      data: updateData,
    });

    return NextResponse.json(referrer);
  } catch (error: any) {
    console.error("Error updating referrer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update referrer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete referrer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ referrerId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referrerId } = await params;

    // Check if referrer exists and has related records
    const referrer = await prisma.referrer.findUnique({
      where: { id: referrerId },
      include: {
        _count: {
          select: {
            orders: true,
            payments: true,
            referrals: true,
          },
        },
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    // Check for related records that prevent deletion
    const hasOrders = referrer._count.orders > 0;
    const hasPayments = referrer._count.payments > 0;

    // Allow deletion even if there are referrals - referrals will remain with null referrerId
    if (hasOrders || hasPayments) {
      const reasons = [];
      if (hasOrders) reasons.push(`${referrer._count.orders} طلب`);
      if (hasPayments) reasons.push(`${referrer._count.payments} دفعة`);

      return NextResponse.json(
        {
          error: "Cannot delete referrer with existing related records",
          details: `يحتوي على: ${reasons.join("، ")}`,
        },
        { status: 400 }
      );
    }

    // Delete the referrer
    // Referrals will remain but their referrerId will be set to null automatically
    // due to onDelete: SetNull in the schema
    await prisma.referrer.delete({
      where: { id: referrerId },
    });

    return NextResponse.json({ message: "Referrer deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting referrer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete referrer" },
      { status: 500 }
    );
  }
}
