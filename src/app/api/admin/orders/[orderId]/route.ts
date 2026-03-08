import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// GET - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        student: true,
        service: true,
        employee: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH - Update order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();

    const {
      employeeId,
      referrerId,
      referrerCommission,
      payReferrer,
      status,
      deadline,
      totalPrice,
      employeeProfit,
      isPaid,
      revisionNotes,
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
 
    let finalReferrerCommission = null;
    if (referrerId !== undefined) {
      if (referrerId) {
        // Use manual commission amount if provided
        if (referrerCommission !== undefined && referrerCommission !== null) {
          finalReferrerCommission = parseFloat(referrerCommission);
        } else {
          // Calculate from referrer's default rate
          const currentOrder = await prisma.order.findUnique({
            where: { id: orderId },
            select: { totalPrice: true, discount: true },
          });
          const finalPrice = (currentOrder?.totalPrice || (totalPrice ? parseFloat(totalPrice) : 0)) - 
                            ((discount !== undefined ? parseFloat(discount) : currentOrder?.discount || 0));
          
          const referrer = await prisma.referrer.findUnique({
            where: { id: referrerId },
            select: { commissionRate: true },
          });
          if (referrer?.commissionRate) {
            finalReferrerCommission = (finalPrice * referrer.commissionRate) / 100;
          }
        }
      }
    }

    const updateData: any = {};
    if (employeeId !== undefined) updateData.employeeId = employeeId || null;
    if (referrerId !== undefined) {
      updateData.referrerId = referrerId || null;
      updateData.referrerCommission = finalReferrerCommission;
    }
    if (status !== undefined) updateData.status = status as OrderStatus;
    if (deadline !== undefined)
      updateData.deadline = deadline ? new Date(deadline) : null;
    if (totalPrice !== undefined) updateData.totalPrice = parseFloat(totalPrice);
    if (employeeProfit !== undefined)
      updateData.employeeProfit = parseFloat(employeeProfit);
    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (revisionNotes !== undefined) updateData.revisionNotes = revisionNotes;
    if (clientFiles !== undefined)
      updateData.clientFiles = clientFiles ? JSON.stringify(clientFiles) : null;
    if (paymentType !== undefined) updateData.paymentType = paymentType || null;
    if (paymentInstallments !== undefined) updateData.paymentInstallments = paymentInstallments || null;
    if (discount !== undefined) updateData.discount = parseFloat(discount) || 0;
    if (priority !== undefined) updateData.priority = priority || "normal";
    if (grade !== undefined) updateData.grade = grade || null;
    if (gradeType !== undefined) updateData.gradeType = gradeType || null;
    if (subjectName !== undefined) updateData.subjectName = subjectName || null;
    if (orderType !== undefined) updateData.orderType = orderType || null;
    if (description !== undefined) updateData.description = description || null;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        student: true,
        service: true,
        employee: true,
        referrer: true,
      },
    });

    // Create referrer payment if payReferrer is true
    if (payReferrer && order.referrerId && finalReferrerCommission && finalReferrerCommission > 0) {
      try {
        const referrer = await prisma.referrer.findUnique({
          where: { id: order.referrerId },
          select: { name: true, code: true },
        });

        // Create payment record
        const payment = await prisma.referrerPayment.create({
          data: {
            referrerId: order.referrerId,
            amount: finalReferrerCommission,
            paymentType: "cash",
            paymentDate: new Date(),
            notes: `دفع تلقائي عند تحديث الطلب ${order.orderNumber}`,
          },
        });

        // Create expense in finance system
        const expenseTitle = `دفع عمولة للمندوب: ${referrer?.name || "غير معروف"} (${referrer?.code || ""})`;
        const expenseDescription = `دفع عمولة للمندوب ${referrer?.name || "غير معروف"} - دفع تلقائي عند تحديث الطلب ${order.orderNumber}`;

        await prisma.expense.create({
          data: {
            title: expenseTitle,
            amount: finalReferrerCommission,
            category: "عمولات المندوبين",
            date: new Date(),
            description: expenseDescription,
            properties: {
              type: "referrer_payment",
              referrerId: order.referrerId,
              referrerPaymentId: payment.id,
              paymentType: "cash",
              orderId: order.id,
            },
          },
        });
      } catch (paymentError) {
        console.error("Error creating referrer payment:", paymentError);
        // Don't fail the order update if payment creation fails
      }
    }
 
    if (status === OrderStatus.REVISION && order.employeeId) {
      await prisma.notification.create({
        data: {
          userId: order.employeeId,
          orderId: order.id,
          message: `تم طلب تعديل على الطلب ${order.orderNumber}. راجع الملاحظات.`,
        },
      });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delete the order
    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}