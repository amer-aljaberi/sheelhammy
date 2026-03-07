import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// GET - Get employee dashboard stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only employees can access their stats
    if (session.user.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

    // Count in-progress orders (IN_PROGRESS, REVISION)
    const inProgressOrders = await prisma.order.count({
      where: {
        employeeId: userId,
        status: {
          in: [OrderStatus.IN_PROGRESS, OrderStatus.REVISION],
        },
      },
    });

    // Calculate total earnings from completed orders
    const totalEarningsResult = await prisma.order.aggregate({
      where: {
        employeeId: userId,
        status: OrderStatus.COMPLETED,
      },
      _sum: {
        employeeProfit: true,
      },
      _count: {
        id: true,
      },
    });

    const totalEarnings = totalEarningsResult._sum.employeeProfit || 0;
    const completedOrders = totalEarningsResult._count.id || 0;

    // Calculate transferred earnings
    const transferredResult = await prisma.transfer.aggregate({
      where: {
        employeeId: userId,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    const transferredEarnings = transferredResult._sum.amount || 0;

    // Pending earnings = total earnings - transferred earnings
    const pendingEarnings = totalEarnings - transferredEarnings;

    // Get referrer stats if employee is a referrer
    const referrer = await prisma.referrer.findFirst({
      where: {
        sourceType: "employee",
        sourceId: userId,
        isActive: true,
      },
      include: {
        orders: {
          select: {
            id: true,
            referrerCommission: true,
            status: true,
            createdAt: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
          },
        },
      },
    });

    let referrerStats = null;
    if (referrer) {
      const totalReferrerOrders = referrer.orders.length;
      const totalReferrerEarnings = referrer.orders.reduce(
        (sum, order) => sum + (order.referrerCommission || 0),
        0
      );
      const totalReferrerPaid = referrer.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const remainingReferrerEarnings = totalReferrerEarnings - totalReferrerPaid;
      const activeReferrerOrders = referrer.orders.filter(
        (order) => order.status !== "COMPLETED" && order.status !== "CANCELLED"
      ).length;

      referrerStats = {
        referrerId: referrer.id,
        referrerCode: referrer.code,
        totalReferrers: 1, // الموظف نفسه مندوب
        totalReferrerOrders,
        totalReferrerEarnings,
        totalReferrerPaid,
        remainingReferrerEarnings,
        activeReferrerOrders,
        commissionRate: referrer.commissionRate,
      };
    }

    return NextResponse.json({
      inProgressOrders,
      pendingEarnings,
      totalEarnings,
      completedOrders,
      referrerStats,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
