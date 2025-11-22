import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Incident from "@/models/Incident";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid incident ID" },
        { status: 400 }
      );
    }

    const incident = await Incident.findById(id)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role")
      .lean();

    if (!incident) {
      return NextResponse.json(
        { message: "Incident not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this incident
    const isReporter =
      incident.reportedBy &&
      (incident.reportedBy as any)._id?.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";
    const isAssigned =
      incident.assignedTo &&
      (incident.assignedTo as any)._id?.toString() === session.user.id;

    if (!isReporter && !isAdmin && !isAssigned) {
      return NextResponse.json(
        { message: "Unauthorized to view this incident" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      incident,
    });
  } catch (error: any) {
    console.error("Get incident error:", error);
    return NextResponse.json(
      {
        message: "Error fetching incident",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
