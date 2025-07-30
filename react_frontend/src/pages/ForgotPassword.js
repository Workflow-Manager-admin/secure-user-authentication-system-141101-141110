import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    try {
      await resetPassword(email);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded shadow-md w-full max-w-xs flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <input
          className="p-2 rounded bg-zinc-800"
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          className="btn bg-accent py-2 rounded disabled:opacity-50"
          disabled={sending}
          type="submit"
        >
          {sending ? 'Sending…' : 'Send reset link'}
        </button>
        <Link to="/login" className="underline text-sm text-center">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
