import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { LayoutDashboard, CheckSquare, Calendar, BookOpen, Activity, LogOut, Search, Plus, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, updatePreferences, preferences } = useApp();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" 
        onClick={() => setOpen(false)}
      />
      
      {/* Command Palette */}
      <Command 
        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        label="Global Command Menu"
      >
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <Command.Input 
            autoFocus 
            placeholder="Type a command or search..." 
            className="w-full bg-transparent py-5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-3 bg-slate-50 px-2 py-1 rounded-md shrink-0">ESC to close</div>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-hide">
          <Command.Empty className="py-6 text-center text-sm font-medium text-slate-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-3 text-xs font-black uppercase tracking-widest text-slate-400">
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 aria-selected:bg-blue-50 aria-selected:text-blue-600 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/tasks'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 aria-selected:bg-blue-50 aria-selected:text-blue-600 transition-colors"
            >
              <CheckSquare className="w-4 h-4" /> Go to Task Board
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/planner'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 aria-selected:bg-blue-50 aria-selected:text-blue-600 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Go to Weekly Planner
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/notes'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 aria-selected:bg-blue-50 aria-selected:text-blue-600 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Go to Notes Vault
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => navigate('/habits'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 aria-selected:bg-blue-50 aria-selected:text-blue-600 transition-colors"
            >
              <Activity className="w-4 h-4" /> Go to Growth Habits
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Quick Actions" className="px-2 py-3 text-xs font-black uppercase tracking-widest text-slate-400">
            <Command.Item 
              onSelect={() => runCommand(() => {
                navigate('/tasks');
              })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 aria-selected:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create New Task
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => {
                const isSpacious = !preferences?.mode || preferences?.mode === 'Spacious';
                updatePreferences({ mode: isSpacious ? 'Compact' : 'Spacious' });
              })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-slate-600 aria-selected:bg-slate-100 transition-colors"
            >
              <Settings className="w-4 h-4" /> Toggle Interface Density (Current: {preferences?.mode || 'Spacious'})
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Account" className="px-2 py-3 text-xs font-black uppercase tracking-widest text-slate-400">
            <Command.Item 
              onSelect={() => runCommand(async () => {
                await logout();
                navigate('/login');
              })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-rose-600 aria-selected:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
