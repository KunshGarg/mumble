import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAllEvents } from "@/services/event.service";


export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const events = await getAllEvents({ includeUnpublished: true });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching events:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
