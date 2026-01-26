import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { Search, Mail, FileText, AlertTriangle, CheckCircle, ChevronRight, X, BookOpen, GraduationCap, Clock } from 'lucide-react';
import * as api from '../../utils/api';
import { Loader2 } from 'lucide-react';
import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

interface Advisee {
   email: string;
   entry_no: string;
   batch: number;
   group: string;
   status: 'Good Standing' | 'At Risk';
   pending_requests: number;
   active_courses: number;
   avg_gpa: string;
}

interface AdviseeProgress {
   student: any;
   currentCgpa: number;
   totalCreditsEarned: number;
   pendingRequests: number;
   status: string;
   academicHistory: any[];
}

const AdviseeList: React.FC = () => {
   const [advisees, setAdvisees] = useState<Advisee[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
   const [studentProgress, setStudentProgress] = useState<AdviseeProgress | null>(null);
   const [progressLoading, setProgressLoading] = useState(false);

   useEffect(() => {
      fetchAdvisees();
   }, []);

   const fetchAdvisees = async () => {
      try {
         setLoading(true);
         const data = await api.getAdvisees();
         setAdvisees(data.advisees || []);
      } catch (err: any) {
         console.error('Failed to fetch advisees:', err);
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleViewProgress = async (email: string) => {
      setSelectedStudentEmail(email);
      setProgressLoading(true);
      try {
         const data = await api.getAdviseeProgress(email);
         setStudentProgress(data);
      } catch (err: any) {
         console.error('Failed to fetch progress:', err);
         // You might want to show a toast or alert here
      } finally {
         setProgressLoading(false);
      }
   };

   const closeProfile = () => {
      setSelectedStudentEmail(null);
      setStudentProgress(null);
   };

   const filteredAdvisees = advisees.filter(student =>
      student.entry_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
   );

   if (loading) {
      return (
         <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
         {/* Main List View */}
         <div className={`${selectedStudentEmail ? 'hidden md:block md:w-1/2 lg:w-1/3' : 'w-full'} transition-all duration-300`}>
            <div className="flex flex-col gap-4 mb-6">
               <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Advisee Management</h1>
                  <p className="text-gray-400 text-sm">Monitor academic progress ({advisees.length} students)</p>
               </div>
               <div className="flex gap-2">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                     <input
                        type="text"
                        placeholder="Search by Entry No..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  <Button variant="secondary" onClick={() => window.open(`mailto:${advisees.map(a => a.email).join(',')}`)}>
                     <Mail size={16} />
                  </Button>
               </div>
            </div>

            <div className="space-y-3">
               {filteredAdvisees.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                     <p>No advisees found.</p>
                  </div>
               ) : filteredAdvisees.map((student) => (
                  <Card
                     key={student.entry_no}
                     className={`p-4 cursor-pointer hover:border-blue-500/30 transition-all ${selectedStudentEmail === student.email ? 'border-blue-500 bg-blue-500/5' : 'bg-[#18181b] border-white/10'}`}
                     onClick={() => handleViewProgress(student.email)}
                  >
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-mono font-medium text-white">{student.entry_no}</h3>
                              {student.status === 'At Risk' && (
                                 <Badge color="red" className="text-[10px] px-1 py-0 h-5">At Risk</Badge>
                              )}
                           </div>
                           <p className="text-sm text-gray-400 mt-1">{student.email.split('@')[0]}</p>
                           <div className="flex gap-3 mt-3 text-xs text-secondary">
                              <span className="flex items-center gap-1"><GraduationCap size={12} /> Batch {student.batch}</span>
                              <span className="flex items-center gap-1"><BookOpen size={12} /> GPA: {student.avg_gpa || 'N/A'}</span>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           {student.pending_requests > 0 && (
                              <Badge color="yellow" className="text-[10px]">
                                 {student.pending_requests} Requests
                              </Badge>
                           )}
                           <ChevronRight size={16} className="text-gray-600" />
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </div>

         {/* Detailed View Panel */}
         {selectedStudentEmail && (
            <div className="fixed inset-0 md:static md:inset-auto md:w-1/2 lg:w-2/3 md:pl-6 bg-black/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none z-50 flex flex-col">
               <div className="bg-[#09090b] md:bg-[#18181b] w-full h-full md:h-auto md:min-h-[calc(100vh-100px)] md:rounded-xl md:border md:border-white/10 overflow-hidden flex flex-col">
                  {progressLoading ? (
                     <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                     </div>
                  ) : studentProgress ? (
                     <>
                        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-black/20">
                           <div>
                              <h2 className="text-2xl font-bold text-white mb-1">{studentProgress.student.entryNo}</h2>
                              <p className="text-gray-400">{selectedStudentEmail}</p>
                              <div className="flex gap-2 mt-3">
                                 <Badge color={studentProgress.status === 'At Risk' ? 'red' : 'green'}>
                                    {studentProgress.status}
                                 </Badge>
                                 <Badge color="blue">Batch {studentProgress.student.batch}</Badge>
                              </div>
                           </div>
                           <Button variant="ghost" size="sm" onClick={closeProfile}>
                              <X size={20} />
                           </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                           {/* Quick Stats */}
                           <div className="grid grid-cols-3 gap-4">
                              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                 <p className="text-xs text-blue-400 mb-1">CGPA</p>
                                 <p className="text-2xl font-bold text-blue-100">{studentProgress.currentCgpa}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                 <p className="text-xs text-green-400 mb-1">Credits Earned</p>
                                 <p className="text-2xl font-bold text-green-100">{studentProgress.totalCreditsEarned}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                 <p className="text-xs text-yellow-400 mb-1">Pending Requests</p>
                                 <p className="text-2xl font-bold text-yellow-100">{studentProgress.pendingRequests}</p>
                              </div>
                           </div>

                           {/* GPA Chart */}
                           <Card className="p-4 bg-black/20 border-white/5">
                              <h3 className="text-sm font-semibold text-white mb-4">Performance Trend</h3>
                              <div className="h-48">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={studentProgress.academicHistory}>
                                       <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                       <XAxis dataKey="semester" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                       <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} />
                                       <RechartsTooltip
                                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '6px' }}
                                       />
                                       <Line type="monotone" dataKey="sgpa" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                       <Line type="monotone" dataKey="cgpa" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                 </ResponsiveContainer>
                              </div>
                           </Card>

                           {/* Academic History */}
                           <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-white">Semester Details</h3>
                              {studentProgress.academicHistory.slice().reverse().map((sem: any) => (
                                 <Card key={sem.semester} className="overflow-hidden bg-black/20 border-white/5">
                                    <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                       <span className="font-medium text-white">{sem.semester}</span>
                                       <div className="flex gap-4 text-xs">
                                          <span className="text-gray-400">SGPA: <span className="text-white">{sem.sgpa}</span></span>
                                          <span className="text-gray-400">Credits: <span className="text-white">{sem.creditsEarned}</span></span>
                                       </div>
                                    </div>
                                    <div className="p-0">
                                       <table className="w-full text-xs text-left">
                                          <thead className="text-gray-500 bg-white/[0.02]">
                                             <tr>
                                                <th className="px-4 py-2 font-normal">Code</th>
                                                <th className="px-4 py-2 font-normal">Course</th>
                                                <th className="px-4 py-2 font-normal text-right">Grade</th>
                                             </tr>
                                          </thead>
                                          <tbody className="divide-y divide-white/5">
                                             {sem.courses.map((course: any) => (
                                                <tr key={course.code}>
                                                   <td className="px-4 py-2 font-mono text-gray-400">{course.code}</td>
                                                   <td className="px-4 py-2 text-gray-300">{course.name}</td>
                                                   <td className="px-4 py-2 text-right">
                                                      {course.grade !== '-' ? (
                                                         <span className={`font-bold ${['A+', 'A', 'A-', 'B+'].includes(course.grade) ? 'text-green-500' :
                                                               ['F', 'E'].includes(course.grade) ? 'text-red-500' : 'text-blue-400'
                                                            }`}>{course.grade}</span>
                                                      ) : <span className="text-gray-600">-</span>}
                                                   </td>
                                                </tr>
                                             ))}
                                          </tbody>
                                       </table>
                                    </div>
                                 </Card>
                              ))}
                           </div>
                        </div>
                     </>
                  ) : <div className="p-8 text-center text-red-400">{error || 'Failed to load details'}</div>}
               </div>
            </div>
         )}
      </div>
   );
};

export default AdviseeList;