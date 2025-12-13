'use client';

export default function Dashboard() {
  const currentStreak = 7; // Dummy data
  const longestStreak = 14;
  const totalActive = 21;

  return (
    <div className="min-h-screen p-4 relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, #064e3b, #022c22, #000000)' }}>
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-gradient-to-r from-green-50 via-lime-100 to-green-200 bg-clip-text mb-8 uppercase drop-shadow-xl" style={{ textShadow: '0 0 25px rgba(34, 197, 94, 0.8), 0 0 50px rgba(34, 197, 94, 0.5), 3px 3px 6px rgba(0,0,0,0.6)' }}>
          Your Streak Dashboard
        </h1>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700 transition-all duration-500 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-green-100 mb-2">Current Streak</h3>
            <p className="text-3xl font-bold text-green-300">{currentStreak} days</p>
          </div>
          <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700 transition-all duration-500 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-green-100 mb-2">Longest Streak</h3>
            <p className="text-3xl font-bold text-green-300">{longestStreak} days</p>
          </div>
          <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700 transition-all duration-500 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-green-100 mb-2">Total Active</h3>
            <p className="text-3xl font-bold text-green-300">{totalActive} days</p>
          </div>
        </div>

        {/* Bento Grid for Streak Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700">
            <h2 className="text-2xl font-bold mb-4 text-green-100">Streak Progress</h2>
            <div className="mb-4">
              <div className="w-full bg-green-800 rounded-full h-8 overflow-hidden">
                <div
                  className="h-8 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStreak / 30) * 100}%`, background: 'radial-gradient(circle, #16a34a, #22c55e)' }}
                ></div>
              </div>
            </div>
            <p className="text-green-300">
              Keep it up! Every day counts towards your recovery.
            </p>
          </div>

          <div className="bg-green-900 p-6 rounded-lg shadow-lg border border-green-700">
            <h2 className="text-2xl font-bold mb-4 text-green-100">Daily Check-in</h2>
            <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
              Mark Today Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}