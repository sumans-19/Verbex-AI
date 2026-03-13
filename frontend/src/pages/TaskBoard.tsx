import React from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Task, Meeting } from '../types.ts';
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
    </div>
    
    <h4 className="font-bold text-[14px] text-primary mb-2 leading-snug group-hover:text-accent-teal transition-colors tracking-tight">
      {task.title}
    </h4>
    {task.description && (
      <p className="text-slate-500 text-[13px] line-clamp-2 mb-4 leading-relaxed font-medium">
        {task.description}
      </p>
    )}

    {task.source_quote && (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-slate-600 mb-1.5">
          <Info size={14} className="text-accent-teal" />
          <span className="text-[11px] font-bold uppercase tracking-tight">Contextual Reference</span>
        </div>
        <p className="text-[11px] text-slate-500 italic leading-relaxed">
          "{task.source_quote}"
        </p>
        <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Assignee: {task.assignee_name || 'Unassigned'}</p>
      </div>
    )}

    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${task.confidence_score >= 0.75 ? 'bg-accent-teal' : task.confidence_score >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`}             style={{ width: `${task.confidence_score * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-slate-400">{(task.confidence_score * 100).toFixed(0)}%</span>
      </div>
      <button className="text-slate-300 hover:text-accent-teal transition-colors">
        <ExternalLink size={14} />
      </button>
    </div>
  </div>
);

const TaskBoard: React.FC = () => {
  const { data: tasks, loading } = useFetch<Task[]>('/meetings/tasks/all');
  const { data: recentMeetings } = useFetch<Meeting[]>('/meetings');

  const autoPushed = tasks?.filter(t => t.status === 'approved') || [];
  const needsReview = tasks?.filter(t => t.status === 'pending_review') || [];
  const discarded = tasks?.filter(t => t.status === 'discarded') || [];

  const latestTLDR = recentMeetings && recentMeetings.length > 0 ? recentMeetings[0].tldr : null;

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="glass-panel p-6 mb-10 flex items-center justify-between relative overflow-hidden bg-slate-900 text-white border-none shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-teal/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-accent-teal/20 text-accent-teal text-[10px] font-bold uppercase tracking-widest rounded border border-accent-teal/30">
              Latest Intel
            </span>
            <h2 className="text-xl font-bold tracking-tight uppercase tracking-[0.1em]">Strategy TL;DR</h2>
          </div>
          <p className="text-slate-400 text-[14px] font-medium max-w-2xl leading-relaxed">
            {latestTLDR || "Strategic task registry. Action items are categorized by algorithmic confidence and pending team review based on recent meeting intelligence."}
          </p>
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-teal shadow-[0_0_8px_rgba(17,94,89,0.3)]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
              <h3 className="text-base font-bold text-primary tracking-tight">Confidence Gate 1</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Pushed</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
            {loading ? <p className="p-4 text-xs font-bold text-slate-400 animate-pulse uppercase">Scanning Registry...</p> : autoPushed.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
            {!loading && autoPushed.length === 0 && <p className="p-4 text-xs italic text-slate-400 text-center uppercase">No high confidence tasks</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <h3 className="text-base font-bold text-primary tracking-tight">Confidence Gate 2</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Needs Review</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
            {loading ? <p className="p-4 text-xs font-bold text-slate-400 animate-pulse uppercase">Scanning Registry...</p> : needsReview.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
            {!loading && needsReview.length === 0 && <p className="p-4 text-xs italic text-slate-400 text-center uppercase">No pending reviews</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <h3 className="text-base font-bold text-primary tracking-tight">Confidence Gate 3</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discarded</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-4 h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
             {loading ? <p className="p-4 text-xs font-bold text-slate-400 animate-pulse uppercase">Scanning Registry...</p> : discarded.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
             {!loading && discarded.length === 0 && <p className="p-4 text-xs italic text-slate-400 text-center uppercase">Log is clean</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
