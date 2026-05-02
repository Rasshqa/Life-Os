import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import CommandPalette from './CommandPalette';
import { Loader2 } from 'lucide-react';

// Spinner with a more premium feel
function Spinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-50 rounded-full" />
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
      </div>
      <p className="mt-6 text-slate-400 font-semibold tracking-widest text-xs uppercase animate-pulse">
        System Initializing
      </p>
    </div>
  );
}

// Wraps all authenticated pages with a Sidebar Layout
export function AppLayout() {
  const { user, loading } = useApp();
  
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex min-h-screen bg-[#fbfcfd]">
      {/* Sidebar Navigation */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 transition-all duration-300 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 animate-premium">
          <Outlet />
        </div>
      </main>

      <CommandPalette />
    </div>
  );
}

// Redirects logged-in users away from auth pages
export function GuestLayout() {
  const { user, loading } = useApp();
  
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  
  return (
    <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center px-4">
      <Outlet />
    </div>
  );
}
