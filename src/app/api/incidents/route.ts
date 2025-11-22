import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export async function POST(request: NextRequest) {
  try {
    // Get user session using getServerSession (more reliable for API routes)
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Support both JSON and multipart/form-data (for file uploads)
    const contentType = request.headers.get("content-type") || "";
    let title: any,
      category: any,
      description: any,
      priority: any,
      location: any,
      images: any;

    if (contentType.includes("multipart/form-data")) {
      // Parse formData (Files will be File objects)
      const form = await request.formData();
      title = (form.get("title") as string) || null;
      category = (form.get("category") as string) || null;
      description = (form.get("description") as string) || null;
      priority = (form.get("priority") as string) || null;
      const locationField = (form.get("location") as string) || null;

      try {
        location = locationField ? JSON.parse(locationField) : null;
      } catch (e) {
        location = null;
      }

      // Collect file names (replace with real storage/upload as needed)
      const files = form.getAll("images") || [];
      images = files.map((f: any) => (f && f.name ? f.name : String(f)));
    } else {
      const body = await request.json();
      title = body.title;
      category = body.category;
      description = body.description;
      priority = body.priority;
      location = body.location;
      images = body.images || [];
    }

    // Validate required fields
    if (!title || !category || !description || !location) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: title, category, description, and location are required",
        },
        { status: 400 }
      );
    }

    if (!location.latitude || !location.longitude) {
      return NextResponse.json(
        { message: "Invalid location coordinates" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate incidents within 100m radius and same category
    const duplicateRadius = 100; // meters
    const recentIncidents = await Incident.find({
      category,
      status: { $in: ["new", "in-progress"] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    });

    const hasDuplicate = recentIncidents.some((incident) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        incident.location.latitude,
        incident.location.longitude
      );
      return distance < duplicateRadius;
    });

    if (hasDuplicate) {
      return NextResponse.json(
        {
          message:
            "A similar incident was already reported nearby. Please check existing incidents.",
          isDuplicate: true,
        },
        { status: 409 }
      );
    }

    // Validate category
    const validCategories = [
      "electricity",
      "water",
      "internet",
      "hostel",
      "garbage",
      "it",
      "equipment",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { message: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "critical"];
    const finalPriority = validPriorities.includes(priority)
      ? priority
      : "medium";

    // Create incident
    const incident = await Incident.create({
      title,
      category,
      description,
      priority: finalPriority,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      },
      images: images || [],
      reportedBy: session.user.id,
      status: "new",
    });

    // Populate reporter info
    await incident.populate("reportedBy", "name email");

    return NextResponse.json(
      {
        message: "Incident reported successfully",
        incident: {
          id: incident._id,
          title: incident.title,
          category: incident.category,
          priority: incident.priority,
          status: incident.status,
          location: incident.location,
          createdAt: incident.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create incident error:", error);
    return NextResponse.json(
      {
        message: "Error creating incident",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET all incidents (for admin/map view)
export async function GET(request: NextRequest) {
  try {
    // Get user session using getServerSession
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    // Regular users can only see their own incidents, admins see all
    if (session.user.role !== "admin") {
      query.reportedBy = session.user.id;
    }

    const incidents = await Incident.find(query)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Incident.countDocuments(query);

    return NextResponse.json({
      incidents,
      total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error("Get incidents error:", error);
    return NextResponse.json(
      {
        message: "Error fetching incidents",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
