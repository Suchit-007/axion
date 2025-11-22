import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";

export async function GET(request: NextRequest) {
  try {
    // Get user session using getServerSession (more reliable for API routes)
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query for user's incidents
    const query: any = {
      reportedBy: session.user.id,
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const incidents = await Incident.find(query)
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
      hasMore: skip + limit < total,
    });
  } catch (error: any) {
    console.error("Get user incidents error:", error);
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
