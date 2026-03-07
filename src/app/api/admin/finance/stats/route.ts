import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get finance statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total revenue (from paid orders)
    const totalRevenue = await prisma.order.aggregate({
      where: {
        isPaid: true,
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Total expenses
    const totalExpenses = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    // Total transfers to employees
    const totalTransfers = await prisma.transfer.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    // Total employee profits (from completed orders)
    const totalEmployeeProfits = await prisma.order.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        employeeProfit: true,
      },
    });

    // Total referrer commissions (from all orders)
    const totalReferrerCommissions = await prisma.order.aggregate({
      _sum: {
        referrerCommission: true,
      },
    });

    // Total paid referrer commissions (from ReferrerPayment)
    const totalPaidReferrerCommissions = await prisma.referrerPayment.aggregate({
      _sum: {
        amount: true,
      },
    });

    // Calculate net profit
    const netProfit =
      (totalRevenue._sum.totalPrice || 0) -
      (totalEmployeeProfits._sum.employeeProfit || 0) -
      (totalReferrerCommissions._sum.referrerCommission || 0) -
      (totalExpenses._sum.amount || 0);

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalTransfers: totalTransfers._sum.amount || 0,
      totalEmployeeProfits: totalEmployeeProfits._sum.employeeProfit || 0,
      totalReferrerCommissions: totalReferrerCommissions._sum.referrerCommission || 0,
      totalPaidReferrerCommissions: totalPaidReferrerCommissions._sum.amount || 0,
      netProfit,
    });
  } catch (error: any) {
    console.error("Error fetching finance stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch finance stats" },
      { status: 500 }
    );
  }
}
