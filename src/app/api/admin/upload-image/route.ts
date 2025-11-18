import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { generatePresignedUploadUrl } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const body:any = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `events/${uuidv4()}.${fileExtension}`;

    // Generate presigned URL (expires in 5 minutes)
    const { presignedUrl, publicUrl } = await generatePresignedUploadUrl(
      uniqueFileName,
      contentType,
      300
    );

    return NextResponse.json(
      { presignedUrl, publicUrl },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Return detailed error in development
    const errorMessage = error.message || "Failed to generate presigned URL";
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}
