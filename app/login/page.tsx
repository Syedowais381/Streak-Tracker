'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login: hardcoded credentials
    if (email === 'user@example.com' && password === 'pass') {
      router.push('/dashboard');
    } else {
      alert('Invalid credentials. Use user@example.com / pass');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, #064e3b, #022c22, #000000)' }}>
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="bg-green-900 p-8 rounded-lg shadow-xl max-w-md w-full border border-green-700 relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center uppercase text-transparent bg-gradient-to-r from-green-50 via-lime-100 to-green-200 bg-clip-text drop-shadow-xl" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.7), 0 0 40px rgba(34, 197, 94, 0.4), 2px 2px 4px rgba(0,0,0,0.6)' }}>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-green-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-800 text-green-100"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-green-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-800 text-green-100"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-500 hover:scale-105 shadow-lg"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-green-400">
          Dummy credentials: user@example.com / pass
        </p>
      </div>
    </div>
  );
}