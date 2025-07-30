import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-6">
      <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>
      <button
        onClick={handleLogout}
        className="btn bg-accent px-6 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
