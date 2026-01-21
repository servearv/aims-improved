import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { MOCK_GRADES } from '../../constants';
import { Save, Download, AlertCircle, Calculator } from 'lucide-react';

const GradingPortal: React.FC = () => {
  const [grades, setGrades] = useState(MOCK_GRADES);
  const [selectedCourse, setSelectedCourse] = useState('CS201');

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    setGrades(grades.map(g => {
      if (g.studentId === studentId) {
        const updated = { ...g, [field]: value };
        // Auto calculate total (mock logic)
        if (field !== 'grade' && field !== 'total') {
            updated.total = Number(updated.midSem) + Number(updated.endSem) + Number(updated.internal);
        }
        return updated;
      }
      return g;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white">Grading Portal</h1>
           <p className="text-gray-400 text-sm">Enter and finalize marks for Spring 2024.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary"><Download size={16} className="mr-2"/> Import CSV</Button>
           <Button><Save size={16} className="mr-2"/> Save Grades</Button>
        </div>
      </div>

      <Card className="p-4 bg-[#18181b] border-white/10 flex items-center gap-4">
         <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Select Course</label>
            <select 
               className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
               value={selectedCourse}
               onChange={(e) => setSelectedCourse(e.target.value)}
            >
               <option value="CS201">CS201 - Data Structures</option>
               <option value="CS101">CS101 - Intro to Programming</option>
            </select>
         </div>
         <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Grading Scheme</label>
            <div className="text-sm text-gray-300 py-2">Absolute (Fixed Cutoffs)</div>
         </div>
         <div className="flex-1 text-right">
             <Button variant="ghost" className="text-xs"><Calculator size={14} className="mr-1"/> View Statistics</Button>
         </div>
      </Card>

      <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                  <tr>
                     <th className="px-6 py-4 font-medium">Roll No</th>
                     <th className="px-6 py-4 font-medium">Student Name</th>
                     <th className="px-6 py-4 font-medium w-24">Internal (20)</th>
                     <th className="px-6 py-4 font-medium w-24">Mid Sem (30)</th>
                     <th className="px-6 py-4 font-medium w-24">End Sem (50)</th>
                     <th className="px-6 py-4 font-medium w-24">Total (100)</th>
                     <th className="px-6 py-4 font-medium w-24">Grade</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {grades.map((record) => (
                     <tr key={record.studentId} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-mono text-gray-400">{record.rollNo}</td>
                        <td className="px-6 py-4 text-white font-medium">{record.name}</td>
                        <td className="px-6 py-4">
                           <input 
                              type="number" 
                              className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-right text-white"
                              value={record.internal}
                              onChange={(e) => handleGradeChange(record.studentId, 'internal', e.target.value)}
                           />
                        </td>
                        <td className="px-6 py-4">
                           <input 
                              type="number" 
                              className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-right text-white"
                              value={record.midSem}
                              onChange={(e) => handleGradeChange(record.studentId, 'midSem', e.target.value)}
                           />
                        </td>
                        <td className="px-6 py-4">
                           <input 
                              type="number" 
                              className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-right text-white"
                              value={record.endSem}
                              onChange={(e) => handleGradeChange(record.studentId, 'endSem', e.target.value)}
                           />
                        </td>
                        <td className="px-6 py-4 font-bold text-white">{record.total}</td>
                        <td className="px-6 py-4">
                           <input 
                              type="text" 
                              className="w-12 bg-black/40 border border-white/10 rounded px-2 py-1 text-center font-bold text-blue-400 uppercase"
                              value={record.grade}
                              onChange={(e) => handleGradeChange(record.studentId, 'grade', e.target.value)}
                           />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};

export default GradingPortal;