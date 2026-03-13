import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { api } from '../utils/api';
import type { Meeting } from '../types.ts';
import { Filter, Calendar, User, Clock, ChevronRight, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

const AllMeetings: React.FC<{ onMeetingClick: (id: number) => void }> = ({ onMeetingClick }) => {
  const { data: meetings, loading, mutate } = useFetch<Meeting[]>('/meetings');
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await api.delete(`/meetings/${id}`);
      setDeleteConfirm(null);
      mutate();
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      alert('Failed to delete meeting');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
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
        {loading && !meetings ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-accent-teal rounded-full animate-spin"></div>
          </div>
        ) : (
          meetings?.map((meeting, i) => (
            <div 
              key={meeting.id} 
              onClick={() => onMeetingClick(meeting.id as any)}
              className={`corporate-card p-5 flex flex-col md:flex-row md:items-center gap-6 stagger-${(i % 5) + 1} group hover:border-accent-teal/30 cursor-pointer`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                    meeting.status === 'complete' ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {meeting.status}
                  </span>
                  <p className="text-slate-400 text-[12px] font-semibold font-mono tracking-tight flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(meeting.created_at).toLocaleString()}
                  </p>
                </div>
                <h3 className="text-lg font-bold text-primary group-hover:text-accent-teal transition-colors tracking-tight">{meeting.title}</h3>
                <div className="flex items-center gap-4 mt-3">
                  <p className="text-slate-500 text-sm flex items-center gap-1.5">
                    <User size={14} className="text-slate-300" />
                    Hosted by <span className="text-primary font-semibold">{meeting.host_name}</span>
                  </p>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <p className="text-slate-500 text-sm uppercase text-[11px] font-bold tracking-tight text-slate-400">
                    {meeting.input_type?.replace('_', ' ') || 'Manual'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 px-8 border-x border-slate-100 py-2">
                <div className="text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Items</p>
                  <p className="text-lg font-bold text-primary">{(meeting.task_count || 0) + (meeting.decision_count || 0)}</p>
                </div>
                <div className="text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Health</p>
                  <p className={`text-lg font-bold ${meeting.health_score && meeting.health_score > 80 ? 'text-teal-600' : 'text-amber-600'}`}>{meeting.health_score || 0}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:w-48 justify-end">
                {deleteConfirm === meeting.id ? (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <button
                      onClick={(e) => handleDelete(e, meeting.id)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-bold rounded uppercase tracking-widest hover:bg-rose-600 flex items-center gap-1.5"
                    >
                      {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Confirm
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest hover:bg-slate-200"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(meeting.id); }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="text-slate-300 group-hover:text-accent-teal group-hover:translate-x-1 transition-all ml-4 hidden md:block">
                <ChevronRight size={18} />
              </div>
            </div>
          ))
        )}
        {meetings?.length === 0 && !loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-4 corporate-card bg-slate-50/50 border-dashed">
            <AlertTriangle className="text-slate-300 underline-offset-4" size={32} strokeWidth={1} />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No meeting history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMeetings;
