import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  BookOpen, 
  Repeat, 
  LogOut, 
  User,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/',         labelKey: 'overview',       icon: LayoutDashboard },
  { to: '/tasks',    labelKey: 'task_board',     icon: CheckCircle2 },
  { to: '/planner',  labelKey: 'weekly_planner', icon: Calendar },
  { to: '/notes',    labelKey: 'notes_vault',    icon: BookOpen },
  { to: '/habits',   labelKey: 'growth_habit',   icon: Repeat },
];

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl text-slate-600"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full px-4 py-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 rotate-3">
              <span className="text-white text-xl font-extrabold -rotate-3 tracking-tighter">L</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-slate-900 leading-none">LifeOS</span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">v2.0 Premium</span>
            </div>
          </div>

          {/* Search Bar - Aesthetic only */}
          <div className="px-2 mb-8">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder={t('search_placeholder')}
                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('main_navigation')}</p>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/50 shadow-sm shadow-blue-50/50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                    <span>{t(item.labelKey)}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto space-y-4">
            <div className="p-4 bg-slate-50 rounded-3xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{t('pro_member')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 text-slate-400">
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:text-blue-500 transition-colors"><Settings className="w-4 h-4" /></button>
              <button className="p-2 hover:text-blue-500 transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              <div className="text-[10px] font-bold uppercase tracking-tighter opacity-50 px-2">LifeOS 2026</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
}
