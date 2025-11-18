import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createEvent, addEventImage } from "@/services/event.service";


export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

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
      images, // Array of {url, altText}
    } = body;

    // Validate required fields
    if (!title || !dateTime || !location || !basePrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create event
    const event = await createEvent({
      title,
      description: description || "",
      dateTime: new Date(dateTime),
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      basePrice: parseInt(basePrice),
      isPublished: isPublished || false,
      discountTier1Quantity: parseInt(discountTier1Quantity) || 2,
      discountTier1Percent: parseFloat(discountTier1Percent) || 0,
      discountTier2Quantity: parseInt(discountTier2Quantity) || 4,
      discountTier2Percent: parseFloat(discountTier2Percent) || 0,
    });

    // Add images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (const image of images) {
        await addEventImage(event.id, {
          url: image.url,
          altText: image.altText || "",
        });
      }
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
