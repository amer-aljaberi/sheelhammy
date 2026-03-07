import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// GET - Get referrer dashboard stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Find referrer by sourceType and sourceId
    let referrer = null;
    
    if (userRole === "EMPLOYEE") {
      referrer = await prisma.referrer.findFirst({
        where: {
          sourceType: "employee",
          sourceId: userId,
          isActive: true,
        },
      });
    } else if (userRole === "ADMIN") {
      // Admin can access any referrer by query param
      const { searchParams } = new URL(request.url);
      const referrerId = searchParams.get("referrerId");
      
      if (referrerId) {
        referrer = await prisma.referrer.findUnique({
          where: { id: referrerId },
        });
      }
    }

    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer not found or inactive" },
        { status: 404 }
      );
    }

    // Get all orders for this referrer
    const orders = await prisma.order.findMany({
      where: {
        referrerId: referrer.id,
      },
      select: {
        id: true,
        orderNumber: true,
        totalPrice: true,
        referrerCommission: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get all payments for this referrer
    const payments = await prisma.referrerPayment.findMany({
      where: {
        referrerId: referrer.id,
      },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        paymentType: true,
      },
    });

    // Get all referrals for this referrer
    const referrals = await prisma.referral.findMany({
      where: {
        referrerId: referrer.id,
      },
      select: {
        id: true,
        status: true,
        orderId: true,
      },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === OrderStatus.COMPLETED
    ).length;
    const activeOrders = orders.filter(
      (o) =>
        o.status !== OrderStatus.COMPLETED &&
        o.status !== OrderStatus.CANCELLED
    ).length;

    // Calculate earnings
    const totalEarnings = orders.reduce(
      (sum, order) => sum + (order.referrerCommission || 0),
      0
    );

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingEarnings = totalEarnings - totalPaid;

    // Calculate unique students
    const uniqueStudents = new Set(orders.map((o) => o.student.id)).size;

    // Calculate referrals stats
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(
      (r) => r.status === "COMPLETED" && r.orderId !== null
    ).length;
    const pendingReferrals = referrals.filter(
      (r) => r.status === "PENDING"
    ).length;
    const cancelledReferrals = referrals.filter(
      (r) => r.status === "CANCELLED"
    ).length;

    return NextResponse.json({
      referrer: {
        id: referrer.id,
        name: referrer.name,
        code: referrer.code,
        commissionRate: referrer.commissionRate,
        isActive: referrer.isActive,
      },
      stats: {
        totalOrders,
        completedOrders,
        activeOrders,
        uniqueStudents,
        totalEarnings,
        totalPaid,
        remainingEarnings,
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        cancelledReferrals,
      },
    });
  } catch (error: any) {
    console.error("Error fetching referrer dashboard stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch referrer dashboard stats" },
      { status: 500 }
    );
  }
}
