import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// GET - Get all orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const serviceId = searchParams.get("serviceId");
    const studentId = searchParams.get("studentId");
    const employeeId = searchParams.get("employeeId");

    const where: any = {};
    if (status) where.status = status as OrderStatus;
    if (serviceId) where.serviceId = serviceId;
    if (studentId) where.studentId = studentId;
    if (employeeId) where.employeeId = employeeId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        referrer: {
          select: {
            id: true,
            name: true,
            code: true,
            commissionRate: true,
          },
        },
        paymentRecords: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format orders for the frontend
    const formattedOrders = orders.map((order) => {
      const paidAmount = order.paymentRecords.reduce(
        (sum, record) => sum + record.amount,
        0
      );
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        studentName: order.student.name,
        studentId: order.studentId, // إضافة studentId
        service: order.service.title,
        employeeName: order.employee?.name || "غير معين",
        employeeId: order.employeeId,
        referrerName: order.referrer?.name || null,
        referrerCode: order.referrer?.code || null,
        referrerCommission: order.referrerCommission || null,
        status: order.status,
        totalPrice: order.totalPrice,
        employeeProfit: order.employeeProfit,
        isPaid: order.isPaid,
        paymentType: order.paymentType,
        paymentInstallments: order.paymentInstallments,
        discount: order.discount,
        paidAmount,
        deadline: order.deadline?.toISOString().split("T")[0] || null,
        createdAt: order.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      studentId,
      serviceId,
      customServiceName,
      employeeId,
      referrerId,
      totalPrice,
      employeeProfit,
      deadline,
      clientFiles,
      paymentType,
      paymentInstallments,
      discount,
      priority,
      grade,
      gradeType,
      subjectName,
      orderType,
      description,
    } = body;

    if (!studentId || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle custom service
    let finalServiceId = serviceId;
    if (serviceId === "custom" || !serviceId) {
      if (!customServiceName) {
        return NextResponse.json(
          { error: "Custom service name is required" },
          { status: 400 }
        );
      }
      
      // Find or create a category for custom services (or use first category)
      const category = await prisma.category.findFirst();
      if (!category) {
        return NextResponse.json(
          { error: "No category found. Please create a category first." },
          { status: 400 }
        );
      }

      // Create a temporary service for custom orders
      const customService = await prisma.service.create({
        data: {
          title: customServiceName,
          description: description || customServiceName,
          shortDescription: customServiceName,
          categoryId: category.id,
          isActive: true,
        },
      });
      
      finalServiceId = customService.id;
    }

    if (!finalServiceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `#${String(orderCount + 1).padStart(4, "0")}`;

    // Calculate referrer commission if referrerId is provided
    let referrerCommission = null;
    if (referrerId) {
      const referrer = await prisma.referrer.findUnique({
        where: { id: referrerId },
        select: { commissionRate: true },
      });
      if (referrer?.commissionRate) {
        const finalPrice = parseFloat(totalPrice) - (discount ? parseFloat(discount) : 0);
        referrerCommission = (finalPrice * referrer.commissionRate) / 100;
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        studentId,
        serviceId: finalServiceId,
        employeeId: employeeId || null,
        referrerId: referrerId || null,
        referrerCommission,
        totalPrice: parseFloat(totalPrice),
        employeeProfit: employeeProfit ? parseFloat(employeeProfit) : 0,
        deadline: deadline ? new Date(deadline) : null,
        clientFiles: clientFiles ? JSON.stringify(clientFiles) : null,
        paymentType: paymentType || "cash",
        paymentInstallments: paymentInstallments ? paymentInstallments : null,
        discount: discount ? parseFloat(discount) : 0,
        priority: priority || "normal",
        grade: grade || null,
        gradeType: gradeType || null,
        subjectName: subjectName || null,
        orderType: orderType || null,
        description: description || null,
        status: OrderStatus.PENDING,
      },
      include: {
        student: true,
        service: true,
        employee: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
