import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    firstName: '',
    lastName: '',
    email: '', 
    password: '',
    confirmPassword: '',
    profession: '',
    customProfession: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const professionOptions = [
    { value: '', label: 'Select your profession' },
    { value: 'Student', label: 'Student' },
    { value: 'IT Professional', label: 'IT Professional' },
    { value: 'Other', label: 'Other' }
  ];

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.profession) {
      newErrors.profession = 'Please select your profession';
    }

    if (form.profession === 'Other' && !form.customProfession.trim()) {
      newErrors.customProfession = 'Please specify your profession';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const finalProfession = form.profession === 'Other' ? form.customProfession : form.profession;
      
      await signUp({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        profession: finalProfession
      });
      
      navigate('/login', { replace: true });
    } catch (error) {
      // Error is already handled by AuthContext with toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-zinc-800 space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-zinc-400">Join us today</p>
          </div>
          
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                  errors.firstName ? 'border-red-500' : 'border-zinc-700'
                } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
                required
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={form.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                  errors.lastName ? 'border-red-500' : 'border-zinc-700'
                } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
                required
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>

            {/* Profession Dropdown */}
            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-zinc-300 mb-2">
                Profession
              </label>
              <select
                id="profession"
                className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                  errors.profession ? 'border-red-500' : 'border-zinc-700'
                } text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
                required
                name="profession"
                value={form.profession}
                onChange={handleChange}
              >
                {professionOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-zinc-800">
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.profession && (
                <p className="mt-1 text-sm text-red-400">{errors.profession}</p>
              )}
            </div>

            {/* Custom Profession Input (shown when "Other" is selected) */}
            {form.profession === 'Other' && (
              <div>
                <label htmlFor="customProfession" className="block text-sm font-medium text-zinc-300 mb-2">
                  Please specify your profession
                </label>
                <input
                  id="customProfession"
                  className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                    errors.customProfession ? 'border-red-500' : 'border-zinc-700'
                  } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
                  required
                  type="text"
                  name="customProfession"
                  placeholder="Enter your profession"
                  value={form.customProfession}
                  onChange={handleChange}
                />
                {errors.customProfession && (
                  <p className="mt-1 text-sm text-red-400">{errors.customProfession}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                  errors.email ? 'border-red-500' : 'border-zinc-700'
                } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
                required
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <input
                id="password"
                className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                  errors.password ? 'border-red-500' : 'border-zinc-700'
                } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
                required
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                className={`w-full px-4 py-3 rounded-lg bg-zinc-800/50 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-zinc-700'
                } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
                required
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-sm text-center text-zinc-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-accent hover:text-accent/80 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
