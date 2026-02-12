
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

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('lumina-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lumina-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

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
    if (window.confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
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
    switch (filter) {
      case FilterType.COMPLETED:
        return tasks.filter(t => t.status === TaskStatus.COMPLETED);
      case FilterType.PENDING:
        return tasks.filter(t => t.status === TaskStatus.PENDING);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    pending: tasks.filter(t => t.status === TaskStatus.PENDING).length
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header Section */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lumina</h1>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
            { label: 'Done', value: stats.completed, color: 'text-emerald-600' }
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border p-4 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {Object.values(FilterType).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Task Form Modal-ish */}
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

        {/* Task List */}
        <div className="space-y-3">
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
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-gray-500 font-medium">No tasks found</h3>
              <p className="text-gray-400 text-sm mt-1">
                {filter === FilterType.ALL ? "Ready to start something new?" : `No ${filter.toLowerCase()} tasks.`}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button 
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
