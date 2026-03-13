import React from 'react';
import { useFetch } from '../hooks/useFetch';
import type { Meeting } from '../types.ts';
import { ArrowUpRight, ArrowDownRight, Users, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';

const StatCard = ({ label, value, delta, index }: { label: string, value: string | number, delta: string, index: number }) => (
  <div className={`glass-panel p-5 stagger-${(index % 5) + 1} relative group overflow-hidden`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2.5 relative z-10">{label}</p>
    <div className="flex items-end justify-between relative z-10">
      <h3 className="font-serif text-3xl font-bold text-primary tracking-tight">{String(value)}</h3>
      <div className={`flex items-center text-[12px] font-bold px-2 py-0.5 rounded-lg ${
        delta.startsWith('+') || delta.toLowerCase() === 'critical' ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'
      }`}>
        {delta.startsWith('+') ? <ArrowUpRight size={14} className="mr-0.5" /> : delta.toLowerCase() === 'critical' ? <AlertTriangle size={12} className="mr-1" /> : <ArrowDownRight size={14} className="mr-0.5" />}
        {delta}
      </div>
    </div>
  </div>
);

const ManagerView: React.FC = () => {
  const { data: stats } = useFetch<any>('/dashboard/stats');
  const { data: recentMeetings } = useFetch<Meeting[]>('/meetings?limit=5');

  const statItems = [
    { label: 'Total Meetings', value: stats?.meetings?.value || '0', delta: stats?.meetings?.delta || '0' },
    { label: 'Tasks Created', value: stats?.tasks?.value || '0', delta: stats?.tasks?.delta || '0' },
    { label: 'Decisions Logged', value: stats?.decisions?.value || '0', delta: stats?.decisions?.delta || '0' },
    { label: 'Stale Tasks', value: stats?.stale_tasks?.value || '0', delta: stats?.stale_tasks?.delta || '0' },
    { label: 'Avg Confidence', value: stats?.confidence?.value || '0%', delta: stats?.confidence?.delta || '0' },
  ];

  return (
    <div className="page p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
        {statItems.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="corporate-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-primary">Recent Meeting Intelligence</h3>
              <button className="text-accent-blue text-sm font-semibold hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {recentMeetings?.map((meeting) => (
                <div key={meeting.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-accent-blue transition-colors">
                    <Users size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary text-[15px]">{meeting.title}</h4>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">{meeting.date_time} • {meeting.host}</p>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tasks</p>
                      <p className="text-[14px] font-bold text-primary">{meeting.tasks_count}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Decisions</p>
                      <p className="text-[14px] font-bold text-primary">{meeting.decisions_count}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-slate-100 p-0.5 ml-2">
                       <div className="w-full h-full rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[11px] font-bold">
                         {meeting.health_score}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="corporate-card p-6 bg-primary text-white border-none shadow-premium">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <h3 className="font-serif text-xl font-bold mb-4">Team Performance</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">Execution confidence is up by 12% this week. Two decisions are pending review.</p>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium">Auto-push success</span>
                 </div>
                 <span className="font-bold">92%</span>
               </div>
               <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                 <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-accent-blue" />
                    <span className="text-sm font-medium">Feedback loops</span>
                 </div>
                 <span className="font-bold">14</span>
               </div>
               <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                 <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-sm font-medium">Critical staleness</span>
                 </div>
                 <span className="font-bold text-amber-400">3</span>
               </div>
            </div>
          </div>

          <div className="corporate-card p-6">
             <h3 className="font-serif text-lg font-bold text-primary mb-5 relative">Ownership Map</h3>
             <div className="space-y-5">
               {[
                 { name: 'Alex River', role: 'Frontend Eng', load: 85, color: 'bg-accent-blue' },
                 { name: 'Sam Chen', role: 'Backend Eng', load: 60, color: 'bg-emerald-500' },
                 { name: 'Jordan Poe', role: 'Product Manager', load: 45, color: 'bg-purple-500' },
                 { name: 'Casey Smith', role: 'Designer', load: 30, color: 'bg-rose-500' },
               ].map(person => (
                 <div key={person.name}>
                   <div className="flex justify-between items-end mb-1.5">
                     <div>
                       <p className="text-[13px] font-bold text-primary leading-none">{person.name}</p>
                       <p className="text-[10px] text-slate-400 font-medium mt-0.5">{person.role}</p>
                     </div>
                     <span className="text-[11px] font-bold text-primary">{person.load}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className={`h-full ${person.color}`} style={{ width: `${person.load}%` }}></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerView;
