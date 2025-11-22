'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { generateHeatmapData, clusterIncidents } from '@/lib/heatmap';

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });

interface MapIncident {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  lat: number;
  lng: number;
  address?: string;
  createdAt: string;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

const categories = ['all', 'electricity', 'water', 'internet', 'hostel', 'garbage', 'it', 'equipment'];
const priorityColors: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a'
};

const statusColors: Record<string, string> = {
  new: '#2563eb',
  'in-progress': '#9333ea',
  resolved: '#16a34a',
  closed: '#6b7280'
};

export default function MapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = useState<MapIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClusters, setShowClusters] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchIncidents();
      getUserLocation();
    }
  }, [session, filterCategory]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setMapCenter([lat, lng]);
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 13);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }

      const response = await fetch(`/api/incidents/map?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setIncidents(data.incidents || []);
        
        // Update map center to first incident or user location
        if (data.incidents && data.incidents.length > 0 && !userLocation) {
          const firstIncident = data.incidents[0];
          setMapCenter([firstIncident.lat, firstIncident.lng]);
        }
      } else {
        toast.error(data.message || 'Failed to fetch incidents');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate heatmap data
  const heatmapData = showHeatmap ? generateHeatmapData(incidents) : [];

  // Generate clusters
  const clusters = showClusters ? clusterIncidents(
    incidents.map(inc => ({ lat: inc.lat, lng: inc.lng, weight: 1 }))
  ) : [];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header and Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] bg-purple-800/90 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Incident Map</h1>
            <p className="text-purple-200 text-sm">
              {incidents.length} incident{incidents.length !== 1 ? 's' : ''} shown
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-900/40 text-purple-200 hover:bg-purple-900/60'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* View Options */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  showHeatmap
                    ? 'bg-green-600 text-white'
                    : 'bg-purple-900/40 text-purple-200 hover:bg-purple-900/60'
                }`}
              >
                {showHeatmap ? '✓' : ''} Heatmap
              </button>
              <button
                onClick={() => setShowClusters(!showClusters)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  showClusters
                    ? 'bg-green-600 text-white'
                    : 'bg-purple-900/40 text-purple-200 hover:bg-purple-900/60'
                }`}
              >
                {showClusters ? '✓' : ''} Clusters
              </button>
            </div>

            {/* User Location Button */}
            {userLocation && (
              <button
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.setView(userLocation, 13);
                  }
                }}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                📍 My Location
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-screen w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/50 z-50">
            <div className="text-white text-xl">Loading map...</div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            className="z-0"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Heatmap Layer */}
            {showHeatmap && heatmapData.map((point, index) => (
              <CircleMarker
                key={`heat-${index}`}
                center={[point.lat, point.lng]}
                radius={Math.sqrt(point.weight) * 5}
                fillColor="#ff0000"
                fillOpacity={Math.min(point.weight / 10, 0.6)}
                color="#ff0000"
                weight={1}
              />
            ))}

            {/* Incident Markers */}
            {!showClusters && incidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.lat, incident.lng]}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-sm mb-2">{incident.title}</h3>
                    <div className="space-y-1 text-xs">
                      <p><strong>Category:</strong> <span className="capitalize">{incident.category}</span></p>
                      <p><strong>Priority:</strong> 
                        <span 
                          className="ml-1 px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: priorityColors[incident.priority] || '#6b7280' }}
                        >
                          {incident.priority}
                        </span>
                      </p>
                      <p><strong>Status:</strong> 
                        <span 
                          className="ml-1 px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: statusColors[incident.status] || '#6b7280' }}
                        >
                          {incident.status}
                        </span>
                      </p>
                      <p><strong>Reported:</strong> {new Date(incident.createdAt).toLocaleDateString()}</p>
                      <p><strong>By:</strong> {incident.reportedBy.name}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Clustered Markers */}
            {showClusters && clusters.map((cluster, index) => (
              <CircleMarker
                key={`cluster-${index}`}
                center={[cluster.center.lat, cluster.center.lng]}
                radius={Math.min(cluster.count * 3, 20)}
                fillColor="#9333ea"
                fillOpacity={0.6}
                color="#9333ea"
                weight={2}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{cluster.count} incidents</h3>
                    <p className="text-sm text-gray-600">Click to see individual incidents</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-purple-800/90 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30 shadow-lg">
        <div className="flex justify-between items-center text-sm text-purple-200">
          <div>
            <Link href="/incidents" className="text-purple-300 hover:text-purple-100 underline">
              View List
            </Link>
            {' • '}
            <Link href="/report" className="text-purple-300 hover:text-purple-100 underline">
              Report Incident
            </Link>
          </div>
          <div>
            <span className="text-xs">Legend: </span>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1" />
            <span className="text-xs mr-3">High Density</span>
            <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1" />
            <span className="text-xs">Cluster</span>
          </div>
        </div>
      </div>
    </div>
  );
}

