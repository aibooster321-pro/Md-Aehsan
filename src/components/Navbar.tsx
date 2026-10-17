import React from 'react';
import { GraduationCap, ShieldCheck, Building2, PlusCircle, Search, Home } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'submit' | 'track' | 'admin' | 'aktu';
  setCurrentTab: (tab: 'home' | 'submit' | 'track' | 'admin' | 'aktu') => void;
  isAdminLoggedIn: boolean;
  isAktuLoggedIn: boolean;
  onAdminSignOut?: () => void;
  onAktuSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdminLoggedIn,
  isAktuLoggedIn,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center space-x-2 sm:space-x-3 text-left group focus:outline-hidden shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:bg-blue-900 transition-colors shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-slate-900 text-sm sm:text-lg tracking-tight whitespace-nowrap">
                  GNIOT Campus
                </span>
                <span className="font-bold text-blue-600 text-sm sm:text-lg">
                  Care
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Greater Noida Institute of Technology • AKTU Affiliated
              </p>
            </div>
          </button>

          {/* Center Navigation - Desktop Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setCurrentTab('submit')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'submit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Inquiry</span>
            </button>
            <button
              onClick={() => setCurrentTab('track')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'track'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Status</span>
            </button>
          </nav>

          {/* Right Portals Access */}
          <div className="flex items-center space-x-2">
            <button
              data-testid="nav-admin-portal"
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentTab === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Portal</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              data-testid="nav-aktu-portal"
              onClick={() => setCurrentTab('aktu')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentTab === 'aktu'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50/70 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
              <span>AKTU Portal</span>
              {isAktuLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              currentTab === 'home'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('submit')}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              currentTab === 'submit'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submit Inquiry
          </button>
          <button
            onClick={() => setCurrentTab('track')}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              currentTab === 'track'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Track Status
          </button>
        </div>
      </div>
    </header>
  );
};
