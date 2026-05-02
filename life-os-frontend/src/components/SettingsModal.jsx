import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Settings as SettingsIcon, AlertTriangle, LogOut, Trash2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModal({ onClose }) {
  const { user, updateUser, logout, authFetch, addToast, preferences, updatePreferences } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { t, i18n } = useTranslation();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Danger Zone State
  const [deleting, setDeleting] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await authFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        addToast('Profile updated successfully!', 'success');
      } else {
        addToast(data.message || 'Failed to update profile.', 'error');
      }
    } catch {
      addToast('Network error while updating profile.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone and will delete all your tasks, notes, and habits.')) {
      return;
    }
    setDeleting(true);
    try {
      const res = await authFetch('/api/user/account', { method: 'DELETE' });
      if (res.ok) {
        await logout();
        navigate('/login');
        addToast('Account deleted permanently.', 'info');
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to delete account.', 'error');
        setDeleting(false);
      }
    } catch {
      addToast('Network error while deleting account.', 'error');
      setDeleting(false);
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('life_os_lang', lang);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end animate-in fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      {/* Slide-over Drawer */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('settings')}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex px-6 pt-4 gap-6 border-b border-slate-100 text-sm font-semibold">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <User className="w-4 h-4" /> {t('profile')}
          </button>
          <button 
            onClick={() => setActiveTab('preferences')} 
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'preferences' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <SettingsIcon className="w-4 h-4" /> {t('preferences')}
          </button>
          <button 
            onClick={() => setActiveTab('account')} 
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'account' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <AlertTriangle className="w-4 h-4" /> {t('account')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus-ring"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loadingProfile}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-2"
                    >
                      {loadingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Globe className="w-4 h-4" /> {t('language')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => changeLanguage('en')}
                        className={`p-3 rounded-xl border text-center transition-all font-bold text-sm ${i18n.language === 'en' ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        {t('english')}
                      </button>
                      <button 
                        onClick={() => changeLanguage('id')}
                        className={`p-3 rounded-xl border text-center transition-all font-bold text-sm ${i18n.language === 'id' ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        {t('indonesian')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('interface_density')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => updatePreferences({ mode: 'Spacious' })}
                        className={`p-4 rounded-xl border text-left transition-all ${preferences.mode === 'Spacious' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="font-bold text-slate-900 text-sm mb-1">{t('spacious')}</div>
                        <div className="text-xs text-slate-500">More padding, relaxed feel</div>
                      </button>
                      <button 
                        onClick={() => updatePreferences({ mode: 'Compact' })}
                        className={`p-4 rounded-xl border text-left transition-all ${preferences.mode === 'Compact' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="font-bold text-slate-900 text-sm mb-1">{t('compact')}</div>
                        <div className="text-xs text-slate-500">Denser layout, less scrolling</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('default_priority')}</label>
                    <div className="flex gap-3">
                      {['Low', 'Medium', 'High'].map(p => (
                        <button
                          key={p}
                          onClick={() => updatePreferences({ defaultPriority: p })}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                            preferences.defaultPriority === p 
                              ? 'border-blue-600 bg-blue-50 text-blue-700' 
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{t('sign_out')}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Log out of your current session</div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50">
                    <div className="flex items-center gap-2 text-rose-600 font-bold mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      {t('danger_zone')}
                    </div>
                    <p className="text-xs text-rose-600/80 font-medium mb-4 leading-relaxed">
                      Deleting your account will permanently erase all your tasks, notes, habits, and profile data. This cannot be undone.
                    </p>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="w-full flex justify-center items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting ? 'Deleting...' : t('delete_account')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
