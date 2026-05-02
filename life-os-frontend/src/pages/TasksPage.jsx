import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Pencil,
  X,
  Filter,
  Layers,
  ChevronRight,
  GripVertical,
  Zap,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In-Progress', 'Done'];

const priorityThemes = {
  High: 'text-rose-600 bg-rose-50 border-rose-100',
  Medium: 'text-amber-600 bg-amber-50 border-amber-100',
  Low: 'text-emerald-600 bg-emerald-50 border-emerald-100'
};

const statusThemes = {
  Pending: 'bg-slate-100 text-slate-500 border-slate-200',
  'In-Progress': 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100',
  Done: 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
};

// ... ConfirmDeleteModal and TaskModal remain similar but use i18n if possible
// To save space and ensure correctness, I'll focus on the core request
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center relative">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Abort Mission?</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">This operational data will be permanently purged. Proceed with caution.</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 text-sm font-bold bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 hover:-translate-y-0.5 transition-all">Confirm Abort</button>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? {
    title: task.title, 
    description: task.description || '',
    deadline_date: task.deadline_date || '', 
    priority: task.priority, 
    status: task.status,
  } : { title: '', description: '', deadline_date: '', priority: 'Medium', status: 'Pending' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { authFetch, addToast } = useApp();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); 
    setError(''); 
    setLoading(true);
    try {
      const res = await authFetch(task ? `/api/tasks/${task.id}` : '/api/tasks', {
        method: task ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save mission.'); return; }
      onSave(data.data || data);
      addToast(task ? 'Mission Updated' : 'Mission Initiated', 'success');
    } catch { 
      setError('Communication link failure.'); 
      addToast('Network error occurred.', 'error');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {task ? 'Update Mission' : 'New Operational Mission'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Planning</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Objective</label>
            <input 
              name="title" 
              required 
              value={form.title} 
              onChange={handleChange} 
              className="premium-input" 
              placeholder="Primary objective title..." 
              disabled={task?.status === 'Done'}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context & Intel</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              className="premium-input min-h-[120px] resize-none" 
              placeholder="Additional operational details..." 
              disabled={task?.status === 'Done'}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
              <input 
                name="deadline_date" 
                type="date" 
                value={form.deadline_date} 
                onChange={handleChange} 
                className="premium-input" 
                disabled={task?.status === 'Done'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
              <select 
                name="priority" 
                value={form.priority} 
                onChange={handleChange} 
                className="premium-input appearance-none"
                disabled={task?.status === 'Done'}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading || task?.status === 'Done'} 
              className="flex-1 btn-premium-blue h-14 text-sm"
            >
              {loading ? 'Processing...' : (task ? 'Update Intel' : 'Initiate Mission')}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 h-14 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, dragListeners, dragAttributes, isOverlay }) {
  const [showOptions, setShowOptions] = useState(false);
  const isDone = task.status === 'Done';

  return (
    <motion.div 
      layout={!isOverlay}
      layoutId={!isOverlay ? `task-${task.id}` : undefined}
      initial={!isOverlay ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={!isOverlay ? { opacity: isDone ? 0.5 : 1, y: 0, scale: 1 } : false}
      exit={!isOverlay ? { opacity: 0, scale: 0.9, y: -20 } : false}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`premium-card p-6 relative group overflow-visible ${isDone ? 'grayscale-[0.2]' : ''} ${isOverlay ? 'shadow-2xl ring-2 ring-blue-500 scale-105' : ''}`}
    >
      {/* Priority Indicator */}
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${
        isDone ? 'bg-emerald-400' :
        task.priority === 'High' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 
        task.priority === 'Medium' ? 'bg-amber-400' : 'bg-slate-200'
      }`} />
      
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className={`font-bold text-slate-900 leading-snug flex-1 transition-all duration-500 ${isDone ? 'opacity-50 line-through' : 'group-hover:text-blue-600'}`}>
          {task.title}
        </h3>
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            disabled={isDone}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showOptions && !isDone && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => { onEdit(task); setShowOptions(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-4 h-4 text-blue-500" />
                Edit Mission
              </button>
              <button 
                onClick={() => { onDelete(task.id); setShowOptions(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Abort Mission
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className={`text-xs text-slate-500 mb-6 line-clamp-3 leading-relaxed font-medium transition-all duration-500 ${isDone ? 'opacity-40' : ''}`}>
          {task.description}
        </p>
      )}

      <div className={`flex flex-wrap items-center gap-2 mb-6 transition-all duration-500 ${isDone ? 'opacity-50' : ''}`}>
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${priorityThemes[task.priority]}`}>
          {task.priority}
        </span>
        {task.deadline_date && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em]">
            <Calendar className="w-3 h-3" />
            {task.deadline_date}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-slate-50">
        <div className="flex items-center gap-1">
          {isDone ? (
            <button
              onClick={() => onStatusChange(task, 'Pending', true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reopen
            </button>
          ) : (
            STATUSES.map(s => (
              <button 
                key={s} 
                onClick={() => onStatusChange(task, s)}
                title={`Transition to ${s}`}
                className={`p-2 rounded-xl transition-all duration-300 ${task.status === s
                  ? statusThemes[s]
                  : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {s === 'Pending' && <Clock className="w-4 h-4" />}
                {s === 'In-Progress' && <Zap className="w-4 h-4 fill-current" />}
                {s === 'Done' && <CheckCircle2 className="w-4 h-4" />}
              </button>
            ))
          )}
        </div>
        <div 
          {...dragListeners} 
          {...dragAttributes}
          className={`w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center transition-colors ${isDone ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 cursor-grab hover:text-slate-500 hover:bg-slate-100'}`}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

function SortableTaskCard(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: props.task.id,
    disabled: props.task.status === 'Done'
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard {...props} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
}

function Column({ col, handleEdit, setTaskToDelete, handleStatusChange }) {
  const { setNodeRef } = useDroppable({ id: col.status });

  return (
    <div className="space-y-6 group/col flex flex-col">
      <div className="flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${col.bg}`}>
            <col.icon className={`w-4 h-4 ${col.color}`} />
          </div>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{col.status}</h2>
          <div className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded-lg shadow-lg shadow-slate-200">
            {col.items.length}
          </div>
        </div>
      </div>
      
      <SortableContext items={col.items.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-6 min-h-[400px] flex-1 rounded-[2.5rem] p-1 transition-colors group-hover/col:bg-slate-50/50">
          <AnimatePresence mode="popLayout">
            {col.items.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] py-20 text-center"
              >
                <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Clear Sector</p>
              </motion.div>
            ) : (
              col.items.map(task => (
                <SortableTaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={handleEdit} 
                  onDelete={setTaskToDelete} 
                  onStatusChange={handleStatusChange} 
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </SortableContext>
    </div>
  );
}

export default function TasksPage() {
  const { authFetch, addToast } = useApp();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [filter, setFilter] = useState('All');
  const [activeDragTask, setActiveDragTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTasks = async () => {
    try {
      const res = await authFetch('/api/tasks');
      const data = await res.json();
      setTasks(data.data || data || []);
    } catch {
      addToast('Failed to load missions.', 'error');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSave = (savedTask) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === savedTask.id);
      return exists ? prev.map(t => t.id === savedTask.id ? savedTask : t) : [savedTask, ...prev];
    });
    setShowModal(false); 
    setEditingTask(null);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await authFetch(`/api/tasks/${taskToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskToDelete));
        addToast('Mission successfully aborted.', 'success');
      } else {
        addToast('Failed to abort mission.', 'error');
      }
    } catch {
      addToast('Network error occurred.', 'error');
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleStatusChange = async (task, newStatus, reopen = false) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    try {
      const res = await authFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...task, status: newStatus, reopen }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === task.id ? (data.data || data) : t));
        if (reopen) addToast('Mission reopened!', 'success');
      } else {
        // Revert on fail
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        addToast(data.message || 'Failed to update status.', 'error');
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      addToast('Network error occurred.', 'error');
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDragTask(tasks.find(t => t.id === active.id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragTask(null);
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask || activeTask.status === 'Done') return; // Cannot drag Done items

    let newStatus = activeTask.status;

    if (STATUSES.includes(over.id)) {
      newStatus = over.id;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus) {
      handleStatusChange(activeTask, newStatus);
    }
  };

  const handleEdit = (task) => { setEditingTask(task); setShowModal(true); };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);
  const columns = STATUSES.map(s => ({ 
    status: s, 
    items: filtered.filter(t => t.status === s),
    icon: s === 'Pending' ? Clock : s === 'In-Progress' ? Zap : CheckCircle2,
    color: s === 'Pending' ? 'text-slate-400' : s === 'In-Progress' ? 'text-blue-600' : 'text-emerald-500',
    bg: s === 'Pending' ? 'bg-slate-50' : s === 'In-Progress' ? 'bg-blue-50' : 'bg-emerald-50'
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('operational_intelligence') || 'Operational Intelligence'}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('command_center') || 'Command Center'}</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">{t('manage_operations') || 'Manage your strategic operations and tactical goals.'}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="pl-11 pr-10 py-3 bg-white border border-slate-100 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-slate-600 shadow-xl shadow-slate-100/50 appearance-none focus:ring-4 focus:ring-blue-500/5 outline-none cursor-pointer hover:border-blue-100 transition-all"
            >
              <option value="All">{t('all_operations') || 'All Operations'}</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none rotate-90" />
          </div>
          <button 
            onClick={() => { setEditingTask(null); setShowModal(true); }} 
            className="btn-premium-blue h-12 flex items-center gap-2 shadow-xl shadow-blue-100"
          >
            <Plus className="w-5 h-5" />
            <span className="uppercase tracking-widest text-[10px] font-black">{t('initiate_ops') || 'Initiate Ops'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3 px-4 pb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-200 animate-pulse" />
                <div className="w-24 h-4 rounded-md bg-slate-200 animate-pulse" />
              </div>
              <div className="h-48 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse shadow-sm" />
              <div className="h-48 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse shadow-sm opacity-50" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {columns.map(col => (
              <Column 
                key={col.status} 
                col={col} 
                handleEdit={handleEdit} 
                setTaskToDelete={setTaskToDelete} 
                handleStatusChange={handleStatusChange} 
              />
            ))}
          </div>
          <DragOverlay>
            {activeDragTask ? (
              <TaskCard task={activeDragTask} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {(showModal || editingTask) && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSave}
        />
      )}

      {taskToDelete && (
        <ConfirmDeleteModal 
          onConfirm={executeDelete} 
          onCancel={() => setTaskToDelete(null)} 
        />
      )}
    </motion.div>
  );
}
