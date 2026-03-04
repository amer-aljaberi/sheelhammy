import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get all transfers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transfers = await prisma.transfer.findMany({
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }).catch((error) => {
      console.error("Error fetching transfers from database:", error);
      throw error;
    });

    // Calculate stats for each employee
    const employeeStatsMap = new Map<string, {
      totalProfit: number;
      totalTransferred: number;
      remainingProfit: number;
    }>();

    // Get all completed orders for employees
    const allOrders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        employeeId: { not: null },
      },
      select: {
        employeeId: true,
        employeeProfit: true,
      },
    });

    // Calculate total profit per employee
    allOrders.forEach((order) => {
      if (!order.employeeId) return;
      const existing = employeeStatsMap.get(order.employeeId) || {
        totalProfit: 0,
        totalTransferred: 0,
        remainingProfit: 0,
      };
      existing.totalProfit += order.employeeProfit || 0;
      employeeStatsMap.set(order.employeeId, existing);
    });

    // Calculate total transferred per employee (from all transfers, not just current batch)
    const allTransfers = await prisma.transfer.findMany({
      where: {
        status: "COMPLETED",
      },
      select: {
        employeeId: true,
        amount: true,
      },
    });

    allTransfers.forEach((transfer) => {
      const existing = employeeStatsMap.get(transfer.employeeId) || {
        totalProfit: 0,
        totalTransferred: 0,
        remainingProfit: 0,
      };
      existing.totalTransferred += transfer.amount;
      employeeStatsMap.set(transfer.employeeId, existing);
    });

    // Calculate remaining profit
    employeeStatsMap.forEach((stats, employeeId) => {
      stats.remainingProfit = stats.totalProfit - stats.totalTransferred;
    });

    // Format transfers for frontend
    const formattedTransfers = transfers.map((transfer) => {
      const stats = employeeStatsMap.get(transfer.employeeId) || {
        totalProfit: 0,
        totalTransferred: 0,
        remainingProfit: 0,
      };

      return {
        id: transfer.id,
        employeeId: transfer.employeeId,
        employeeName: transfer.employee?.name || "غير معروف",
        orderId: transfer.orderId || null,
        orderNumber: transfer.order?.orderNumber || null,
        service: transfer.order?.service?.title || null,
        amount: transfer.amount,
        status: transfer.status,
        receiptImage: transfer.receiptImage || null,
        description: transfer.description || null,
        totalProfit: stats.totalProfit,
        totalTransferred: stats.totalTransferred,
        remainingProfit: stats.remainingProfit,
        createdAt: transfer.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json(formattedTransfers);
  } catch (error: any) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

// POST - Create new transfer
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, orderId, amount, receiptImage, description, status } = body;

    if (!employeeId || !amount) {
      return NextResponse.json(
        { error: "Employee ID and amount are required" },
        { status: 400 }
      );
    }

    const transfer = await prisma.transfer.create({
      data: {
        employeeId,
        orderId: orderId || null,
        amount: parseFloat(amount),
        receiptImage: receiptImage || null,
        description: description || null,
        status: status || "COMPLETED",
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transfer" },
      { status: 500 }
    );
  }
}
