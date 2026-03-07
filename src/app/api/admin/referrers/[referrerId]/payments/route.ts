import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get all payments for a referrer
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

    const payments = await prisma.referrerPayment.findMany({
      where: { referrerId },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error("Error fetching referrer payments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST - Create payment for referrer
export async function POST(
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
    const { amount, paymentType, paymentDate, notes } = body;

    if (!amount || !paymentType) {
      return NextResponse.json(
        { error: "Amount and payment type are required" },
        { status: 400 }
      );
    }

    // Get referrer info for expense title
    const referrer = await prisma.referrer.findUnique({
      where: { id: referrerId },
      select: { name: true, code: true },
    });

    // Create payment record
    const payment = await prisma.referrerPayment.create({
      data: {
        referrerId,
        amount: Number(amount),
        paymentType,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        notes: notes || null,
      },
    });

    // Create expense in finance system
    const expenseDate = paymentDate ? new Date(paymentDate) : new Date();
    const expenseTitle = `دفع عمولة للمندوب: ${referrer?.name || "غير معروف"} (${referrer?.code || ""})`;
    const expenseDescription = notes 
      ? `دفع عمولة للمندوب ${referrer?.name || "غير معروف"} - ${notes}`
      : `دفع عمولة للمندوب ${referrer?.name || "غير معروف"}`;

    await prisma.expense.create({
      data: {
        title: expenseTitle,
        amount: Number(amount),
        category: "عمولات المندوبين",
        date: expenseDate,
        description: expenseDescription,
        properties: {
          type: "referrer_payment",
          referrerId: referrerId,
          referrerPaymentId: payment.id,
          paymentType: paymentType,
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating referrer payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
