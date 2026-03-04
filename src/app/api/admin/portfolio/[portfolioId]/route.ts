import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET - Get single portfolio item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolioId } = await params;

    const portfolioItem = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolioItem);
  } catch (error: any) {
    console.error("Error fetching portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch portfolio item" },
      { status: 500 }
    );
  }
}

// PATCH - Update portfolio item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolioId } = await params;
    const body = await request.json();

    const { title, description, image, link, file, academicLevel, date, countries } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (image !== undefined) updateData.image = image?.trim() || null;
    if (link !== undefined) updateData.link = link?.trim() || null;
    if (file !== undefined) updateData.file = file?.trim() || null;
    if (academicLevel !== undefined) updateData.academicLevel = academicLevel || null;
    if (date !== undefined) updateData.date = date ? new Date(date) : null;
    if (countries !== undefined) updateData.countries = Array.isArray(countries) && countries.length > 0 ? countries : Prisma.JsonNull;

    const portfolioItem = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: updateData,
    });

    return NextResponse.json(portfolioItem);
  } catch (error: any) {
    console.error("Error updating portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolioId } = await params;

    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
