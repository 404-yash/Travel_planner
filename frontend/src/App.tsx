import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Loader2 } from 'lucide-react';

const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const TripPage = lazy(() => import('./pages/TripPage').then(m => ({ default: m.TripPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const SpotTrainPage = lazy(() => import('./pages/SpotTrainPage').then(m => ({ default: m.SpotTrainPage })));

const PageSkeleton: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    <span className="text-xs font-semibold">Loading experience...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<SearchPage />} />
                <Route path="/spot" element={<SpotTrainPage />} />
                <Route path="/trip/:id" element={<TripPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                <strong>JOURNEY</strong> — Plan any trip, one booking • Demo timetable dataset
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <Link to="/about" className="hover:text-brand-700 transition">
                  Architecture &amp; OOP Patterns
                </Link>
                <span>•</span>
                <span className="text-slate-400">Pure Java Engine + React</span>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
