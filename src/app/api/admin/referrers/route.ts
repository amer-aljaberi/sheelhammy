import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET - Get all referrers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if prisma.referrer exists (Prisma Client needs to be regenerated)
    if (!prisma || !(prisma as any).referrer) {
      console.error("Prisma Client error: referrer model not found. Please run 'npx prisma generate'");
      return NextResponse.json(
        { 
          error: "Database model not found. Please run 'npx prisma generate' and restart the server.",
          details: "The Referrer model was added but Prisma Client needs to be regenerated."
        },
        { status: 500 }
      );
    }

    const referrers = await prisma.referrer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: {
            id: true,
            totalPrice: true,
            referrerCommission: true,
            status: true,
            createdAt: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentType: true,
            paymentDate: true,
          },
        },
        referrals: {
          select: {
            id: true,
            status: true,
            orderId: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate stats for each referrer
    const formattedReferrers = await Promise.all(
      referrers.map(async (referrer) => {
        // Get all orders directly linked to this referrer (where referrerId = referrer.id)
        // This includes all orders whether created directly or from referrals
        const allOrders = await prisma.order.findMany({
          where: {
            referrerId: referrer.id,
          },
          select: {
            id: true,
            referrerCommission: true,
          },
        });
        
        // Get order IDs from directly linked orders
        const directOrderIds = new Set(allOrders.map((o) => o.id));
        
        // Get all completed referrals
        const completedReferrals = referrer.referrals.filter(
          (r) => r.status === "COMPLETED"
        );
        
        // Get completed referrals that have an orderId (linked to an order)
        const completedReferralsWithOrders = completedReferrals.filter(
          (r) => r.orderId !== null && r.orderId !== undefined && String(r.orderId).trim() !== ""
        );
        
        // Count unique orders from completed referrals that aren't already in direct orders
        // This ensures we count all orders related to this referrer, whether directly linked or through referrals
        const uniqueReferralOrderIds = new Set(
          completedReferralsWithOrders
            .map((r) => String(r.orderId).trim())
            .filter((id) => id !== "" && !directOrderIds.has(id))
        );
        
        // Total orders = direct orders + unique completed referral orders
        const totalOrders = allOrders.length + uniqueReferralOrderIds.size;
        
        // Total earnings = sum of referrerCommission from all orders linked to this referrer
        // We only count from direct orders (where referrerId = referrer.id) to avoid double counting
        // Convert to number to ensure proper calculation
        const totalEarnings = allOrders.reduce(
          (sum, order) => {
            const commission = order.referrerCommission;
            return sum + (commission ? Number(commission) : 0);
          },
          0
        );
        
        const totalPaid = referrer.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        const remaining = totalEarnings - totalPaid;
        const pendingReferrals = referrer.referrals.filter(r => r.status === "PENDING").length;

        return {
          id: referrer.id,
          name: referrer.name,
          phone: referrer.phone,
          phoneCountryCode: referrer.phoneCountryCode,
          code: referrer.code,
          commissionRate: referrer.commissionRate,
          isActive: referrer.isActive,
          country: referrer.country,
          university: referrer.university,
          academicYear: referrer.academicYear,
          grade: referrer.grade,
          importantNotes: referrer.importantNotes,
          notes: referrer.notes,
          sourceType: referrer.sourceType,
          sourceId: referrer.sourceId,
          createdAt: referrer.createdAt,
          updatedAt: referrer.updatedAt,
          stats: {
            totalOrders,
            totalEarnings,
            totalPaid,
            remaining,
            pendingReferrals,
          },
        };
      })
    );

    return NextResponse.json(formattedReferrers);
  } catch (error: any) {
    console.error("Error fetching referrers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch referrers" },
      { status: 500 }
    );
  }
}

// POST - Create new referrer
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      phoneCountryCode,
      code,
      commissionRate,
      isActive,
      country,
      university,
      academicYear,
      grade,
      importantNotes,
      notes,
      sourceType,
      sourceId,
    } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Check if prisma.referrer exists
    if (!prisma || !(prisma as any).referrer) {
      console.error("Prisma Client error: referrer model not found. Please run 'npx prisma generate'");
      return NextResponse.json(
        { 
          error: "Database model not found. Please run 'npx prisma generate' and restart the server.",
          details: "The Referrer model was added but Prisma Client needs to be regenerated."
        },
        { status: 500 }
      );
    }

    // Check if code already exists
    const existingReferrer = await prisma.referrer.findUnique({
      where: { code },
    });

    if (existingReferrer) {
      return NextResponse.json(
        { error: "Referrer code already exists" },
        { status: 400 }
      );
    }

    // If sourceType is provided, fetch data from source
    let finalName = name;
    let finalPhone = phone;
    let finalPhoneCountryCode = phoneCountryCode;

    if (sourceType === "employee" && sourceId) {
      const employee = await prisma.user.findUnique({
        where: { id: sourceId },
        select: { name: true, phone: true, phoneCountryCode: true },
      });
      if (employee) {
        finalName = employee.name;
        finalPhone = employee.phone || phone;
        finalPhoneCountryCode = employee.phoneCountryCode || phoneCountryCode;
      }
    } else if (sourceType === "student" && sourceId) {
      const student = await prisma.student.findUnique({
        where: { id: sourceId },
        select: { name: true, whatsapp: true, phoneCountryCode: true },
      });
      if (student) {
        finalName = student.name;
        finalPhone = student.whatsapp || phone;
        finalPhoneCountryCode = student.phoneCountryCode || phoneCountryCode;
      }
    }

    const referrer = await prisma.referrer.create({
      data: {
        name: finalName,
        phone: finalPhone || null,
        phoneCountryCode: finalPhoneCountryCode || "+962",
        code: code.toUpperCase(),
        commissionRate: commissionRate || null,
        isActive: isActive !== undefined ? isActive : true,
        country: country || null,
        university: university || null,
        academicYear: academicYear || null,
        grade: grade || null,
        importantNotes: importantNotes || null,
        notes: notes || null,
        sourceType: sourceType || null,
        sourceId: sourceId || null,
      },
    });

    return NextResponse.json(referrer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating referrer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create referrer" },
      { status: 500 }
    );
  }
}
