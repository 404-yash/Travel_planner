import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Compass, LogIn, UserPlus, ShieldAlert, User, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setLoading(true);
    setError('');
    try {
      await login(e, p);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-700 p-6 text-white text-center">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Compass className="w-7 h-7 text-brand-100" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {isRegister ? 'Create Journey Account' : 'Welcome to Journey'}
          </h2>
          <p className="text-xs text-brand-100/80 mt-1">
            {isRegister ? 'Sign up to manage itineraries and e-tickets' : 'Sign in to access your booked journeys'}
          </p>
        </div>

        {/* Demo Quick Logins */}
        <div className="p-5 bg-brand-50 border-b border-brand-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block text-center">
            Demo Evaluation Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('traveler@journey.com', 'traveler123')}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-brand-200 rounded-lg text-xs font-bold text-slate-800 shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5 text-brand-600" /> Traveler Demo
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin@journey.com', 'admin123')}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-800 shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 rounded-xl text-xs shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Register Account
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-brand-700 hover:text-brand-800 font-semibold"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
