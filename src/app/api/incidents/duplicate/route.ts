import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Incident from '@/models/Incident';

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, latitude, longitude, title } = body;

    if (!category || !latitude || !longitude) {
      return NextResponse.json(
        { message: 'Missing required fields: category, latitude, longitude are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for similar incidents within 100m radius
    const duplicateRadius = 100; // meters
    
    // Find recent incidents of the same category (last 24 hours)
    const recentIncidents = await Incident.find({
      category,
      status: { $in: ['new', 'in-progress'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    // Check if any incident is within the radius
    const nearbyIncidents = recentIncidents.filter(incident => {
      const distance = calculateDistance(
        latitude,
        longitude,
        incident.location.latitude,
        incident.location.longitude
      );
      return distance < duplicateRadius;
    });

    // Also check for similar titles
    const similarTitle = title ? recentIncidents.filter(incident => {
      const titleLower = title.toLowerCase();
      const incidentTitleLower = incident.title.toLowerCase();
      return incidentTitleLower.includes(titleLower) || titleLower.includes(incidentTitleLower);
    }) : [];

    const isDuplicate = nearbyIncidents.length > 0 || similarTitle.length > 0;

    return NextResponse.json({
      isDuplicate,
      nearbyCount: nearbyIncidents.length,
      similarTitleCount: similarTitle.length,
      nearbyIncidents: nearbyIncidents.slice(0, 3).map(incident => ({
        id: incident._id,
        title: incident.title,
        distance: calculateDistance(
          latitude,
          longitude,
          incident.location.latitude,
          incident.location.longitude
        ).toFixed(0)
      }))
    });
  } catch (error: any) {
    console.error('Duplicate check error:', error);
    return NextResponse.json(
      { 
        message: 'Error checking for duplicates',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

