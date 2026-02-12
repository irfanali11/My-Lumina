
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, FilterType } from './types';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Button from './components/Button';

const App: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Persistence & Initial Theme
  useEffect(() => {
    const saved = localStorage.getItem('lumina-tasks');
    const savedTheme = localStorage.getItem('lumina-theme');
    
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(initialDarkMode);
    if (initialDarkMode) document.documentElement.classList.add('dark');
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lumina-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('lumina-theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  // Actions
  const handleAddOrEditTask = (title: string, description: string) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id ? { ...t, title, description } : t
      ));
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description,
        status: TaskStatus.PENDING,
        createdAt: Date.now(),
        tags: []
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED } : t
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Derived State
  const filteredTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
    switch (filter) {
      case FilterType.COMPLETED: return sorted.filter(t => t.status === TaskStatus.COMPLETED);
      case FilterType.PENDING: return sorted.filter(t => t.status === TaskStatus.PENDING);
      default: return sorted;
    }
  }, [tasks, filter]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    pending: tasks.filter(t => t.status === TaskStatus.PENDING).length
  };

  return (
    <div className="min-h-screen transition-colors duration-500 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/30 dark:bg-violet-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header Section */}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform cursor-pointer">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">Lumina</h1>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Focus Workspace</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all active:scale-90"
              title="Toggle Light/Dark Mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              className="hidden sm:inline-flex"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-12 pb-24">
        {/* Welcome Text */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Stay sharp.</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your day with AI-assisted productivity.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {[
            { label: 'Created', value: stats.total, color: 'text-slate-900 dark:text-slate-100' },
            { label: 'Pending', value: stats.pending, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Resolved', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' }
          ].map(stat => (
            <div key={stat.label} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-center hover:shadow-lg transition-all duration-500">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide animate-in fade-in duration-1000">
          {Object.values(FilterType).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap border-2 ${
                filter === f 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-800'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Task Form Modal */}
        {isFormOpen && (
          <TaskForm 
            onSubmit={handleAddOrEditTask} 
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTask(null);
            }}
            initialData={editingTask}
          />
        )}

        {/* Task List Container */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
                onEdit={startEdit}
                onUpdate={handleUpdateTask}
              />
            ))
          ) : (
            <div className="text-center py-24 bg-white/40 dark:bg-slate-900/40 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-slate-600 dark:text-slate-300 font-bold text-lg">Clean slate.</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                {filter === FilterType.ALL 
                  ? "Your agenda is wide open. Add a task to start building momentum." 
                  : `There are no ${filter.toLowerCase()} items at the moment.`}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-6">
        <button 
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="w-full h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/50 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700 border-t border-indigo-500/30"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-bold tracking-tight">Capture Task</span>
        </button>
      </div>
    </div>
  );
};

export default App;
