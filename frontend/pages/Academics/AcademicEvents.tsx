import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { useAppStore } from '../../store';
import { UserRole } from '../../types';
import { CalendarRange, Edit3, Save, Ban } from 'lucide-react';

interface AcademicEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const AcademicEvents: React.FC = () => {
  const { currentUser } = useAppStore();
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const [isEditing, setIsEditing] = useState(false);

  // Mock data based on screenshot
  const [events, setEvents] = useState<AcademicEvent[]>([
    { id: '1', name: 'Academic session', startDate: '12/04/2025', endDate: '05/30/2026' },
    { id: '2', name: 'Course pre-registration', startDate: '12/04/2025', endDate: '01/04/2026' },
    { id: '3', name: 'Classes', startDate: '01/05/2026', endDate: '04/30/2026' },
    { id: '4', name: 'Course drop', startDate: '01/05/2026', endDate: '01/19/2026' },
    { id: '5', name: 'Midsem course feedback', startDate: '02/16/2026', endDate: '02/23/2026' },
    { id: '6', name: 'Mid sem exams', startDate: '02/25/2026', endDate: '03/03/2026' },
    { id: '7', name: 'Withdraw', startDate: '03/05/2026', endDate: '03/13/2026' },
    { id: '8', name: 'End sem exams', startDate: '05/04/2026', endDate: '05/13/2026' },
    { id: '9', name: 'Course feedback', startDate: '04/24/2026', endDate: '05/02/2026' },
    { id: '10', name: 'Grades submission', startDate: '05/04/2026', endDate: '05/19/2026' },
    { id: '11', name: 'Show feedback (midsem)', startDate: '03/06/2026', endDate: 'N/A' },
    { id: '12', name: 'Show feedback (endsem)', startDate: '05/29/2026', endDate: 'N/A' },
    { id: '13', name: 'Result Declaration', startDate: '05/29/2026', endDate: 'N/A' },
  ]);

  const handleUpdate = (id: string, field: keyof AcademicEvent, value: string) => {
    if (!isAdmin) return;
    setEvents(events.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Academic Events</h1>
          <p className="text-gray-400 text-sm">Schedule and important dates for the current academic session.</p>
        </div>
        
        {isAdmin && (
          <Button 
            variant={isEditing ? "primary" : "secondary"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Edit Schedule</>}
          </Button>
        )}
      </div>

      <Card className="p-0 overflow-hidden bg-[#18181b] border-white/10">
        <div className="p-6 border-b border-white/10 bg-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-auto flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Load for session
              </label>
              <select className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all">
                <option>2025-II : current session (2025-12-04 to 2026-05-30)</option>
                <option>2025-I : previous session</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
            <CalendarRange size={14} className="text-blue-400" />
            Events dates for academic session (I = First Semester, II = Second Semester, S=Summer): <span className="text-white font-mono">2025-II</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-bold text-white w-1/3">Event</th>
                <th className="px-6 py-4 font-bold text-white w-1/3">Start Date</th>
                <th className="px-6 py-4 font-bold text-white w-1/3">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((ev, index) => (
                <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-200">
                    {ev.name}
                  </td>
                  <td className="px-6 py-3">
                    {isEditing && isAdmin ? (
                      <Input 
                        value={ev.startDate} 
                        onChange={(e) => handleUpdate(ev.id, 'startDate', e.target.value)}
                        className="h-8 text-xs bg-black/40 border-white/10 focus:border-blue-500"
                      />
                    ) : (
                      <span className="bg-white/5 px-3 py-1.5 rounded text-gray-300 font-mono text-xs border border-white/5 inline-block min-w-[100px] text-center">
                        {ev.startDate}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {isEditing && isAdmin ? (
                       <Input 
                         value={ev.endDate} 
                         onChange={(e) => handleUpdate(ev.id, 'endDate', e.target.value)}
                         className="h-8 text-xs bg-black/40 border-white/10 focus:border-blue-500"
                       />
                    ) : (
                      <span className={`px-3 py-1.5 rounded font-mono text-xs border inline-block min-w-[100px] text-center ${
                        ev.endDate === 'N/A' 
                          ? 'bg-transparent text-gray-500 border-transparent italic' 
                          : 'bg-white/5 text-gray-300 border-white/5'
                      }`}>
                        {ev.endDate}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer for Non-Admins */}
        {!isAdmin && (
           <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Ban size={12} />
              <span>Only administrators can modify the academic calendar.</span>
           </div>
        )}
      </Card>
    </div>
  );
};

export default AcademicEvents;