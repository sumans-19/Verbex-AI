import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Task } from '../types.ts';
import { 
  Info,
  ExternalLink
} from 'lucide-react';

const TaskCard = ({ task, index }: { task: Task, index: number }) => (
  <div className={`corporate-card p-5 interactive-hover mb-4 stagger-${(index % 5) + 1} group`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
        }`}></span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          {task.priority}-PRIORITY
        </span>
      </div>
      <div className="flex -space-x-2">
        <div className={`w-7 h-7 rounded-full border-2 border-white ${task.assignee_color} flex items-center justify-center text-[10px] font-bold shadow-sm text-primary`}>
          {task.assignee_initials}
        </div>
      </div>
    </div>
    
    <h4 className="font-bold text-[15px] text-primary mb-2 leading-snug group-hover:text-accent-blue transition-colors">
      {task.title}
    </h4>
    <p className="text-slate-500 text-[13px] line-clamp-2 mb-4 leading-relaxed font-medium">
      {task.description}
    </p>

    {task.is_ambiguous && (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-slate-600 mb-1.5">
          <Info size={14} className="text-accent-blue" />
          <span className="text-[11px] font-bold uppercase tracking-tight">Contextual Uncertainty</span>
        </div>
        <p className="text-[11px] text-slate-500 italic leading-relaxed">
          "{task.transcript_quote}"
        </p>
      </div>
    )}

    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${task.confidence >= 0.75 ? 'bg-emerald-500' : task.confidence >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`} 
            style={{ width: `${task.confidence * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-slate-400">{(task.confidence * 100).toFixed(0)}%</span>
      </div>
      <button className="text-slate-300 hover:text-accent-blue transition-colors">
        <ExternalLink size={14} />
      </button>
    </div>
  </div>
);

const TaskBoard: React.FC = () => {
  const { data: tasks } = useFetch<Task[]>('/tasks');

  const autoPushed = tasks?.filter(t => t.confidence >= 0.75) || [];
  const needsReview = tasks?.filter(t => t.confidence >= 0.5 && t.confidence < 0.75) || [];
  const discarded = tasks?.filter(t => t.confidence < 0.5) || [];

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="glass-panel p-6 mb-10 flex items-center justify-between relative overflow-hidden bg-primary/95 text-white border-none shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-[10px] font-bold uppercase tracking-widest rounded border border-accent-blue/30">
              AI Summary
            </span>
            <h2 className="font-serif text-2xl font-bold">Executive TL;DR</h2>
          </div>
          <p className="text-slate-300 text-[15px] font-medium max-w-2xl leading-relaxed">
            Sprint cycle 14 focus remains on architectural migration. 8 new tasks identified with 92% average confidence. Two ambiguous items in frontend backlog require immediate stakeholder clarification.
          </p>
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <h3 className="font-serif text-lg font-bold text-primary italic">Confidence Gate 1</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Auto-Pushed</span>
          </div>
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 min-h-[600px] shadow-xs">
            {autoPushed.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <h3 className="font-serif text-lg font-bold text-primary italic">Confidence Gate 2</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Needs Review</span>
          </div>
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 min-h-[600px] shadow-xs">
            {needsReview.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <h3 className="font-serif text-lg font-bold text-primary italic">Confidence Gate 3</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Discarded</span>
          </div>
          <div className="glass-panel p-4 min-h-[600px] border-none">
            {discarded.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
