import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ general: data.message || 'Registration failed.' });
      } else {
        login(data.user, data.token);
        navigate('/');
      }
    } catch {
      setErrors({ general: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your name', icon: User },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com', icon: Mail },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'At least 8 characters', icon: Lock },
    { name: 'password_confirmation', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', icon: Lock },
  ];

  return (
    <div className="w-full max-w-[1000px] mx-auto animate-premium flex flex-col items-center py-12 md:py-20">
      <div className="mb-8 text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-6 group hover:rotate-0 transition-transform duration-500">
            <UserPlus className="w-10 h-10 text-white -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          <div className="absolute -top-2 -right-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl border border-slate-700">New</div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">LifeOS <span className="text-blue-600">Secure</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-3">Operative Registration</p>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 md:p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400/10 blur-3xl rounded-full pointer-events-none" />

        {errors.general && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 text-red-600 text-sm border border-red-100/50 flex items-center gap-3 relative z-10 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {fields.map(field => (
            <div key={field.name} className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">
                {field.label}
              </label>
              <div className="relative group">
                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-12 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 group-focus-within:border-blue-500 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-all z-10">
                  <field.icon className="w-5 h-5" />
                </div>
                <input
                  name={field.name} 
                  type={field.type} 
                  required
                  value={form[field.name]} 
                  onChange={handleChange}
                  className={`w-full bg-slate-50/50 border rounded-2xl pl-16 pr-4 py-3 h-16 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-inner ${
                    errors[field.name] ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200'
                  }`}
                  placeholder={field.placeholder}
                />
              </div>
              {errors[field.name] && (
                <p className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wide">
                  {errors[field.name][0]}
                </p>
              )}
            </div>
          ))}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full relative group h-16 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-3 overflow-hidden transition-all hover:shadow-[0_10px_40px_-10px_rgba(15,23,42,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Initializing...' : 'Create Account'}
            </span>
          </button>
        </form>

        <div className="relative z-10 mt-10 pt-8 border-t border-slate-100/50 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Already registered?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors decoration-2 underline-offset-4 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] pb-10">LifeOS Strategic Dynamics © 2026</p>
    </div>
  );
}
