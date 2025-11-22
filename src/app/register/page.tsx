'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student' as 'student' | 'staff' | 'technician'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?message=Registration successful');
      } else {
        // Show more detailed error message
        const errorMsg = data.error 
          ? `${data.message}\n\nDetails: ${data.error}` 
          : data.message || 'Registration failed';
        alert(errorMsg);
      }
    } catch (error: any) {
      alert(`Registration failed: ${error.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              name="name"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-purple-400/30 bg-purple-900/40 backdrop-blur-sm placeholder-purple-300/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all mb-4"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-purple-400/30 bg-purple-900/40 backdrop-blur-sm placeholder-purple-300/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all mb-4"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-purple-400/30 bg-purple-900/40 backdrop-blur-sm placeholder-purple-300/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all mb-4"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              name="phone"
              type="tel"
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-purple-400/30 bg-purple-900/40 backdrop-blur-sm placeholder-purple-300/60 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all mb-4"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={handleChange}
            />
            <select
              name="role"
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-purple-400/30 bg-purple-900/40 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student" className="bg-purple-900">Student</option>
              <option value="staff" className="bg-purple-900">Staff</option>
              <option value="technician" className="bg-purple-900">Technician</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-purple-300 hover:text-purple-200 font-medium transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

