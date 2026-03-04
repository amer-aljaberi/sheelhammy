import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get single transfer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transferId } = await params;

    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
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
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: transfer.id,
      employeeId: transfer.employeeId,
      orderId: transfer.orderId,
      amount: transfer.amount,
      status: transfer.status,
      receiptImage: transfer.receiptImage,
      description: transfer.description,
      createdAt: transfer.createdAt.toISOString(),
      updatedAt: transfer.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching transfer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transfer" },
      { status: 500 }
    );
  }
}

// PATCH - Update transfer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transferId } = await params;
    const body = await request.json();

    const { employeeId, orderId, amount, status, receiptImage, description } = body;

    const updateData: any = {};
    if (employeeId !== undefined) updateData.employeeId = employeeId;
    if (orderId !== undefined) updateData.orderId = orderId || null;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (status !== undefined) updateData.status = status;
    if (receiptImage !== undefined) updateData.receiptImage = receiptImage || null;
    if (description !== undefined) updateData.description = description || null;

    const transfer = await prisma.transfer.update({
      where: { id: transferId },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
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
    });

    return NextResponse.json(transfer);
  } catch (error: any) {
    console.error("Error updating transfer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update transfer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete transfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transferId } = await params;

    await prisma.transfer.delete({
      where: { id: transferId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting transfer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete transfer" },
      { status: 500 }
    );
  }
}
