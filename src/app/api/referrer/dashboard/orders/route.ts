import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get referrer orders
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      referrerId: referrer.id,
    };

    if (status) {
      where.status = status;
    }

    // Get orders
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
            },
          },
          employee: {
            select: {
              id: true,
              name: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Format orders
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      studentName: order.student.name,
      studentId: order.student.id,
      service: order.service.title,
      employeeName: order.employee?.name || "-",
      status: order.status,
      totalPrice: order.totalPrice,
      referrerCommission: order.referrerCommission || 0,
      deadline: order.deadline?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching referrer orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch referrer orders" },
      { status: 500 }
    );
  }
}
