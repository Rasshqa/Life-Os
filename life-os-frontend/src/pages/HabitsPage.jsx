import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Repeat, 
  Pencil, 
  Trash2, 
  X, 
  Flame, 
  CheckCircle2, 
  Trophy, 
  TrendingUp,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

function ConfirmDeleteModal({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center relative">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">{t('delete_routine')}?</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">{t('confirm_delete_routine')}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors">{t('cancel')}</button>
          <button onClick={onConfirm} className="flex-1 py-3 text-sm font-bold bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 hover:-translate-y-0.5 transition-all">{t('confirm_delete_btn')}</button>
        </div>
      </div>
    </div>
  );
}

function HabitModal({ habit, onClose, onSave }) {
  const { authFetch, addToast } = useApp();
  const { t } = useTranslation();
  const [form, setForm] = useState(habit
    ? { name: habit.name, streak_count: habit.streak_count, last_completed_date: habit.last_completed_date || '' }
    : { name: '', streak_count: 0, last_completed_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); 
    setError(''); 
    setLoading(true);
    try {
      const res = await authFetch(habit ? `/api/habits/${habit.id}` : '/api/habits', {
        method: habit ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, streak_count: parseInt(form.streak_count) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save habit.'); return; }
      onSave(data.data || data);
      addToast(habit ? 'Routine Updated' : 'Routine Created', 'success');
    } catch { 
      setError('Network error.');
      addToast('Network error occurred.', 'error');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {habit ? t('habit_modal_title_edit') : t('habit_modal_title_new')}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">{t('habit_name')}</label>
            <input 
              name="name" 
              required 
              value={form.name} 
              onChange={handleChange} 
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus-ring" 
              placeholder="e.g. Morning Run, Reading, Meditation" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">{t('initial_streak')}</label>
              <input 
                name="streak_count" 
                type="number" 
                min="0" 
                value={form.streak_count} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus-ring" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">{t('last_done')}</label>
              <input 
                name="last_completed_date" 
                type="date" 
                max={new Date().toISOString().split('T')[0]}
                value={form.last_completed_date} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus-ring text-sm" 
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (habit ? t('update_routine') : t('start_routine'))}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StreakBar({ count }) {
  const max = Math.max(count, 30);
  const pct = Math.min((count / max) * 100, 100);
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-amber-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
    </div>
  );
}

function HabitCard({ habit, onEdit, onDelete, onCheckIn }) {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const checkedToday = habit.last_completed_date === today;

  const handleCheckIn = async () => {
    setChecking(true);
    await onCheckIn(habit);
    setChecking(false);
  };

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group ${
      checkedToday ? 'border-amber-200' : 'border-slate-200'
    }`}>
      {checkedToday && (
        <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-amber-50 rounded-full flex items-center justify-center pt-8 pr-8">
          <Flame className="w-8 h-8 text-amber-400 opacity-20" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors ${checkedToday ? 'bg-amber-100' : 'bg-slate-100'}`}>
            <Repeat className={`w-5 h-5 ${checkedToday ? 'text-amber-600' : 'text-slate-500'}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              {habit.name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {habit.streak_count >= 30 ? t('legendary_streak') : t('daily_routine')}
            </p>
          </div>
        </div>
        <div className="flex gap-1 relative z-10">
          <button 
            onClick={() => onEdit(habit)} 
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onDelete(habit.id)} 
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-end justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('current_streak')}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 tracking-tighter">{habit.streak_count}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">{t('days')}</span>
          </div>
        </div>
        <StreakBar count={habit.streak_count} />
      </div>

      <button 
        onClick={handleCheckIn} 
        disabled={checkedToday || checking}
        className={`w-full py-3 rounded-xl font-bold text-sm tracking-tight transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
          checkedToday 
            ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default' 
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
        }`}
      >
        {checking ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : checkedToday ? (
          <><CheckCircle2 className="w-4 h-4" /> {t('streak_maintained')}</>
        ) : (
          <><Flame className="w-4 h-4" /> {t('mark_completed')}</>
        )}
      </button>
    </div>
  );
}

export default function HabitsPage() {
  const { authFetch, addToast } = useApp();
  const { t } = useTranslation();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);

  const fetchHabits = async () => {
    try {
      const res = await authFetch('/api/habits');
      const data = await res.json();
      setHabits(data.data || data || []);
    } catch { 
      addToast('Failed to load habits.', 'error');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHabits(); }, []);

  const handleSave = (saved) => {
    setHabits(prev => {
      const exists = prev.find(h => h.id === saved.id);
      return exists ? prev.map(h => h.id === saved.id ? saved : h) : [saved, ...prev];
    });
    setShowModal(false); 
    setEditingHabit(null);
  };

  const executeDelete = async () => {
    if (!habitToDelete) return;
    try {
      const res = await authFetch(`/api/habits/${habitToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setHabits(prev => prev.filter(h => h.id !== habitToDelete));
        addToast('Routine successfully deleted.', 'success');
      } else {
        addToast('Failed to delete routine.', 'error');
      }
    } catch {
      addToast('Network error occurred.', 'error');
    } finally {
      setHabitToDelete(null);
    }
  };

  const handleEdit = (habit) => { setEditingHabit(habit); setShowModal(true); };

  const handleCheckIn = async (habit) => {
    const today = new Date().toISOString().split('T')[0];
    const newStreak = (habit.last_completed_date === today) ? habit.streak_count : habit.streak_count + 1;
    try {
      const res = await authFetch(`/api/habits/${habit.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: habit.name, streak_count: newStreak, last_completed_date: today }),
      });
      const data = await res.json();
      if (res.ok) {
        setHabits(prev => prev.map(h => h.id === habit.id ? (data.data || data) : h));
        addToast('Check-in successful! Keep it up.', 'success');
      } else {
        addToast('Failed to check in.', 'error');
      }
    } catch {
      addToast('Network error occurred.', 'error');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.last_completed_date === today).length;
  const totalStreak = habits.reduce((acc, h) => acc + h.streak_count, 0);

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('habit_tracker')}</h1>
          <p className="text-slate-500 text-sm">{t('habit_tracker_desc')}</p>
        </div>
        <button 
          onClick={() => { setEditingHabit(null); setShowModal(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('new_routine')}
        </button>
      </div>

      {/* Summary Row */}
      {!loading && habits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('done_today')}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{completedToday} / {habits.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('total_streaks')}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalStreak} {t('days')}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('persistence')}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{habits.length > 0 ? Math.round((completedToday/habits.length)*100) : 0}%</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">{t('syncing_routines')}</p>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-24 space-y-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Repeat className="w-8 h-8 text-slate-200" />
          </div>
          <div className="max-w-xs mx-auto">
            <p className="text-slate-900 font-bold">{t('no_routines')}</p>
            <p className="text-slate-400 text-sm mt-1">{t('empty_routines_desc')}</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            {t('create_first_routine')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onEdit={handleEdit} 
              onDelete={(id) => setHabitToDelete(id)} 
              onCheckIn={handleCheckIn} 
            />
          ))}
        </div>
      )}

      {showModal && (
        <HabitModal
          habit={editingHabit}
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
          onSave={handleSave}
        />
      )}

      {habitToDelete && (
        <ConfirmDeleteModal 
          onConfirm={executeDelete} 
          onCancel={() => setHabitToDelete(null)} 
        />
      )}
    </div>
  );
}
