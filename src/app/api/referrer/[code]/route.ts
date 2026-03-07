import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Verify referrer code (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const referrer = await prisma.referrer.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        commissionRate: true,
        phone: true,
        phoneCountryCode: true,
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referrer code" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: referrer.id,
      name: referrer.name,
      referrerCode: referrer.code,
      commissionRate: referrer.commissionRate,
      phone: referrer.phone,
      phoneCountryCode: referrer.phoneCountryCode,
    });
  } catch (error: any) {
    console.error("Error verifying referrer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify referrer" },
      { status: 500 }
    );
  }
}
