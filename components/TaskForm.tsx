
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Edit Task' : 'New Task'}
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            placeholder="e.g., Design the landing page"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
            placeholder="What needs to be done?"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initialData ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
