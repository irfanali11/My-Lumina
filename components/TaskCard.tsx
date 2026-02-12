
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import Button from './Button';
import { enhanceTaskDescription, suggestSubtasks } from '../services/geminiService';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onUpdate: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onDelete, onEdit, onUpdate }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [activeAction, setActiveAction] = useState<'enhance' | 'magic' | 'suggest' | null>(null);
  const [proposedDescription, setProposedDescription] = useState<string | null>(null);
  const [suggestedSteps, setSuggestedSteps] = useState<string[] | null>(null);

  const handleAIAction = async () => {
    if (isEnhancing || isSuggesting || !!proposedDescription) return;
    setIsEnhancing(true);
    setActiveAction('enhance');
    const enhanced = await enhanceTaskDescription(task.title, task.description);
    onUpdate({ ...task, description: enhanced });
    setIsEnhancing(false);
    setActiveAction(null);
  };

  const handleMagicWand = async () => {
    if (isEnhancing || isSuggesting || !!proposedDescription) return;
    setIsEnhancing(true);
    setActiveAction('magic');
    const enhanced = await enhanceTaskDescription(task.title, task.description);
    setProposedDescription(enhanced);
    setIsEnhancing(false);
    setActiveAction(null);
  };

  const handleSuggestSteps = async () => {
    if (isEnhancing || isSuggesting) return;
    if (suggestedSteps) {
      setSuggestedSteps(null);
      return;
    }
    setIsSuggesting(true);
    setActiveAction('suggest');
    const steps = await suggestSubtasks(task.title);
    setSuggestedSteps(steps);
    setIsSuggesting(false);
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
  const isBlocked = isEnhancing || isSuggesting || !!proposedDescription;

  return (
    <div 
      className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        isCompleted ? 'border-transparent bg-slate-50 dark:bg-slate-900/50' : 'border-slate-200 dark:border-slate-800'
      } ${
        proposedDescription ? 'border-indigo-400 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Animated Checkbox */}
        <button 
          onClick={() => !isBlocked && onToggleStatus(task.id)}
          disabled={isBlocked}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
            isCompleted 
              ? 'bg-indigo-600 border-indigo-600 rotate-[360deg]' 
              : isBlocked 
                ? 'border-slate-200 dark:border-slate-800 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:scale-110'
          }`}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-white animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`font-bold text-slate-900 dark:text-slate-100 transition-all duration-300 truncate ${isCompleted ? 'opacity-40 line-through' : ''}`}>
              {task.title}
            </h3>
            <div className={`flex items-center gap-1 transition-opacity duration-300 ${isBlocked ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(task)}
                className="p-1 rounded-lg h-8 w-8"
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
                className="p-1 rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={isBlocked}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </div>
          
          <p className={`mt-1 text-sm leading-relaxed transition-all duration-300 ${isCompleted ? 'opacity-40' : 'text-slate-600 dark:text-slate-400'}`}>
            {task.description || "Add a description to guide your work."}
          </p>

          {/* AI Enhancement Proposal UI */}
          {proposedDescription && (
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">AI Suggestion</span>
                  </div>
                  <p className="text-sm text-indigo-900 dark:text-indigo-100 italic font-medium leading-relaxed">"{proposedDescription}"</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button 
                    onClick={handleAcceptProposal}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                    title="Accept suggestion"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={handleRejectProposal}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
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

          {/* Suggested Subtasks UI */}
          {suggestedSteps && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-amber-100 dark:bg-amber-900/40 rounded">
                    <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.992-.883l.847-7.4a1 1 0 00-.992-1.117H8.816a1 1 0 00-.992 1.117l.847 7.4a1 1 0 00.992.883z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block">AI Blueprint</span>
                </div>
                <button 
                  onClick={() => setSuggestedSteps(null)}
                  className="text-amber-400 hover:text-amber-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="space-y-2">
                {suggestedSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-amber-900/80 dark:text-amber-100/70 font-medium group/step">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0 transition-transform group-hover/step:scale-125"></span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={handleAIAction}
              disabled={isBlocked}
              className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                isBlocked && activeAction !== 'enhance'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 active:scale-95'
              }`}
            >
              {isEnhancing && activeAction === 'enhance' ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </>
              ) : (
                <>✨ Enhance</>
              )}
            </button>
            
            <button
              onClick={handleMagicWand}
              disabled={isBlocked}
              className={`p-1.5 rounded-lg transition-all ${
                isBlocked && activeAction !== 'magic'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                  : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 active:scale-95'
              }`}
              title="Magic Wand: Preview AI Enhancement"
            >
              <svg className={`w-4 h-4 ${isEnhancing && activeAction === 'magic' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 001.414 1.96l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 001.414 1.96l2.387.477a2 2 0 001.96-1.414l.477-2.387z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 3.5l1.5 1.5M10.5 3.5l-1.5 1.5M10.5 3.5V1.5M3.5 10.5l1.5 1.5M3.5 10.5l-1.5 1.5M3.5 10.5H1.5M20.5 10.5l-1.5 1.5M20.5 10.5l1.5 1.5M20.5 10.5h2M10.5 20.5l1.5-1.5M10.5 20.5l-1.5-1.5M10.5 20.5v2" />
              </svg>
            </button>

            <button
              onClick={handleSuggestSteps}
              disabled={isBlocked && activeAction !== 'suggest'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
                isSuggesting && activeAction === 'suggest'
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : suggestedSteps 
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                    : isBlocked
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95'
              }`}
              title="Plan Steps: Get AI-suggested subtasks"
            >
              {isSuggesting && activeAction === 'suggest' ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Planning
                </>
              ) : (
                <>💡 {suggestedSteps ? 'Hide' : 'Plan'}</>
              )}
            </button>

            <span className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-bold ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
