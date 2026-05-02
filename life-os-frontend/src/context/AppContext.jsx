import { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  // SECURITY NOTE: Storing the Sanctum Bearer token in localStorage leaves the application 
  // vulnerable to Cross-Site Scripting (XSS) attacks. For production environments, it is 
  // strongly recommended to migrate to Laravel Sanctum's SPA Authentication using HttpOnly cookies.
  const [token, setToken] = useState(localStorage.getItem('life_os_token') || null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [preferences, setPreferences] = useState(
    JSON.parse(localStorage.getItem('life_os_prefs')) || {
      mode: 'Spacious',
      defaultPriority: 'Medium',
    }
  );

  const updatePreferences = (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('life_os_prefs', JSON.stringify(updated));
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('life_os_token', userToken);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      } catch { /* silent */ }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('life_os_token');
  };

  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  };

  return (
    <AppContext.Provider value={{ user, token, loading, login, logout, updateUser, authFetch, addToast, preferences, updatePreferences }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`flex items-start gap-3 p-4 w-80 rounded-2xl shadow-xl border ${
              toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' :
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
              'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              {toast.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /> :
               toast.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> :
               <Info className="w-5 h-5 mt-0.5 shrink-0" />}
              <p className="text-sm font-semibold flex-1 leading-snug">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
