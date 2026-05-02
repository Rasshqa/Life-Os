import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  BookOpen, 
  Repeat, 
  ArrowUpRight, 
  TrendingUp, 
  Calendar,
  Clock,
  Plus,
  Zap,
  Target,
  Award
} from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, authFetch } = useApp();
  const [stats, setStats] = useState({ tasks: 0, notes: 0, habits: 0, doneTasks: 0, inProgress: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [tasksRes, notesRes, habitsRes] = await Promise.all([
          authFetch('/api/tasks'),
          authFetch('/api/notes'),
          authFetch('/api/habits'),
        ]);
        const [tasksData, notesData, habitsData] = await Promise.all([
          tasksRes.json(), notesRes.json(), habitsRes.json(),
        ]);
        
        const tasks = tasksData.data || tasksData || [];
        const notes = notesData.data || notesData || [];
        const habits = habitsData.data || habitsData || [];
        
        setStats({
          tasks: tasks.length,
          notes: notes.length,
          habits: habits.length,
          doneTasks: tasks.filter(t => t.status === 'Done').length,
          inProgress: tasks.filter(t => t.status === 'In-Progress').length,
        });
        setRecentTasks(tasks.slice(0, 4));
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    loadStats();
  }, []);

  const completionRate = stats.tasks ? Math.round((stats.doneTasks/stats.tasks)*100) : 0;

  return (
    <div className="space-y-10">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">{t('efficiency_engine_active')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {t('fuel_your_focus')} <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {user?.name || 'Visionary'}
              </span>
            </h1>
            <p className="text-slate-400 max-w-md text-sm md:text-base font-medium">
              {t('completed_stats', { rate: completionRate })}
            </p>
          </div>

          <div className="flex gap-4">
            <Link 
              to="/tasks" 
              className="group flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t('new_mission')}</span>
            </Link>
            <div className="flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-blue-600 shadow-xl shadow-blue-200">
              <span className="text-3xl font-black text-white mb-1">{stats.tasks - stats.doneTasks}</span>
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">{t('open_ops')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Active</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{t('weekly_habits')}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{stats.habits}</span>
              <span className="text-xs font-bold text-slate-400">{t('routines')}</span>
            </div>
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Vault</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{t('knowledge_base')}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{stats.notes}</span>
              <span className="text-xs font-bold text-slate-400">{t('documents')}</span>
            </div>
          </div>
        </div>

        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">Impact</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{t('completion_score')}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{completionRate}%</span>
              <div className="flex items-center text-emerald-500 text-[10px] font-bold">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Analytics Chart */}
      <div className="premium-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-purple-500 rounded-full" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('mission_status_overview')}</h2>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <BarChart 
              data={[
                { name: 'Pending', count: stats.tasks - stats.doneTasks - (stats.inProgress || 0), color: '#94a3b8' },
                { name: 'In-Progress', count: stats.inProgress || 0, color: '#3b82f6' },
                { name: 'Done', count: stats.doneTasks, color: '#10b981' }
              ]} 
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#cbd5e1' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                itemStyle={{ fontWeight: 700 }}
              />
              <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                {/* Dynamically coloring each bar based on the payload color */}
                {
                  [
                    { name: 'Pending', color: '#94a3b8' },
                    { name: 'In-Progress', color: '#3b82f6' },
                    { name: 'Done', color: '#10b981' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Missions Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('active_missions')}</h2>
            </div>
            <Link to="/tasks" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group">
              {t('command_center')} <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="h-40 bg-white rounded-[2rem] border border-slate-100 animate-pulse flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">{t('syncing_data')}</div>
            ) : recentTasks.length === 0 ? (
              <div className="p-12 text-center premium-card bg-slate-50 border-none shadow-none">
                <CheckCircle2 className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('no_active_missions')}</p>
              </div>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="premium-card p-5 group flex items-center gap-5 hover:bg-slate-50/50">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    task.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 
                    task.status === 'In-Progress' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {task.status === 'Done' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-slate-900 truncate mb-1 ${task.status === 'Done' ? 'line-through opacity-40' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.deadline_date || 'Future Ops'}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                        task.priority === 'High' ? 'text-red-500 bg-red-50' : 'text-slate-400 bg-slate-100'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Growth Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1 h-6 bg-indigo-600 rounded-full" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('growth_learning')}</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Link to="/habits" className="premium-card p-6 bg-gradient-to-br from-white to-amber-50/30 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                  <Repeat className="w-6 h-6" />
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-amber-100 text-amber-600 text-xs font-black">
                  {stats.habits}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{t('consistency_tracker')}</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                {t('consistency_desc', { count: stats.habits })}
              </p>
            </Link>

            <Link to="/notes" className="premium-card p-6 bg-gradient-to-br from-white to-blue-50/30 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-blue-100 text-blue-600 text-xs font-black">
                  {stats.notes}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{t('knowledge_archive')}</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                {t('knowledge_desc', { count: stats.notes })}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
