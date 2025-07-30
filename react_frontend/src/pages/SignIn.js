import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(form);
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded shadow-md w-full max-w-xs flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <input
          className="p-2 rounded bg-zinc-800"
          required
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="p-2 rounded bg-zinc-800"
          required
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button
          className="btn bg-accent py-2 rounded disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="underline">
            Forgot?
          </Link>
          <Link to="/signup" className="underline">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}
