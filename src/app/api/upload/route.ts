import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const USE_BLOB_STORAGE = process.env.BLOB_READ_WRITE_TOKEN !== undefined;
const IS_VERCEL = process.env.VERCEL === "1";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-rar-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "bin";
    const filename = `${randomUUID()}.${fileExtension}`;

    // Use Vercel Blob Storage if available (recommended for production)
    if (USE_BLOB_STORAGE || IS_VERCEL) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`uploads/${filename}`, file, {
          access: "public",
          contentType: file.type || "application/octet-stream",
          addRandomSuffix: false,
        });

        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.error("Blob storage error:", blobError);
        // If blob storage fails and we're on Vercel, return error
        if (IS_VERCEL) {
          return NextResponse.json(
            { 
              error: "Failed to upload file. Please ensure BLOB_READ_WRITE_TOKEN is set in environment variables." 
            },
            { status: 500 }
          );
        }
        // Fall through to local storage if not on Vercel
      }
    }

    // Fallback to local file system (only works in development or non-serverless environments)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), "public", "uploads");
      
      // Only try to create directory if we're not in a serverless environment
      if (!IS_VERCEL) {
        await mkdir(uploadDir, { recursive: true });
      } else {
        // On Vercel, we can't create directories, so we must use blob storage
        return NextResponse.json(
          { 
            error: "File upload requires BLOB_READ_WRITE_TOKEN environment variable in production." 
          },
          { status: 500 }
        );
      }

      // Write file to disk
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      // Return public URL
      const url = `/uploads/${filename}`;
      return NextResponse.json({ url });
    } catch (fsError: any) {
      console.error("File system error:", fsError);
      
      // If we're on Vercel and local storage fails, suggest blob storage
      if (IS_VERCEL) {
        return NextResponse.json(
          { 
            error: "File upload failed. Please configure BLOB_READ_WRITE_TOKEN environment variable for production deployments." 
          },
          { status: 500 }
        );
      }
      
      throw fsError;
    }
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
