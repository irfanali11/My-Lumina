
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import Button from './Button';
import { enhanceTaskDescription } from '../services/geminiService';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onUpdate: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onDelete, onEdit, onUpdate }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeAction, setActiveAction] = useState<'enhance' | 'magic' | null>(null);
  const [proposedDescription, setProposedDescription] = useState<string | null>(null);

  const handleAIAction = async () => {
    if (isEnhancing || !!proposedDescription) return;
    setIsEnhancing(true);
    setActiveAction('enhance');
    const enhanced = await enhanceTaskDescription(task.title, task.description);
    onUpdate({ ...task, description: enhanced });
    setIsEnhancing(false);
    setActiveAction(null);
  };

  const handleMagicWand = async () => {
    if (isEnhancing || !!proposedDescription) return;
    setIsEnhancing(true);
    setActiveAction('magic');
    const enhanced = await enhanceTaskDescription(task.title, task.description);
    setProposedDescription(enhanced);
    setIsEnhancing(false);
    setActiveAction(null);
  };

  const handleAcceptProposal = () => {
    if (proposedDescription) {
      onUpdate({ ...task, description: proposedDescription });
      setProposedDescription(null);
    }
  };

  const handleRejectProposal = () => {
    setProposedDescription(null);
  };

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isBlocked = isEnhancing || !!proposedDescription;

  return (
    <div 
      className={`group bg-white rounded-xl border transition-all duration-300 p-4 shadow-sm hover:shadow-md ${
        isCompleted ? 'bg-gray-50/50 grayscale-[0.5]' : ''
      } ${
        proposedDescription ? 'border-indigo-300 ring-4 ring-indigo-50 bg-indigo-50/10' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <button 
          onClick={() => !isBlocked && onToggleStatus(task.id)}
          disabled={isBlocked}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted 
              ? 'bg-indigo-600 border-indigo-600 shadow-sm' 
              : isBlocked 
                ? 'border-gray-200 cursor-not-allowed bg-gray-50'
                : 'border-gray-300 hover:border-indigo-500 hover:scale-105'
          }`}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`font-semibold text-gray-900 transition-all ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>
            <div className={`flex transition-opacity duration-200 ${isBlocked ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(task)}
                title="Edit task"
                disabled={isBlocked}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(task.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                title="Delete task"
                disabled={isBlocked}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
          
          <p className={`mt-1 text-sm transition-colors ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.description || "No description provided."}
          </p>

          {/* AI Enhancement Proposal UI */}
          {proposedDescription && (
            <div className="mt-4 p-4 bg-white border border-indigo-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">AI Suggestion</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed italic font-medium">"{proposedDescription}"</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={handleAcceptProposal}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow active:scale-95"
                    title="Accept suggestion"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={handleRejectProposal}
                    className="p-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
                    title="Discard suggestion"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAIAction}
              disabled={isBlocked}
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                isBlocked && activeAction !== 'enhance'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95'
              }`}
            >
              {isEnhancing && activeAction === 'enhance' ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying...
                </>
              ) : (
                <>✨ Quick Enhance</>
              )}
            </button>
            
            <button
              onClick={handleMagicWand}
              disabled={isBlocked}
              className={`p-1.5 rounded-full transition-all ${
                isBlocked && activeAction !== 'magic'
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-60'
                  : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100 active:scale-95'
              }`}
              title="Magic Wand: Preview AI Enhancement"
            >
              <svg className={`w-4 h-4 ${isEnhancing && activeAction === 'magic' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 001.414 1.96l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 001.414 1.96l2.387.477a2 2 0 001.96-1.414l.477-2.387z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 3.5l1.5 1.5M10.5 3.5l-1.5 1.5M10.5 3.5V1.5M3.5 10.5l1.5 1.5M3.5 10.5l-1.5 1.5M3.5 10.5H1.5M20.5 10.5l-1.5 1.5M20.5 10.5l1.5 1.5M20.5 10.5h2M10.5 20.5l1.5-1.5M10.5 20.5l-1.5-1.5M10.5 20.5v2" />
              </svg>
            </button>

            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium ml-auto">
              Added {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
