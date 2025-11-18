import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { removeEventImage } from "@/services/event.service";
import { deleteFromR2, getFileNameFromUrl } from "@/lib/r2";
import { prismaService } from "@/services/prisma.service";


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; imageId: string }> }
) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { imageId } = await params;

    // Get image details before deleting
    const image = await prismaService.prisma.eventImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Extract filename from URL and delete from R2
    try {
      const fileName = getFileNameFromUrl(image.url);
      await deleteFromR2(fileName);
    } catch (error) {
      console.error("Error deleting from R2:", error);
      // Continue even if R2 deletion fails
    }

    // Delete from database
    await removeEventImage(imageId);

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting image:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
