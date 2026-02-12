
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import Button from './Button';

interface TaskFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
  initialData?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, description);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {initialData ? 'Refine Task' : 'Capture New Task'}
          </h2>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-900 dark:text-slate-100 font-medium placeholder-slate-400"
              placeholder="What needs doing?"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="desc" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Details (Optional)</label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-400 leading-relaxed"
              placeholder="Context or steps..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">
              Discard
            </Button>
            <Button variant="primary" type="submit" className="flex-1">
              {initialData ? 'Update Task' : 'Add to List'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
