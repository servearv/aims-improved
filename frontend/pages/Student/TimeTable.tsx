import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui';
import { MapPin } from 'lucide-react';
import { getTimetable } from '../../utils/api';

const TimeTable: React.FC = () => {
  const [schedule, setSchedule] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const data = await getTimetable();
        const newSchedule: any = {};

        data.forEach((item: any) => {
          const day = item.day_of_week;
          const time = item.start_time.substring(0, 5);

          if (!newSchedule[day]) newSchedule[day] = {};

          let duration = 1;
          if (item.end_time) {
            const startH = parseInt(item.start_time.split(':')[0]);
            const endH = parseInt(item.end_time.split(':')[0]);
            duration = endH - startH;
          }

          newSchedule[day][time] = {
            code: item.code,
            title: item.title,
            type: item.type,
            room: item.room,
            duration: duration > 0 ? duration : 1
          };
        });

        setSchedule(newSchedule);
      } catch (err: any) {
        console.error("Failed to fetch timetable", err);
        setError(err.message || "Failed to load timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) return <div className="text-white p-6">Loading timetable...</div>;
  if (error) return <div className="text-red-500 p-6">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Weekly Timetable</h1>
        <p className="text-gray-400 text-sm">Spring Semester 2024</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px] grid grid-cols-6 gap-4">
          {/* Header Row */}
          <div className="p-3 text-center text-gray-500 text-sm font-medium">Time / Day</div>
          {days.map(day => (
            <div key={day} className="p-3 text-center text-white font-semibold bg-white/5 rounded-lg border border-white/5">
              {day}
            </div>
          ))}

          {/* Slots Rows */}
          {slots.map((slot) => (
            <React.Fragment key={slot.time}>
              {/* Time Column */}
              <div className="flex items-center justify-center text-xs text-gray-500 font-medium bg-[#18181b] rounded-lg border border-dashed border-white/10 min-h-[80px]">
                {slot.label}
              </div>

              {/* Day Columns */}
              {slot.type === 'break' ? (
                <div className="col-span-5 bg-white/[0.02] rounded-lg border border-white/5 flex items-center justify-center text-gray-600 text-xs uppercase tracking-widest font-medium min-h-[80px]">
                  Lunch Break
                </div>
              ) : (
                days.map((day) => {
                  const classInfo = schedule[day]?.[slot.time];

                  // Check if this cell is covered by a previous row-spanning cell
                  // We need to check if ANY slot before this one on the same day has a duration that covers current slot.
                  // Iterating all previous slots for this day is costly inside render? 
                  // Given max 8 slots, it's fine.
                  let hidden = false;
                  slots.forEach(s => {
                    if (s.time < slot.time && s.type !== 'break') {
                      const prevClass = schedule[day]?.[s.time];
                      if (prevClass && prevClass.duration > 1) {
                        const startH = parseInt(s.time.split(':')[0]);
                        const currentH = parseInt(slot.time.split(':')[0]);
                        if (currentH < startH + prevClass.duration) {
                          hidden = true;
                        }
                      }
                    }
                  });

                  if (hidden) return null; // Don't render anything, grid flow handles it? 
                  // NO! If we return null, the grid cells shift! We must effectively "skip" this cell but we can't just skip in CSS Grid if auto-placement is on.
                  // Actually, if we use `row-span`, the browser automatically places the next cell in the next available slot.
                  // So if a previous cell spans 3 rows, in the next row, that column is occupied, so the NEXT child (which would be this day's cell) 
                  // would be placed in the NEXT column? NO.
                  // We explicitly map `days.map`. We create 5 div elements.
                  // If Monday 14:00 spans 3 rows.
                  // The grid has 6 columns.
                  // Row 15:00 starts.
                  // Time Label (col 1).
                  // Monday (col 2) is occupied by the span? Yes.
                  // So the next child we output (for Monday 15:00) will be placed in Col 3 (Tuesday)?
                  // YES, that's how Implicit Grid works!
                  // So if `hidden` is true, we should NOT output an element at all.

                  if (hidden) return null;

                  if (classInfo) {
                    return (
                      <div
                        key={`${day}-${slot.time}`}
                        className={`min-h-[80px] relative z-10 ${classInfo.duration > 1 ? `row-span-${classInfo.duration}` : ''}`}
                        style={classInfo.duration > 1 ? { gridRow: `span ${classInfo.duration}` } : {}}
                      >
                        <ClassCard info={classInfo} />
                      </div>
                    );
                  }

                  return (
                    <div key={`${day}-${slot.time}`} className="min-h-[80px] rounded-lg border border-white/[0.02]"></div>
                  );
                })
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const ClassCard = ({ info }: { info: any }) => {
  const isLab = info.type === 'Lab';
  return (
    <Card className={`h-full p-3 flex flex-col justify-between border-l-4 hover:brightness-110 transition-all cursor-pointer ${isLab ? 'border-l-purple-500 bg-purple-500/10 border-purple-500/20' : 'border-l-blue-500 bg-blue-500/10 border-blue-500/20'
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