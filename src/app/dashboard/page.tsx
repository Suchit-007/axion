"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

interface Incident {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else {
      setUser(session.user);
      fetchRecentIncidents();
    }
  }, [session, status, router]);

  const fetchRecentIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/incidents/user?limit=5");
      const data = await response.json();

      if (response.ok) {
        setRecentIncidents(data.incidents || []);
      } else {
        toast.error(data.message || "Failed to fetch incidents");
      }
    } catch (error: any) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      student: "👨‍🎓",
      staff: "👨‍💼",
      technician: "🔧",
      admin: "👑",
    };
    return icons[role] || "👤";
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

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      new: "🆕",
      "in-progress": "⚙️",
      resolved: "✅",
      closed: "🔒",
    };
    return icons[status] || "📌";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="text-white/60">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const criticalCount = recentIncidents.filter(
    (i) => i.priority === "critical"
  ).length;
  const resolvedCount = recentIncidents.filter(
    (i) => i.status === "resolved"
  ).length;
  const inProgressCount = recentIncidents.filter(
    (i) => i.status === "in-progress"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
              {getRoleIcon(user.role)}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-purple-200/80">
                You're logged in as{" "}
                <span className="font-semibold capitalize">{user.role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <p className="text-white/60 text-sm font-semibold mb-2">
              📊 TOTAL INCIDENTS
            </p>
            <p className="text-3xl font-bold text-white">
              {recentIncidents.length}
            </p>
            <p className="text-white/50 text-xs mt-2">Your reported issues</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
            <p className="text-white/60 text-sm font-semibold mb-2">
              🔴 CRITICAL
            </p>
            <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-white/50 text-xs mt-2">
              Need immediate attention
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <p className="text-white/60 text-sm font-semibold mb-2">
              ⚙️ IN PROGRESS
            </p>
            <p className="text-3xl font-bold text-purple-400">
              {inProgressCount}
            </p>
            <p className="text-white/50 text-xs mt-2">Being worked on</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
            <p className="text-white/60 text-sm font-semibold mb-2">
              ✅ RESOLVED
            </p>
            <p className="text-3xl font-bold text-green-400">{resolvedCount}</p>
            <p className="text-white/50 text-xs mt-2">Fixed issues</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/report"
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 transition-all duration-300 rounded-2xl"></div>
            <div className="relative z-10">
              <p className="text-5xl mb-4">🚨</p>
              <h3 className="font-bold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                Report Incident
              </h3>
              <p className="text-white/70 mb-4 group-hover:text-white/80 transition-colors">
                Report new maintenance or facility issues in your area
              </p>
              <p className="text-purple-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Get started <span>→</span>
              </p>
            </div>
          </Link>

          <Link
            href="/incidents"
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 transition-all duration-300 rounded-2xl"></div>
            <div className="relative z-10">
              <p className="text-5xl mb-4">📊</p>
              <h3 className="font-bold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                View Status
              </h3>
              <p className="text-white/70 mb-4 group-hover:text-white/80 transition-colors">
                Track your reported issues and see their current status
              </p>
              <p className="text-purple-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Check status <span>→</span>
              </p>
            </div>
          </Link>

          <Link
            href="/map"
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 transition-all duration-300 rounded-2xl"></div>
            <div className="relative z-10">
              <p className="text-5xl mb-4">📍</p>
              <h3 className="font-bold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                Live Map
              </h3>
              <p className="text-white/70 mb-4 group-hover:text-white/80 transition-colors">
                See incident hotspots and heatmap visualization
              </p>
              <p className="text-purple-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                View map <span>→</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Incidents</h2>
            <Link
              href="/incidents"
              className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-2 transition-all hover:gap-3"
            >
              View All <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="text-white/60">Loading incidents...</div>
            </div>
          ) : recentIncidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-white/70 mb-2">No incidents reported yet</p>
              <p className="text-white/50 mb-6">
                Start reporting issues to track them here
              </p>
              <Link
                href="/report"
                className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                Report First Incident
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentIncidents.map((incident) => (
                <Link
                  key={incident._id}
                  href={`/incidents/${incident._id}`}
                  className="group block bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {incident.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap items-center">
                        <span className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-white/10 border border-white/20 capitalize">
                          {incident.category}
                        </span>
                        <span className="text-xl">
                          {getPriorityIcon(incident.priority)}
                        </span>
                        <span className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-white/10 border border-white/20 capitalize">
                          {incident.priority}
                        </span>
                        <span className="px-2 py-1 rounded-lg text-xs font-medium text-white bg-white/10 border border-white/20 capitalize">
                          {incident.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-white/50 group-hover:text-white/70 transition-colors ml-4 whitespace-nowrap">
                      <p>{new Date(incident.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs">
                        {new Date(incident.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
