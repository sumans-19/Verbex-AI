import React from 'react';
import type { PageId } from '../types.ts';
import { Bell, Search, Settings } from 'lucide-react';

interface TopbarProps {
  activePage: PageId;
}

const pageTitles: Record<PageId, string> = {
  manager: 'Manager View',
  meetings: 'All Meetings',
  tasks: 'Task Board',
  decisions: 'Decision Log',
  speakers: 'Speaker Map',
  stale: 'Stale Tasks',
  ingest: 'New Meeting',
};

const Topbar: React.FC<TopbarProps> = ({ activePage }) => {
  return (
    <header className="fixed top-0 right-0 left-inherit h-[60px] bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-40 transition-all duration-300" style={{ left: 'var(--sidebar-width, 240px)' }}>
      <h2 className="font-serif text-xl font-bold text-primary">{pageTitles[activePage]}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-teal transition-colors" />
          <input 
            type="text" 
            placeholder="Search Intelligence..."
            className="bg-slate-50/50 border border-slate-200 rounded py-1.5 pl-9 pr-4 text-[13px] text-primary focus:outline-none focus:border-accent-teal/40 focus:bg-white focus:ring-4 focus:ring-accent-teal/5 w-[320px] transition-all"
          />
        </div>
        
        <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
          <button className="p-2 text-slate-500 hover:text-accent-blue transition-colors relative">
            <Bell size={19} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-slate-500 hover:text-accent-blue transition-colors">
            <Settings size={19} />
          </button>
        </div>
        
        <button className="bg-accent-teal text-white px-5 py-2 rounded text-[13px] font-semibold hover:bg-accent-pine transition-all shadow-sm">
          Export Report
        </button>
      </div>
    </header>
  );
};

export default Topbar;
