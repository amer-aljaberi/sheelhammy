import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get all referrals for a referrer
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { referrerId };
    if (status) {
      where.status = status;
    }

    const referrals = await prisma.referral.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalPrice: true,
            referrerCommission: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(referrals);
  } catch (error: any) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
