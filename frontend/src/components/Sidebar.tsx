import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  MessageSquare, 
  UserCircle, 
  AlertCircle, 
  PlusCircle 
} from 'lucide-react';
import type { PageId } from '../types.ts';

interface NavItemProps {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: (id: PageId) => void;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon, active, onClick, badge }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative ${
      active 
        ? 'bg-white text-accent-blue font-bold shadow-sm border border-slate-100' 
        : 'text-slate-500 hover:text-primary hover:bg-white/50'
    }`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-blue rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"></div>
    )}
    <span className={`w-4 h-4 ${active ? 'text-accent-blue' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </span>
    <span className="font-sans text-[13px] tracking-tight flex-1 text-left">
      {label}
    </span>
    {badge && (
      <span className="bg-accent-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </button>
);

interface SidebarProps {
  activePage: PageId;
  onPageChange: (id: PageId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const navItems = [
    { id: 'manager' as PageId, label: 'Manager View', icon: <LayoutDashboard size={16} /> },
    { id: 'meetings' as PageId, label: 'All Meetings', icon: <Users size={16} /> },
    { id: 'tasks' as PageId, label: 'Task Board', icon: <CheckSquare size={16} /> },
    { id: 'decisions' as PageId, label: 'Decision Log', icon: <MessageSquare size={16} /> },
    { id: 'speakers' as PageId, label: 'Speaker Map', icon: <UserCircle size={16} /> },
    { id: 'stale' as PageId, label: 'Stale Tasks', icon: <AlertCircle size={16} />, badge: 3 },
    { id: 'ingest' as PageId, label: 'New Meeting', icon: <PlusCircle size={16} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-slate-50/50 border-r border-slate-200/60 flex flex-col p-5 z-50">
      <div className="mb-10 px-1">
        <h1 className="font-serif text-2xl text-primary leading-none font-bold">MeetSync</h1>
        <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1.5">Enterprise Intelligent Data</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            active={activePage === item.id}
            onClick={onPageChange}
            badge={item.badge}
          />
        ))}
      </nav>

      <div className="mt-auto pt-5 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center font-sans font-bold text-xs text-primary border border-slate-100">
            SS
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-bold text-primary truncate">Suman S.</p>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
