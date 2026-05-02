import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login, addToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || 'Authentication failed. Check access codes.', 'error');
      } else {
        login(data.user, data.token);
        addToast('Authentication successful.', 'success');
        navigate('/');
      }
    } catch {
      addToast('Signal lost. Ensure backend relay is operational.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto animate-premium flex flex-col items-center py-12 md:py-20">
      <div className="mb-8 text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-6 group hover:rotate-0 transition-transform duration-500">
            <Zap className="w-10 h-10 text-white -rotate-6 group-hover:rotate-0 transition-transform duration-500 fill-white" />
          </div>
          <div className="absolute -top-2 -right-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl border border-slate-700">Premium</div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">LifeOS <span className="text-blue-600">Secure</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-3">Authorization Required</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 md:p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400/10 blur-3xl rounded-full pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-7">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Access Email</label>
            <div className="relative group">
              <div className="absolute left-1.5 top-1.5 bottom-1.5 w-12 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 group-focus-within:border-blue-500 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-all z-10">
                <Mail className="w-5 h-5" />
              </div>
              <input
                name="email" 
                type="email" 
                required
                value={form.email} 
                onChange={handleChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3 h-16 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-inner"
                placeholder="name@agency.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Security Key</label>
            <div className="relative group">
              <div className="absolute left-1.5 top-1.5 bottom-1.5 w-12 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 group-focus-within:border-blue-500 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-all z-10">
                <Lock className="w-5 h-5" />
              </div>
              <input
                name="password" 
                type="password" 
                required
                value={form.password} 
                onChange={handleChange}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3 h-16 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full relative group h-16 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-3 overflow-hidden transition-all hover:shadow-[0_10px_40px_-10px_rgba(15,23,42,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>

        <div className="relative z-10 mt-10 pt-8 border-t border-slate-100/50 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            New operative?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors decoration-2 underline-offset-4 hover:underline">
              Initialize Account
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">LifeOS Strategic Dynamics © 2026</p>
    </div>
  );
}
