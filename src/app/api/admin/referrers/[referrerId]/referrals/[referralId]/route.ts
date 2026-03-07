import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// PATCH - Update referral status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ referrerId: string; referralId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralId } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (!status || !["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status,
        notes: notes || undefined,
      },
    });

    return NextResponse.json(referral);
  } catch (error: any) {
    console.error("Error updating referral:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update referral" },
      { status: 500 }
    );
  }
}

// DELETE - Delete referral
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ referrerId: string; referralId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralId } = await params;

    await prisma.referral.delete({
      where: { id: referralId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting referral:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete referral" },
      { status: 500 }
    );
  }
}
