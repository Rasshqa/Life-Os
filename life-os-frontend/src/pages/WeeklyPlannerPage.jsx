import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
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

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TaskCard({ task, dragListeners, dragAttributes, isOverlay }) {
  return (
    <div className={`bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3 group ${isOverlay ? 'shadow-2xl ring-2 ring-blue-500 scale-105' : 'shadow-sm'}`}>
      <div 
        {...dragListeners} 
        {...dragAttributes}
        className="mt-1 w-5 h-5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 cursor-grab hover:bg-slate-100 hover:text-slate-500 transition-colors"
      >
        <GripVertical className="w-3 h-3" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{task.title}</h3>
        <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
          task.priority === 'High' ? 'text-rose-500' :
          task.priority === 'Medium' ? 'text-amber-500' : 'text-slate-400'
        }`}>{task.priority}</p>
      </div>
    </div>
  );
}

function SortableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard task={task} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  );
}

function DroppableColumn({ id, title, tasks }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={`bg-white rounded-3xl border ${isOver ? 'border-blue-400 bg-blue-50/20' : 'border-slate-100'} p-5 flex flex-col transition-colors`}>
       <h3 className="text-sm font-black text-slate-900 mb-4">{t(title)}</h3>
       
       <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
         <div ref={setNodeRef} className={`flex-1 rounded-2xl p-2 min-h-[150px] space-y-3 ${tasks.length === 0 ? 'border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center' : ''}`}>
            {tasks.length === 0 ? (
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('drop_here')}</span>
            ) : (
              tasks.map(task => <SortableTaskCard key={task.id} task={task} />)
            )}
         </div>
       </SortableContext>
    </div>
  );
}

function DroppableBacklog({ id, tasks }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="xl:col-span-1 space-y-4">
      <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-slate-400" />
        {t('task_backlog')}
      </h2>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`p-4 rounded-3xl min-h-[500px] border transition-colors space-y-3 ${isOver ? 'bg-blue-50/20 border-blue-400' : 'bg-slate-50 border-slate-100'}`}>
           {tasks.map(task => <SortableTaskCard key={task.id} task={task} />)}
           {tasks.length === 0 && (
             <div className="h-full w-full flex items-center justify-center">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center mt-20">{t('no_tasks_backlog')}</span>
             </div>
           )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function WeeklyPlannerPage() {
  const { t } = useTranslation();
  const { authFetch, addToast } = useApp();
  const [tasks, setTasks] = useState([]);
  const [activeDragTask, setActiveDragTask] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    authFetch('/api/tasks').then(res => res.json()).then(data => setTasks(data.data || data || []));
  }, []);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDragTask(tasks.find(t => t.id === active.id));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveDragTask(null);
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    let newScheduledDay = activeTask.scheduled_day;

    if (over.id === 'backlog') {
      newScheduledDay = null;
    } else if (days.includes(over.id)) {
      newScheduledDay = over.id;
    } else {
      // Dropped over another task
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newScheduledDay = overTask.scheduled_day;
      }
    }

    if (activeTask.scheduled_day !== newScheduledDay) {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, scheduled_day: newScheduledDay } : t));
      
      try {
        const res = await authFetch(`/api/tasks/${active.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...activeTask, scheduled_day: newScheduledDay })
        });
        const data = await res.json();
        if (res.ok) {
          setTasks(prev => prev.map(t => t.id === active.id ? (data.data || data) : t));
        } else {
          setTasks(prev => prev.map(t => t.id === active.id ? activeTask : t)); // revert
          addToast(data.message || 'Failed to schedule task.', 'error');
        }
      } catch {
        setTasks(prev => prev.map(t => t.id === active.id ? activeTask : t)); // revert
        addToast('Network error.', 'error');
      }
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const backlogTasks = activeTasks.filter(t => !t.scheduled_day);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('schedule')}</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('weekly_planner_title')}</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">{t('weekly_planner_desc')}</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          <DroppableBacklog id="backlog" tasks={backlogTasks} />

          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {days.map(day => (
                <DroppableColumn 
                  key={day} 
                  id={day} 
                  title={day} 
                  tasks={activeTasks.filter(t => t.scheduled_day === day)} 
                />
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeDragTask ? <TaskCard task={activeDragTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
