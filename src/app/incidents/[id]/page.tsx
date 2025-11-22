'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Incident {
  _id: string;
  title: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
  reportedBy: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-600',
  medium: 'bg-yellow-600',
  low: 'bg-green-600'
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-600',
  'in-progress': 'bg-purple-600',
  resolved: 'bg-green-600',
  closed: 'bg-gray-600'
};

export default function IncidentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const incidentId = params?.id as string;
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && incidentId) {
      fetchIncident();
    }
  }, [session, incidentId]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/incidents/${incidentId}`);
      const data = await response.json();

      if (response.ok) {
        setIncident(data.incident);
      } else {
        toast.error(data.message || 'Failed to fetch incident');
        router.push('/incidents');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      router.push('/incidents');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !incident) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/incidents"
          className="text-purple-300 hover:text-purple-200 mb-6 inline-block transition-colors"
        >
          ← Back to Incidents
        </Link>

        <div className="bg-purple-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-400/30">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-white">{incident.title}</h1>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium text-white ${priorityColors[incident.priority] || 'bg-gray-600'}`}
                >
                  {incident.priority}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusColors[incident.status] || 'bg-gray-600'}`}
                >
                  {incident.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-purple-600 capitalize">
                {incident.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
            <p className="text-purple-200 whitespace-pre-wrap">{incident.description}</p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Location</h2>
            <div className="text-purple-200">
              <p>Latitude: {incident.location.latitude.toFixed(6)}</p>
              <p>Longitude: {incident.location.longitude.toFixed(6)}</p>
              {incident.location.address && (
                <p>Address: {incident.location.address}</p>
              )}
            </div>
          </div>

          {/* Images */}
          {incident.images && incident.images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {incident.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Incident image ${index + 1}`}
                    className="rounded-lg w-full h-48 object-cover border border-purple-400/30"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Timeline</h2>
            <div className="space-y-3 text-purple-200">
              <div>
                <p className="font-medium">Reported: {formatDate(incident.createdAt)}</p>
                <p className="text-sm text-purple-300">By: {incident.reportedBy.name} ({incident.reportedBy.email})</p>
              </div>
              <div>
                <p className="font-medium">Last Updated: {formatDate(incident.updatedAt)}</p>
              </div>
              {incident.resolvedAt && (
                <div>
                  <p className="font-medium">Resolved: {formatDate(incident.resolvedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Technician */}
          {incident.assignedTo && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Assigned Technician</h2>
              <div className="text-purple-200">
                <p>{incident.assignedTo.name}</p>
                <p className="text-sm text-purple-300">{incident.assignedTo.email}</p>
              </div>
            </div>
          )}

          {/* Comments/Updates Section (Placeholder) */}
          <div className="mt-8 pt-6 border-t border-purple-400/30">
            <h2 className="text-xl font-semibold text-white mb-3">Updates</h2>
            <div className="text-purple-200 text-sm italic">
              Comments and updates feature coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

