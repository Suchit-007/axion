"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

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
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const statuses = ["all", "new", "in-progress", "resolved", "closed"];
const priorityColors: Record<string, string> = {
  critical: "bg-red-600",
  high: "bg-orange-600",
  medium: "bg-yellow-600",
  low: "bg-green-600",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-600",
  "in-progress": "bg-purple-600",
  resolved: "bg-green-600",
  closed: "bg-gray-600",
};

export default function IncidentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchIncidents();
    }
  }, [session, filterStatus, search]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/incidents/user?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setIncidents(data.incidents || []);
        setTotal(data.total || 0);
      } else {
        toast.error(data.message || "Failed to fetch incidents");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIncidents();
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      new: "🆕",
      "in-progress": "⚙️",
      resolved: "✅",
      closed: "🔒",
    };
    return icons[status] || "📌";
  };

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, string> = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🟢",
    };
    return icons[priority] || "⚪";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="text-white/60">Loading your incidents...</div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Stats */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-2">
                My Incidents
              </h1>
              <p className="text-purple-200/80 text-lg">
                Track and manage all your reported issues
              </p>
            </div>
            <Link
              href="/report"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 flex items-center gap-2"
            >
              <span>✨</span> Report New Issue
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
              <p className="text-white/60 text-xs font-semibold mb-1">TOTAL</p>
              <p className="text-2xl font-bold text-white">{total}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
              <p className="text-white/60 text-xs font-semibold mb-1">NEW</p>
              <p className="text-2xl font-bold text-blue-400">
                {incidents.filter((i) => i.status === "new").length}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
              <p className="text-white/60 text-xs font-semibold mb-1">
                IN PROGRESS
              </p>
              <p className="text-2xl font-bold text-purple-400">
                {incidents.filter((i) => i.status === "in-progress").length}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-green-500/50 transition-all duration-300">
              <p className="text-white/60 text-xs font-semibold mb-1">
                RESOLVED
              </p>
              <p className="text-2xl font-bold text-green-400">
                {incidents.filter((i) => i.status === "resolved").length}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 Search by title, category, or description..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/20"
                  />
                </div>
              </form>
              <div className="flex gap-2 flex-wrap items-center">
                {statuses.map((stat) => (
                  <button
                    key={stat}
                    onClick={() => setFilterStatus(stat)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                      filterStatus === stat
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50"
                        : "bg-white/5 border border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="text-white/60">Loading your incidents...</div>
            </div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-white text-xl mb-2">No incidents found</p>
            <p className="text-white/60 mb-6">
              Start by reporting your first issue
            </p>
            <Link
              href="/report"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Report First Incident
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {incidents.map((incident) => (
              <Link
                key={incident._id}
                href={`/incidents/${incident._id}`}
                className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 transition-all duration-300 rounded-2xl"></div>

                <div className="relative z-10">
                  {/* Header with Priority Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {incident.title}
                      </h3>
                    </div>
                    <div className="text-3xl ml-2">
                      {getPriorityIcon(incident.priority)}
                    </div>
                  </div>

                  {/* Category and Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/10 border border-white/20 capitalize">
                      {incident.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white capitalize ${
                        statusColors[incident.status] || "bg-gray-600"
                      }`}
                    >
                      {incident.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white capitalize bg-white/10 border border-white/20">
                      {incident.priority}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-white/70 text-sm line-clamp-3 mb-4 group-hover:text-white/80 transition-colors">
                    {incident.description}
                  </p>

                  {/* Footer Info */}
                  <div className="flex justify-between items-end text-xs text-white/50 group-hover:text-white/70 transition-colors">
                    <div>
                      <p>
                        📅 {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                      {incident.assignedTo && (
                        <p className="mt-1">👤 {incident.assignedTo.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p>→ View Details</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {total > 0 && incidents.length > 0 && (
          <div className="mt-10 text-center">
            <div className="inline-block bg-white/5 backdrop-blur-xl rounded-xl px-6 py-3 border border-white/10">
              <p className="text-white/70 text-sm">
                Showing{" "}
                <span className="font-semibold text-purple-400">
                  {incidents.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-purple-400">{total}</span>{" "}
                incidents
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
