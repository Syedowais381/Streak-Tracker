'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const quotes = [
  "\"The only way to do great work is to love what you do.\" - Steve Jobs",
  "\"Success is not final, failure is not fatal: It is the courage to continue that counts.\" - Winston Churchill",
  "\"Your only limit is you.\" - Unknown",
  "\"Discipline is the bridge between goals and accomplishment.\" - Jim Rohn",
  "\"The journey of a thousand miles begins with one step.\" - Lao Tzu",
  "\"Strength does not come from physical capacity. It comes from an indomitable will.\" - Mahatma Gandhi",
  "\"Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.\" - Unknown",
  "\"Every accomplishment starts with the decision to try.\" - John F. Kennedy",
  "\"You are stronger than you think.\" - Unknown",
  "\"Progress, not perfection.\" - Unknown"
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [randomQuote, setRandomQuote] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setIsLoaded(true);
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy signup: any email/pass works
    if (email && password) {
      // Simulate signup success
      setIsModalOpen(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, #064e3b, #022c22, #000000)' }}>
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      {/* Glowing blob */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #16a34a, #22c55e)' }}></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-green-50 via-lime-100 to-green-200 bg-clip-text mb-8 uppercase tracking-tight drop-shadow-2xl" style={{ textShadow: '0 0 30px rgba(34, 197, 94, 0.9), 0 0 60px rgba(34, 197, 94, 0.5), 4px 4px 8px rgba(0,0,0,0.7)' }}>
          Streak Tracker
        </h1>
        <blockquote className={`text-xl md:text-2xl italic text-green-300 mb-8 md:mb-12 leading-relaxed ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          {randomQuote}
        </blockquote>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => router.push('/login')}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-500 hover:scale-105 shadow-lg"
          >
            Login
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-800 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-500 hover:scale-105 shadow-lg"
          >
            Sign Up
          </button>
        </div>
        <p className="text-green-400 text-sm">Join 1,000+ builders on their journey</p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-green-900 p-8 rounded-lg shadow-xl max-w-md w-full mx-4 border border-green-700 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-green-400 hover:text-green-300 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center uppercase text-transparent bg-gradient-to-r from-green-50 via-lime-100 to-green-200 bg-clip-text" style={{ textShadow: '0 0 15px rgba(34, 197, 94, 0.6), 1px 1px 2px rgba(0,0,0,0.5)' }}>Sign Up</h2>
            <form onSubmit={handleSignup}>
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
                Sign Up
              </button>
            </form>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 text-green-400 hover:text-green-300 block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
