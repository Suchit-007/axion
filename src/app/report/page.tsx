"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const categories = [
  "electricity",
  "water",
  "internet",
  "hostel",
  "garbage",
  "it",
  "equipment",
];
const priorities = ["low", "medium", "high", "critical"];

export default function ReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string>("");
  const [duplicateWarning, setDuplicateWarning] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    category: "electricity" as (typeof categories)[number],
    description: "",
    priority: "medium" as (typeof priorities)[number],
    images: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(
            "Could not get your location. Please enable location services."
          );
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Auto-detect priority based on keywords
  const detectPriority = (
    text: string,
    category: string
  ): (typeof priorities)[number] => {
    const lowerText = text.toLowerCase();
    const criticalKeywords = [
      "critical",
      "emergency",
      "fire",
      "flood",
      "gas leak",
      "electrocution",
    ];
    const highKeywords = ["urgent", "broken", "not working", "damage", "leak"];
    const lowKeywords = ["minor", "small", "cosmetic"];

    if (criticalKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "critical";
    }
    if (highKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "high";
    }
    if (lowKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "low";
    }

    // Category-based priority
    if (["electricity", "water"].includes(category)) {
      return "high";
    }

    return "medium";
  };

  // Check for duplicates
  const checkDuplicate = async () => {
    if (!location || !formData.category || !formData.title) return;

    setCheckingDuplicate(true);
    try {
      const response = await fetch("/api/incidents/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          latitude: location.lat,
          longitude: location.lng,
          title: formData.title,
        }),
      });

      const data = await response.json();
      if (data.isDuplicate) {
        setDuplicateWarning(
          `A similar ${formData.category} incident was reported nearby recently.`
        );
      } else {
        setDuplicateWarning("");
      }
    } catch (error) {
      console.error("Duplicate check error:", error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Auto-update priority when description or category changes
  useEffect(() => {
    if (formData.description || formData.category) {
      const newPriority = detectPriority(
        formData.description,
        formData.category
      );
      setFormData((prev) => ({ ...prev, priority: newPriority }));
    }
  }, [formData.description, formData.category]);

  // Check duplicate when location and category are available
  useEffect(() => {
    if (location && formData.category && formData.title) {
      const timeoutId = setTimeout(() => {
        checkDuplicate();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [location, formData.category, formData.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("Please log in to report an incident");
      return;
    }

    if (!location) {
      toast.error("Please enable location services to report an incident");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          location: {
            latitude: location.lat,
            longitude: location.lng,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Incident reported successfully!");
        router.push("/incidents");
      } else {
        toast.error(data.message || "Failed to report incident");
      }
    } catch (error: any) {
      toast.error(`Failed to report incident: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      electricity: "⚡",
      water: "💧",
      internet: "🌐",
      hostel: "🏢",
      garbage: "🗑️",
      it: "💻",
      equipment: "🔧",
    };
    return icons[cat] || "📌";
  };

  const getPriorityColor = (pri: string) => {
    const colors: Record<string, string> = {
      low: "from-blue-500 to-cyan-500",
      medium: "from-yellow-500 to-orange-500",
      high: "from-orange-500 to-red-500",
      critical: "from-red-600 to-pink-600",
    };
    return colors[pri] || "from-purple-500 to-indigo-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
              <p className="text-white text-xs font-semibold tracking-widest">
                REPORT ISSUE
              </p>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-4">
            Report an Incident
          </h1>
          <p className="text-purple-200/80 text-lg max-w-xl mx-auto">
            Help us improve by reporting maintenance issues. Your feedback
            matters!
          </p>
        </div>

        {/* Status Messages */}
        <div className="space-y-3 mb-8">
          {duplicateWarning && (
            <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm transform transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-yellow-200 font-medium">
                  {duplicateWarning}
                </p>
              </div>
            </div>
          )}

          {locationError && (
            <div className="relative bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <p className="text-red-200 font-medium">{locationError}</p>
              </div>
            </div>
          )}

          {location && (
            <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm transform transition-all duration-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-green-200 font-medium">
                  Location captured • {location.lat.toFixed(4)}°N,{" "}
                  {location.lng.toFixed(4)}°E
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Form Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* SECTION 1: Basic Information */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📋</span>
                <h2 className="text-xl font-bold text-white">
                  Basic Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-white mb-2 flex items-center gap-2"
                  >
                    <span className="text-purple-400">📝</span>
                    Incident Title
                    <span className="text-red-400 text-lg">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    maxLength={100}
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-white/20"
                    placeholder="E.g., Broken light in hallway"
                  />
                  <p className="text-xs text-white/50 mt-2">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-white mb-2 flex items-center gap-2"
                  >
                    <span className="text-purple-400">🏷️</span>
                    Category
                    <span className="text-red-400 text-lg">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-white/20 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {getCategoryIcon(cat)}{" "}
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description Textarea */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-white mb-2 flex items-center gap-2"
                  >
                    <span className="text-purple-400">📄</span>
                    Description
                    <span className="text-red-400 text-lg">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    minLength={20}
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-white/20 resize-none"
                    placeholder="Describe the issue in detail (minimum 20 characters)..."
                  />
                  <p className="text-xs text-white/50 mt-2">
                    {formData.description.length} characters (minimum 20)
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

            {/* SECTION 2: Location */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📍</span>
                <h2 className="text-xl font-bold text-white">Location</h2>
              </div>

              <div className="space-y-4">
                {/* Location Status */}
                {!location && !locationError && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200 text-sm flex items-center gap-2">
                      <span>🔄</span> Detecting your location...
                    </p>
                  </div>
                )}

                {locationError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-200 text-sm flex items-center gap-2">
                      <span>❌</span> {locationError}
                    </p>
                  </div>
                )}

                {location && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-200 text-sm flex items-center gap-2">
                      <span>✅</span> Location captured
                    </p>
                    <p className="text-green-100 text-xs mt-2 font-mono">
                      📍 {location.lat.toFixed(6)}°N, {location.lng.toFixed(6)}
                      °E
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

            {/* SECTION 3: Priority & Media */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">⚡</span>
                <h2 className="text-xl font-bold text-white">
                  Priority & Media
                </h2>
              </div>

              <div className="space-y-6">
                {/* Priority Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="text-purple-400">⚡</span>
                      Priority Level
                      <span className="text-xs bg-purple-500/20 px-2 py-1 rounded text-purple-200 border border-purple-500/30">
                        AUTO-DETECTED
                      </span>
                    </label>
                  </div>

                  <p className="text-xs text-white/60 mb-3">
                    Priority is automatically detected based on your
                    description, but you can override it:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {priorities.map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            priority: pri as (typeof priorities)[number],
                          }))
                        }
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1 ${
                          formData.priority === pri
                            ? `bg-gradient-to-r ${getPriorityColor(
                                pri
                              )} text-white shadow-lg`
                            : "bg-white/5 border border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <span>
                          {{
                            low: "🟢",
                            medium: "🟡",
                            high: "🟠",
                            critical: "🔴",
                          }[pri] || "●"}
                        </span>
                        {pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload (Coming Soon) */}
                <div>
                  <label className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                    <span className="text-purple-400">📸</span>
                    Image Upload
                    <span className="text-xs text-white/50">(Optional)</span>
                  </label>

                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors duration-300 bg-white/2">
                    <p className="text-4xl mb-2">📷</p>
                    <p className="text-white/70 text-sm mb-1">
                      Drag and drop images here or click to select
                    </p>
                    <p className="text-white/50 text-xs">
                      Coming soon - Currently supports images in incident
                      reports
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

            {/* SECTION 4: Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !location || checkingDuplicate}
                className="flex-1 py-3 px-6 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {checkingDuplicate ? "Checking..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Submit Incident
                    </>
                  )}
                </span>
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-lg border-2 border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/40 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <p className="text-2xl mb-2">✍️</p>
            <p className="text-white font-semibold text-sm mb-1">
              Be Descriptive
            </p>
            <p className="text-white/60 text-xs">
              Provide clear details about the issue
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <p className="text-2xl mb-2">📍</p>
            <p className="text-white font-semibold text-sm mb-1">Location</p>
            <p className="text-white/60 text-xs">
              Your location is auto-captured
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <p className="text-2xl mb-2">⚡</p>
            <p className="text-white font-semibold text-sm mb-1">Priority</p>
            <p className="text-white/60 text-xs">
              Auto-detected from your description
            </p>
          </div>
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
