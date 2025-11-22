import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Smart Maintenance Platform</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Real-time incident tracking, prediction, and intelligent technician allocation system</p>
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Login</Link>
            <Link href="/register" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">Register</Link>
            <Link href="/dashboard" className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">Dashboard</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="font-semibold text-lg mb-3">🚨 Incident Reporting</h3><p className="text-gray-600">Report issues in real-time with GPS location and image uploads</p></div>
            <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="font-semibold text-lg mb-3">📊 Smart Predictions</h3><p className="text-gray-600">AI-powered predictions to prevent issues before they occur</p></div>
            <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="font-semibold text-lg mb-3">👨‍💼 Technician Allocation</h3><p className="text-gray-600">Automated scheduling with no overlapping assignments</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

