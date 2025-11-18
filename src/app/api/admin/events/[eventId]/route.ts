import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  updateEvent,
  deleteEvent,
  addEventImage,
} from "@/services/event.service";


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { eventId } = await params;
    const body = (await request.json()) as any;
    const {
      title,
      description,
      dateTime,
      location,
      latitude,
      longitude,
      basePrice,
      isPublished,
      discountTier1Quantity,
      discountTier1Percent,
      discountTier2Quantity,
      discountTier2Percent,
      newImages, // Array of {url, altText} for new images to add
    } = body;

    // Build update object (only include provided fields)
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dateTime !== undefined) updateData.dateTime = new Date(dateTime);
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined)
      updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined)
      updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (basePrice !== undefined) updateData.basePrice = parseInt(basePrice);
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (discountTier1Quantity !== undefined)
      updateData.discountTier1Quantity = parseInt(discountTier1Quantity);
    if (discountTier1Percent !== undefined)
      updateData.discountTier1Percent = parseFloat(discountTier1Percent);
    if (discountTier2Quantity !== undefined)
      updateData.discountTier2Quantity = parseInt(discountTier2Quantity);
    if (discountTier2Percent !== undefined)
      updateData.discountTier2Percent = parseFloat(discountTier2Percent);

    // Update event
    const event = await updateEvent(eventId, updateData);

    // Add new images if provided
    if (newImages && Array.isArray(newImages) && newImages.length > 0) {
      for (const image of newImages) {
        await addEventImage(eventId, {
          url: image.url,
          altText: image.altText || "",
        });
      }
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating event:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { eventId } = await params;

    // Delete event
    await deleteEvent(eventId);

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting event:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error.message?.includes("Cannot delete event with existing orders")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
