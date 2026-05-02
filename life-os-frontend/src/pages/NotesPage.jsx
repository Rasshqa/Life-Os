import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Pencil, 
  Trash2, 
  X, 
  Tag, 
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

const emptyForm = { topic: '', content: '', tags: '' };

function ConfirmDeleteModal({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center relative">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">{t('delete_note')}?</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">{t('confirm_delete_note')}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors">{t('cancel')}</button>
          <button onClick={onConfirm} className="flex-1 py-3 text-sm font-bold bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 hover:-translate-y-0.5 transition-all">{t('confirm_delete_btn')}</button>
        </div>
      </div>
    </div>
  );
}

function NoteModal({ note, onClose, onSave }) {
  const { authFetch, addToast } = useApp();
  const { t } = useTranslation();
  const [form, setForm] = useState(note
    ? { topic: note.topic, content: note.content, tags: note.tags || '' }
    : emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); 
    setError(''); 
    setLoading(true);
    try {
      const res = await authFetch(note ? `/api/notes/${note.id}` : '/api/notes', {
        method: note ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save note.'); return; }
      onSave(data.data || data);
      addToast(note ? 'Note Updated' : 'Note Saved', 'success');
    } catch { 
      setError('Network error.');
      addToast('Network error occurred.', 'error');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {note ? t('note_modal_title_edit') : t('note_modal_title_new')}
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
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('topic')}</label>
            <input 
              name="topic" 
              required 
              value={form.topic} 
              onChange={handleChange} 
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus-ring" 
              placeholder="e.g., React Context API Patterns" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('content')}</label>
            <textarea 
              name="content" 
              required 
              value={form.content} 
              onChange={handleChange} 
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus-ring min-h-[200px] font-mono text-sm leading-relaxed" 
              placeholder="Write your notes here..." 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tags')}</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                name="tags" 
                value={form.tags} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus-ring" 
                placeholder="react, patterns, frontend (comma separated)" 
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (note ? t('update_note') : t('save_note'))}
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

function NoteCard({ note, onEdit, onDelete }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              {note.topic}
            </h3>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(note); }} 
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
              title={t('edit_note')}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} 
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
              title={t('delete_note')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className={`relative ${expanded ? '' : 'max-h-[120px] overflow-hidden'}`}>
          <p className="text-sm text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
            {note.content}
          </p>
          {!expanded && note.content.length > 200 && (
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {note.content.length > 200 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> {t('show_less')}</> : <><ChevronDown className="w-3 h-3" /> {t('read_more')}</>}
          </button>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Calendar className="w-3 h-3" />
        {new Date(note.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { authFetch, addToast } = useApp();
  const { t } = useTranslation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [search, setSearch] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await authFetch('/api/notes');
      const data = await res.json();
      setNotes(data.data || data || []);
    } catch { 
      addToast('Failed to load notes.', 'error');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = (saved) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === saved.id);
      return exists ? prev.map(n => n.id === saved.id ? saved : n) : [saved, ...prev];
    });
    setShowModal(false); 
    setEditingNote(null);
  };

  const executeDelete = async () => {
    if (!noteToDelete) return;
    try {
      const res = await authFetch(`/api/notes/${noteToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteToDelete));
        addToast('Note deleted successfully.', 'success');
      } else {
        addToast('Failed to delete note.', 'error');
      }
    } catch {
      addToast('Network error occurred.', 'error');
    } finally {
      setNoteToDelete(null);
    }
  };

  const handleEdit = (note) => { setEditingNote(note); setShowModal(true); };

  const filtered = notes.filter(n =>
    n.topic.toLowerCase().includes(search.toLowerCase()) ||
    (n.tags || '').toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('study_notes')}</h1>
          <p className="text-slate-500 text-sm">{t('study_notes_desc')}</p>
        </div>
        <button 
          onClick={() => { setEditingNote(null); setShowModal(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('create_note')}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 focus-ring placeholder:text-slate-400 shadow-sm"
          placeholder={t('search_notes')} 
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">{t('loading_notes')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 space-y-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-slate-200" />
          </div>
          <div className="max-w-xs mx-auto">
            <p className="text-slate-900 font-bold">{t('no_notes_found')}</p>
            <p className="text-slate-400 text-sm mt-1">
              {search ? t('adjust_search') : t('empty_notes')}
            </p>
          </div>
          {!search && (
            <button 
              onClick={() => setShowModal(true)}
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              {t('create_first_note')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(note => (
            <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={(id) => setNoteToDelete(id)} />
          ))}
        </div>
      )}

      {(showModal || editingNote) && (
        <NoteModal
          note={editingNote}
          onClose={() => { setShowModal(false); setEditingNote(null); }}
          onSave={handleSave}
        />
      )}

      {noteToDelete && (
        <ConfirmDeleteModal 
          onConfirm={executeDelete} 
          onCancel={() => setNoteToDelete(null)} 
        />
      )}
    </div>
  );
}
