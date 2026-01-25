import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Download, TrendingUp, Award, BookOpen, Share2, Loader2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store';
import { getStudentGrades } from '../../utils/api';

interface CourseGrade {
   code: string;
   name: string;
   credits: number;
   type: string;
   grade: string;
   gradePoints: number | null;
   status: string;
}

interface SemesterData {
   semester: string;
   sgpa: number;
   cgpa: number;
   creditsRegistered: number;
   creditsEarned: number;
   cumulativeCredits: number;
   courses: CourseGrade[];
}

const Grades: React.FC = () => {
   const { currentUser } = useAppStore();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [semesters, setSemesters] = useState<SemesterData[]>([]);
   const [currentCgpa, setCurrentCgpa] = useState(0);
   const [totalCredits, setTotalCredits] = useState(0);
   const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

   useEffect(() => {
      fetchGrades();
   }, []);

   const fetchGrades = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await getStudentGrades();
         setSemesters(data.semesters || []);
         setCurrentCgpa(data.currentCgpa || 0);
         setTotalCredits(data.totalCreditsEarned || 0);

         // Select latest semester by default
         if (data.semesters?.length > 0) {
            setSelectedSemester(data.semesters[data.semesters.length - 1].semester);
         }
      } catch (err: any) {
         console.error('Failed to fetch grades:', err);
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-white">Academic Performance</h1>
            <Card className="p-12 bg-[#18181b] border-white/10 text-center">
               <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
               <p className="text-red-400">{error}</p>
               <Button onClick={fetchGrades} className="mt-4">Retry</Button>
            </Card>
         </div>
      );
   }

   // Prepare chart data
   const chartData = semesters.map(sem => ({
      name: sem.semester.replace('-', ' '),
      sgpa: sem.sgpa,
      cgpa: sem.cgpa
   }));

   const selectedSemData = semesters.find(s => s.semester === selectedSemester);

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

         {semesters.length === 0 ? (
            <Card className="p-12 bg-[#18181b] border-white/10 text-center">
               <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-500" />
               <p className="text-gray-400">No grades available yet.</p>
               <p className="text-gray-500 text-sm mt-2">Grades will appear here after your courses are graded.</p>
            </Card>
         ) : (
            <>
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
                           <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                 <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                 </linearGradient>
                                 <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
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
                           <h2 className="text-5xl font-bold tracking-tighter">{currentCgpa.toFixed(2)}</h2>
                           <div className="mt-4 flex items-center gap-2 text-blue-100 text-xs bg-white/10 w-fit px-2 py-1 rounded-lg">
                              <TrendingUp size={12} /> Based on {totalCredits} credits
                           </div>
                        </div>
                     </Card>

                     <Card className="p-5 bg-[#18181b] border-white/10">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                           <BookOpen size={16} className="text-gray-400" /> Credits Summary
                        </h4>
                        <div className="space-y-3">
                           <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Earned</span>
                              <span className="font-medium text-white">{totalCredits}</span>
                           </div>
                           <div className="w-full bg-white/5 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalCredits / 160) * 100)}%` }}></div>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Required</span>
                              <span className="font-medium text-white">160</span>
                           </div>
                        </div>
                     </Card>
                  </div>
               </div>

               <Card className="p-0 overflow-hidden bg-[#18181b] border-white/10">
                  <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <h3 className="font-semibold text-white">Course Wise Grades</h3>
                     <select
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        value={selectedSemester || ''}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                     >
                        {semesters.map(sem => (
                           <option key={sem.semester} value={sem.semester}>{sem.semester}</option>
                        ))}
                     </select>
                  </div>

                  {selectedSemData && (
                     <>
                        <div className="px-6 py-3 bg-black/20 border-b border-white/10 flex flex-wrap gap-6 text-xs text-gray-400">
                           <span>SGPA: <span className="text-white font-medium">{selectedSemData.sgpa.toFixed(2)}</span></span>
                           <span>Credits Registered: <span className="text-white font-medium">{selectedSemData.creditsRegistered}</span></span>
                           <span>Credits Earned: <span className="text-white font-medium">{selectedSemData.creditsEarned}</span></span>
                           <span>CGPA: <span className="text-white font-medium">{selectedSemData.cgpa.toFixed(2)}</span></span>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                              <thead className="bg-white/5 text-gray-400">
                                 <tr>
                                    <th className="px-6 py-4 font-medium">Course Code</th>
                                    <th className="px-6 py-4 font-medium">Course Title</th>
                                    <th className="px-6 py-4 font-medium">Credits</th>
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">Grade</th>
                                    <th className="px-6 py-4 font-medium text-right">Points</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {selectedSemData.courses.map((course, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                       <td className="px-6 py-4 font-mono text-gray-300">{course.code}</td>
                                       <td className="px-6 py-4 text-white font-medium">{course.name}</td>
                                       <td className="px-6 py-4 text-gray-400">{course.credits}</td>
                                       <td className="px-6 py-4 text-gray-400">{course.type}</td>
                                       <td className="px-6 py-4">
                                          {course.grade !== '-' ? (
                                             <span className={`px-2 py-1 rounded text-xs font-bold border ${course.gradePoints && course.gradePoints >= 9
                                                   ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                   : course.gradePoints && course.gradePoints >= 7
                                                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {course.grade}
                                             </span>
                                          ) : (
                                             <span className="text-gray-500">-</span>
                                          )}
                                       </td>
                                       <td className="px-6 py-4 text-right text-gray-300">
                                          {course.gradePoints !== null ? course.gradePoints : '-'}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </>
                  )}
               </Card>
            </>
         )}
      </div>
   );
};

export default Grades;