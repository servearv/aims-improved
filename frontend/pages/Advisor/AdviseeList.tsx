import React from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { MOCK_ADVISEES } from '../../constants';
import { Search, Mail, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const AdviseeList: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white">Advisee Management</h1>
           <p className="text-gray-400 text-sm">Monitor academic progress and degree requirements.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary"><Mail size={16} className="mr-2"/> Email All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {MOCK_ADVISEES.map((student) => (
            <Card key={student.id} className="p-0 bg-[#18181b] border-white/10 overflow-hidden group hover:border-blue-500/30 transition-colors">
               <div className="p-5 border-b border-white/5 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        student.status === 'Critical' ? 'bg-red-500/10 text-red-500' : 
                        student.status === 'Probation' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                     }`}>
                        {student.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-semibold text-white">{student.name}</h3>
                        <p className="text-xs text-gray-500">{student.rollNo}</p>
                     </div>
                  </div>
                  <Badge color={
                     student.status === 'Critical' ? 'red' : 
                     student.status === 'Probation' ? 'yellow' : 'green'
                  }>{student.status}</Badge>
               </div>
               
               <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">CGPA</span>
                     <span className="text-white font-bold">{student.cgpa}</span>
                  </div>
                  
                  <div className="space-y-1.5">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Credits Earned</span>
                        <span className="text-gray-300">{student.creditsEarned} / {student.creditsRequired}</span>
                     </div>
                     <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div 
                           className={`h-1.5 rounded-full ${student.status === 'Critical' ? 'bg-red-500' : 'bg-blue-500'}`} 
                           style={{ width: `${(student.creditsEarned / student.creditsRequired) * 100}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t border-white/5 flex justify-between items-center">
                     <span>Last Meeting: {student.lastMeeting}</span>
                     <button className="text-blue-400 hover:text-blue-300 font-medium">View Notes</button>
                  </div>
               </div>
               
               <div className="bg-white/[0.02] p-3 flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs">Audit</Button>
                  <Button variant="secondary" size="sm" className="flex-1 text-xs">Message</Button>
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
};

export default AdviseeList;