import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Ticket, ShieldAlert, LogOut, LogIn, Info, Radio } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-brand-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition">
            <Compass className="w-6 h-6 text-brand-100" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-wide leading-tight">JOURNEY</div>
            <div className="text-xs text-brand-100/80 tracking-normal font-medium">Plan any trip, one booking</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
              isActive('/') ? 'bg-brand-800 text-white shadow-inner' : 'text-brand-100 hover:bg-brand-600'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Search Routes</span>
          </Link>

          <Link
            to="/spot"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
              isActive('/spot') ? 'bg-emerald-700 text-white shadow-inner' : 'text-teal-200 hover:bg-brand-600'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Spot Train</span>
          </Link>

          {user && (
            <Link
              to="/my-bookings"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/my-bookings') ? 'bg-brand-800 text-white shadow-inner' : 'text-brand-100 hover:bg-brand-600'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">My Bookings</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/admin') ? 'bg-amber-600 text-white shadow-inner' : 'text-amber-200 hover:bg-brand-600'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Admin Hub</span>
            </Link>
          )}

          <Link
            to="/about"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
              isActive('/about') ? 'bg-brand-800 text-white shadow-inner' : 'text-brand-100 hover:bg-brand-600'
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="hidden md:inline">Architecture</span>
          </Link>

          <div className="h-6 w-px bg-brand-600 mx-1 sm:mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-100 hidden md:inline">
                {user.name} {isAdmin && <span className="bg-amber-500 text-brand-900 text-xs font-bold px-1.5 py-0.5 rounded">ADMIN</span>}
              </span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-brand-100 hover:bg-brand-600 transition flex items-center gap-1"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 transition flex items-center gap-1 shadow"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
