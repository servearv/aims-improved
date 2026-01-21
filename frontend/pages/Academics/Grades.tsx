import React from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Download, TrendingUp, Award, BookOpen, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAppStore } from '../../store';

const Grades: React.FC = () => {
  const { currentUser } = useAppStore();

  const semesterData = [
    { name: 'Sem 1', sgpa: 8.2, cgpa: 8.2 },
    { name: 'Sem 2', sgpa: 8.5, cgpa: 8.35 },
    { name: 'Sem 3', sgpa: 8.1, cgpa: 8.27 },
    { name: 'Sem 4', sgpa: 8.9, cgpa: 8.42 },
    { name: 'Sem 5', sgpa: 9.2, cgpa: 8.58 },
    { name: 'Sem 6', sgpa: 8.8, cgpa: 8.62 },
  ];

  const currentSemesterGrades = [
    { code: 'CS301', name: 'Operating Systems', credits: 4, grade: 'A', points: 10 },
    { code: 'CS302', name: 'Computer Networks', credits: 4, grade: 'A-', points: 9 },
    { code: 'CS305', name: 'Software Engineering', credits: 3, grade: 'B+', points: 8 },
    { code: 'HU301', name: 'Engineering Ethics', credits: 2, grade: 'A', points: 10 },
    { code: 'CS391', name: 'OS Lab', credits: 2, grade: 'A', points: 10 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Academic Performance</h1>
          <p className="text-gray-400 text-sm">Cumulative Grade Point Average (CGPA) & Transcripts</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="text-sm"><Share2 size={14} /> Share</Button>
           <Button className="text-sm"><Download size={14} /> Download Transcript</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 bg-[#18181b] border-white/10">
          <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="font-semibold text-white">Performance Trend</h3>
               <p className="text-xs text-gray-500">SGPA vs CGPA over semesters</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> SGPA
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> CGPA
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={semesterData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[6, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sgpa" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSgpa)" />
                <Area type="monotone" dataKey="cgpa" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Award size={100} />
              </div>
              <div className="relative z-10">
                 <p className="text-blue-100 font-medium text-sm mb-1">Current CGPA</p>
                 <h2 className="text-5xl font-bold tracking-tighter">8.62</h2>
                 <div className="mt-4 flex items-center gap-2 text-blue-100 text-xs bg-white/10 w-fit px-2 py-1 rounded-lg">
                    <TrendingUp size={12} /> Top 15% of Batch
                 </div>
              </div>
           </Card>

           <Card className="p-5 bg-[#18181b] border-white/10">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                 <BookOpen size={16} className="text-gray-400"/> Credits Summary
              </h4>
              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Earned</span>
                    <span className="font-medium text-white">88</span>
                 </div>
                 <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '73%' }}></div>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Required</span>
                    <span className="font-medium text-white">120</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-[#18181b] border-white/10">
         <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-semibold text-white">Course Wise Grades (Sem 6)</h3>
            <Badge color="green">Result Declared</Badge>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-white/5 text-gray-400">
                  <tr>
                     <th className="px-6 py-4 font-medium">Course Code</th>
                     <th className="px-6 py-4 font-medium">Course Title</th>
                     <th className="px-6 py-4 font-medium">Credits</th>
                     <th className="px-6 py-4 font-medium">Grade</th>
                     <th className="px-6 py-4 font-medium text-right">Grade Points</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {currentSemesterGrades.map((grade, i) => (
                     <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-300">{grade.code}</td>
                        <td className="px-6 py-4 text-white font-medium">{grade.name}</td>
                        <td className="px-6 py-4 text-gray-400">{grade.credits}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold border ${
                              grade.grade.startsWith('A') 
                                 ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                 : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                           }`}>
                              {grade.grade}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">{grade.points}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};

export default Grades;