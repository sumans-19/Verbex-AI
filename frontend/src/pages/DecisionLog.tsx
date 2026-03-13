import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Decision } from '../types.ts';
import { Quote, AlertCircle, CheckCircle2, MoreVertical, ShieldCheck, History } from 'lucide-react';

const DecisionCard = ({ decision, index }: { decision: Decision, index: number }) => {
  return (
    <div className={`corporate-card p-6 stagger-${(index % 5) + 1} flex gap-8 relative group`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${decision.contradicts_decision_id ? 'bg-rose-500' : 'bg-accent-blue'}`}></div>
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">
            REF-DEC-{decision.id.toString().padStart(4, '0')}
          </p>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <p className="text-slate-500 text-[11px] font-semibold">{decision.date_time}</p>
        </div>

        <h3 className="font-serif text-xl font-bold text-primary mb-3 leading-snug">
          {decision.title}
        </h3>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 relative">
          <Quote size={24} className="text-slate-200 absolute -top-2 -left-2 rotate-12" />
          <p className="text-slate-600 text-[13px] italic font-medium leading-relaxed relative z-10 pr-4">
            {decision.transcript_quote}
          </p>
        </div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-[12px] font-bold text-primary uppercase tracking-tight">Decided By</span>
            <span className="text-[12px] font-medium text-slate-500">{decision.decided_by}</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
             <span className="text-[12px] font-bold text-primary uppercase tracking-tight">Meeting</span>
             <span className="text-[12px] font-medium text-accent-blue hover:underline cursor-pointer">{decision.meeting_name}</span>
          </div>
        </div>
      </div>

      <div className="w-64 border-l border-slate-100 pl-6 flex flex-col justify-center">
        {decision.contradicts_decision_id ? (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle size={14} />
              <span className="text-[11px] font-bold uppercase">Contradiction Found</span>
            </div>
            <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
              This decision reverses a previous outcome. Manual reconciliation required.
            </p>
            <button className="text-[10px] font-bold text-rose-600 hover:underline uppercase">View Conflict</button>
          </div>
        ) : (
          <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 space-y-2 opacity-50">
            <div className="flex items-center gap-2 text-emerald-600">
              <ShieldCheck size={14} />
              <span className="text-[11px] font-bold uppercase">Audit Verified</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Consistent with previous meeting architecture goals.</p>
          </div>
        )}
      </div>

      <button className="absolute top-4 right-4 p-2 text-slate-300 hover:text-primary transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
  );
};

const DecisionLog: React.FC = () => {
  const { data: decisions } = useFetch<Decision[]>('/decisions');
  const [viewMode, setViewMode] = useState<'chronological' | 'conflicts'>('chronological');

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button 
            onClick={() => setViewMode('chronological')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'chronological' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
            }`}
          >
            <History size={16} />
            Master Log
          </button>
          <button 
            onClick={() => setViewMode('conflicts')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'conflicts' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <AlertCircle size={16} />
            Conflict Detection
          </button>
        </div>
        
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mr-2">Audit Status: SECURE</span>
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
              ))}
            </div>
        </div>
      </div>

      <div className="space-y-6">
        {decisions?.map((decision, i) => (
          <DecisionCard key={decision.id} decision={decision} index={i} />
        ))}
      </div>
    </div>
  );
};

export default DecisionLog;
