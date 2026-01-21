import React from 'react';
import { Card } from '../../components/ui';
import { Clock, MapPin } from 'lucide-react';

const TimeTable: React.FC = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slots = [
    { time: '09:00', label: '9:00 - 10:00' },
    { time: '10:00', label: '10:00 - 11:00' },
    { time: '11:00', label: '11:00 - 12:00' },
    { time: '12:00', label: '12:00 - 1:00' },
    { time: '13:00', label: 'Lunch Break', type: 'break' },
    { time: '14:00', label: '2:00 - 3:00' },
    { time: '15:00', label: '3:00 - 4:00' },
    { time: '16:00', label: '4:00 - 5:00' },
  ];

  // Mock schedule data
  const schedule: any = {
    'Monday': {
      '09:00': { code: 'CS301', title: 'OS', type: 'Lecture', room: 'L1' },
      '11:00': { code: 'CS302', title: 'Networks', type: 'Lecture', room: 'L2' }
    },
    'Tuesday': {
      '10:00': { code: 'MA102', title: 'Lin. Alg', type: 'Lecture', room: 'L1' },
      '14:00': { code: 'CS391', title: 'OS Lab', type: 'Lab', room: 'Lab 2', duration: 3 }
    },
    'Wednesday': {
      '09:00': { code: 'CS301', title: 'OS', type: 'Lecture', room: 'L1' },
      '11:00': { code: 'CS302', title: 'Networks', type: 'Lecture', room: 'L2' }
    },
    'Thursday': {
      '10:00': { code: 'MA102', title: 'Lin. Alg', type: 'Lecture', room: 'L1' },
      '15:00': { code: 'HU301', title: 'Ethics', type: 'Lecture', room: 'L3' }
    },
    'Friday': {
      '09:00': { code: 'CS305', title: 'Software Eng', type: 'Lecture', room: 'L2' },
      '11:00': { code: 'CS302', title: 'Networks', type: 'Tutorial', room: 'T1' }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Weekly Timetable</h1>
        <p className="text-gray-400 text-sm">Spring Semester 2024</p>
      </div>

      <div className="grid grid-cols-1 overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 mb-4">
            <div className="p-3 text-center text-gray-500 text-sm font-medium">Time / Day</div>
            {days.map(day => (
              <div key={day} className="p-3 text-center text-white font-semibold bg-white/5 rounded-lg border border-white/5">
                {day}
              </div>
            ))}
          </div>

          {/* Slots */}
          <div className="space-y-4">
            {slots.map((slot) => (
              <div key={slot.time} className="grid grid-cols-6 gap-4">
                {/* Time Column */}
                <div className="flex items-center justify-center text-xs text-gray-500 font-medium bg-[#18181b] rounded-lg border border-dashed border-white/10">
                  {slot.label}
                </div>

                {/* Days Columns */}
                {slot.type === 'break' ? (
                  <div className="col-span-5 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-center text-gray-600 text-xs uppercase tracking-widest font-medium">
                    Lunch Break
                  </div>
                ) : (
                  days.map((day) => {
                    const classInfo = schedule[day]?.[slot.time];
                    if (!classInfo && schedule[day]?.['14:00']?.duration === 3 && (slot.time === '15:00' || slot.time === '16:00') && day === 'Tuesday') {
                       // Skip rendering for multi-hour lab overlap (basic hack for demo)
                       return <div key={day} className="hidden"></div>;
                    }
                    if (day === 'Tuesday' && slot.time === '14:00' && classInfo?.duration) {
                        // Render Lab spanning 3 rows
                        return (
                            <div key={day} className="row-span-3 h-[250px] relative z-10">
                                <ClassCard info={classInfo} />
                            </div>
                        )
                    }

                    return (
                      <div key={day} className="min-h-[80px]">
                        {classInfo && <ClassCard info={classInfo} />}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassCard = ({ info }: { info: any }) => {
  const isLab = info.type === 'Lab';
  return (
    <Card className={`h-full p-3 flex flex-col justify-between border-l-4 hover:brightness-110 transition-all cursor-pointer ${
      isLab ? 'border-l-purple-500 bg-purple-500/10 border-purple-500/20' : 'border-l-blue-500 bg-blue-500/10 border-blue-500/20'
    }`}>
      <div>
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-white">{info.code}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isLab ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
            {info.type}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-200 leading-tight">{info.title}</div>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-2">
        <MapPin size={10} /> {info.room}
      </div>
    </Card>
  );
};

export default TimeTable;