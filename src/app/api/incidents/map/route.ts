import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";

export async function GET(request: Request) {
  try {
    const session = await auth?.();

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    // Build query
    const query: any = {
      location: { $exists: true, $ne: null },
    };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Admins see all incidents, regular users see their own
    if (session.user.role !== "admin") {
      query.reportedBy = session.user.id;
    }

    // Get incidents with location data
    const incidents = await Incident.find(query)
      .select("title category priority status location createdAt reportedBy")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Format data for map
    const mapData = incidents.map((incident) => ({
      id: incident._id.toString(),
      title: incident.title,
      category: incident.category,
      priority: incident.priority,
      status: incident.status,
      lat: incident.location.latitude,
      lng: incident.location.longitude,
      address: incident.location.address,
      createdAt: incident.createdAt,
      reportedBy: incident.reportedBy,
    }));

    return NextResponse.json({
      incidents: mapData,
      total: mapData.length,
    });
  } catch (error: any) {
    console.error("Get map incidents error:", error);
    return NextResponse.json(
      {
        message: "Error fetching map incidents",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
