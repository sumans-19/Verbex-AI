import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Meeting } from '../types.ts';
import { Filter, Calendar, User, Clock, ChevronRight } from 'lucide-react';

const AllMeetings: React.FC<{ onMeetingClick: (id: number) => void }> = ({ onMeetingClick }) => {
  const { data: meetings, loading } = useFetch<Meeting[]>('/meetings');
  const [filter, setFilter] = useState('all');

  const filterChips = [
    { id: 'all', label: 'All History' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'product', label: 'Product' },
    { id: 'design', label: 'Design' },
    { id: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-200 border ${
                filter === chip.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-xs">
            <Filter size={14} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-xs">
            <Calendar size={14} />
            Date Range
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-accent-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          meetings?.map((meeting, i) => (
            <div 
              key={meeting.id} 
              onClick={() => onMeetingClick(meeting.id)}
              className={`corporate-card p-6 interactive-hover flex flex-col md:flex-row md:items-center gap-6 stagger-${(i % 5) + 1} group`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    meeting.status === 'processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {meeting.status}
                  </span>
                  <p className="text-slate-400 text-[12px] font-semibold font-mono tracking-tight flex items-center gap-1.5">
                    <Clock size={12} />
                    {meeting.date_time}
                  </p>
                </div>
                <h3 className="font-serif text-xl font-bold text-primary group-hover:text-accent-blue transition-colors">{meeting.title}</h3>
                <div className="flex items-center gap-4 mt-3">
                  <p className="text-slate-500 text-sm flex items-center gap-1.5">
                    <User size={14} className="text-slate-300" />
                    Hosted by <span className="text-primary font-semibold">{meeting.host}</span>
                  </p>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <p className="text-slate-500 text-sm">{meeting.attendee_count} attendees</p>
                </div>
              </div>

              <div className="flex items-center gap-8 px-8 border-x border-slate-100 py-2">
                <div className="text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Items</p>
                  <p className="text-lg font-bold text-primary">{meeting.tasks_count + meeting.decisions_count}</p>
                </div>
                <div className="text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Health</p>
                  <p className={`text-lg font-bold ${meeting.health_score > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{meeting.health_score}</p>
                </div>
                {meeting.stale_count > 0 && (
                  <div className="text-center min-w-[60px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stale</p>
                    <p className="text-lg font-bold text-rose-500">{meeting.stale_count}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 md:w-64 justify-end">
                {['Sprint Planning', 'Critical', 'Q1-2026'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-md uppercase tracking-tight">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-slate-300 group-hover:text-accent-blue transition-colors ml-4 hidden md:block">
                <ChevronRight size={20} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllMeetings;
