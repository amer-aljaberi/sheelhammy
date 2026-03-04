import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET - Get all portfolio items
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = await prisma.portfolio.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(portfolio);
  } catch (error: any) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// POST - Create new portfolio item
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, image, link, file, academicLevel, date, countries } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const portfolioItem = await prisma.portfolio.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        link: link?.trim() || null,
        file: file?.trim() || null,
        academicLevel: academicLevel || null,
        date: date ? new Date(date) : null,
        countries: Array.isArray(countries) && countries.length > 0 ? countries : Prisma.JsonNull,
      },
    });

    return NextResponse.json(portfolioItem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}
