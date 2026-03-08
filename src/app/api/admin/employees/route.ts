import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role, OrderStatus } from "@prisma/client";

// GET - Get all employees
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: any = {
      role: Role.EMPLOYEE,
    };
    // By default, only show active employees unless explicitly requested
    if (!includeInactive) {
      where.isActive = true;
    } else if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const employees = await prisma.user.findMany({
      where,
      include: {
        assignedJobs: {
          where: {
            status: {
              in: [
                OrderStatus.ASSIGNED,
                OrderStatus.IN_PROGRESS,
                OrderStatus.DELIVERED,
                OrderStatus.REVISION,
              ],
            },
          },
        },
        _count: {
          select: {
            assignedJobs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats for each employee
    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        const completedOrders = await prisma.order.count({
          where: {
            employeeId: employee.id,
            status: OrderStatus.COMPLETED,
          },
        });

        const totalProfit = await prisma.order.aggregate({
          where: {
            employeeId: employee.id,
            status: OrderStatus.COMPLETED,
          },
          _sum: {
            employeeProfit: true,
          },
        });

        return {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          phoneCountryCode: employee.phoneCountryCode,
          role: employee.role,
          isActive: employee.isActive,
          defaultProfitRate: employee.defaultProfitRate,
          country: employee.country,
          specialization: employee.specialization,
          services: employee.services,
          academicLevels: employee.academicLevels,
          complaintsCount: employee.complaintsCount || 0,
          currentLoad: employee.assignedJobs.length,
          totalOrders: completedOrders,
          totalProfit: totalProfit._sum.employeeProfit || 0,
          createdAt: employee.createdAt,
        };
      })
    );

    return NextResponse.json(employeesWithStats);
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch employees",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, phoneCountryCode, role, defaultProfitRate, country, specialization, services, academicLevels, permissions } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        phoneCountryCode: phoneCountryCode || "+962",
        role: role || Role.EMPLOYEE,
        isActive: true,
        defaultProfitRate: defaultProfitRate || null,
        country: country || null,
        specialization: specialization || null,
        services: services ? services : null,
        academicLevels: academicLevels ? academicLevels : null,
        permissions: (role === Role.ADMIN && permissions && permissions.length > 0) ? permissions : null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
