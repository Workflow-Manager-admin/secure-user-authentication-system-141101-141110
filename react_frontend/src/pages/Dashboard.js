import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      // Error is already handled by AuthContext with toast
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 border border-zinc-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Welcome back!
            </h2>
            <p className="text-xl text-zinc-400">
              Signed in as <span className="text-accent font-medium">{user?.email}</span>
            </p>
          </div>

          {/* Dashboard Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-zinc-800">
              <div className="space-y-6">
                <div className="flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mx-auto">
                  <svg 
                    className="w-8 h-8 text-accent" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    You're all set!
                  </h3>
                  <p className="text-zinc-400">
                    Your account is active and ready to use. This is your secure dashboard 
                    where you can manage your account and access your features.
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-zinc-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Account verified</span>
                    </div>
                    <div className="flex items-center space-x-2 text-zinc-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Secure connection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
