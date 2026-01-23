import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { useAppStore } from '../../store';
import * as api from '../../utils/api';
import { Save, Download, AlertCircle, Loader2 } from 'lucide-react';

interface Course {
   id: string;
   code: string;
   name: string;
   credits: number;
}

interface Enrollment {
   id: number;
   student_email: string;
   entry_no: string;
   batch: number;
   grade: string | null;
   isDirty?: boolean;
}

const GradingPortal: React.FC = () => {
   const { currentUser } = useAppStore();
   const [myCourses, setMyCourses] = useState<Course[]>([]);
   const [selectedCourseId, setSelectedCourseId] = useState('');
   const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
   const [loading, setLoading] = useState(false);
   const [coursesLoading, setCoursesLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // Fetch instructor's courses on mount
   useEffect(() => {
      fetchMyCourses();
   }, []);

   const fetchMyCourses = async () => {
      try {
         setCoursesLoading(true);
         const data = await api.getInstructorCourses();
         const courses = data.courses || [];
         setMyCourses(courses);
         if (courses.length > 0) {
            setSelectedCourseId(courses[0].id || courses[0].code);
         }
      } catch (err: any) {
         console.error('Failed to fetch courses:', err);
         setError(err.message);
      } finally {
         setCoursesLoading(false);
      }
   };

   useEffect(() => {
      if (selectedCourseId) {
         fetchGrades();
      }
   }, [selectedCourseId]);

   const fetchGrades = async () => {
      setLoading(true);
      setError(null);
      try {
         const data = await api.getCourseEnrollments(selectedCourseId);
         setEnrollments(data.enrollments || []);
      } catch (e: any) {
         console.error(e);
         setError(e.message);
      } finally {
         setLoading(false);
      }
   };

   const handleGradeChange = (enrollmentId: number, value: string) => {
      setEnrollments(enrollments.map(e =>
         e.id === enrollmentId ? { ...e, grade: value.toUpperCase(), isDirty: true } : e
      ));
   };

   const saveGrades = async () => {
      setSaving(true);
      try {
         const dirtyRecords = enrollments.filter(e => e.isDirty);
         await Promise.all(dirtyRecords.map(e =>
            api.updateEnrollment(e.id, { grade: e.grade || undefined })
         ));
         await fetchGrades();
         alert('Grades saved successfully!');
      } catch (e) {
         console.error(e);
         alert('Failed to save grades');
      } finally {
         setSaving(false);
      }
   };

   if (coursesLoading) {
      return (
         <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   if (myCourses.length === 0) {
      return (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-white">Grading Portal</h1>
               <p className="text-gray-400 text-sm">Enter and finalize grades.</p>
            </div>
            <Card className="p-12 bg-[#18181b] border-white/10 text-center">
               <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
               <p className="text-gray-400">No courses assigned to you.</p>
               <p className="text-gray-500 text-sm mt-2">You need to be assigned as an instructor to a course to enter grades.</p>
            </Card>
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-white">Grading Portal</h1>
               <p className="text-gray-400 text-sm">Enter and finalize grades.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="secondary"><Download size={16} className="mr-2" /> Export CSV</Button>
               <Button onClick={saveGrades} disabled={saving || !enrollments.some(e => e.isDirty)}>
                  <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Grades'}
               </Button>
            </div>
         </div>

         <Card className="p-4 bg-[#18181b] border-white/10 flex items-center gap-4">
            <div className="flex-1">
               <label className="text-xs text-gray-500 block mb-1">Select Course</label>
               <select
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
               >
                  {myCourses.map(c => (
                     <option key={c.id || c.code} value={c.id || c.code}>{c.code} - {c.name}</option>
                  ))}
               </select>
            </div>
            <div className="flex-1">
               <label className="text-xs text-gray-500 block mb-1">Grading Status</label>
               <div className="text-sm text-gray-300 py-2">
                  {enrollments.length} Students Enrolled
                  {enrollments.filter(e => e.grade).length > 0 && (
                     <span className="text-green-500 ml-2">
                        ({enrollments.filter(e => e.grade).length} graded)
                     </span>
                  )}
               </div>
            </div>
         </Card>

         {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
               {error}
            </div>
         )}

         <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                     <tr>
                        <th className="px-6 py-4 font-medium">Entry No</th>
                        <th className="px-6 py-4 font-medium">Student</th>
                        <th className="px-6 py-4 font-medium">Batch</th>
                        <th className="px-6 py-4 font-medium w-32">Grade</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">
                           <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </td></tr>
                     ) : enrollments.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No students enrolled.</td></tr>
                     ) : enrollments.map((record) => (
                        <tr key={record.id} className={`hover:bg-white/[0.02] ${record.isDirty ? 'bg-yellow-500/5' : ''}`}>
                           <td className="px-6 py-4 font-mono text-gray-400">{record.entry_no || 'N/A'}</td>
                           <td className="px-6 py-4 text-white font-medium">
                              {record.student_email.split('@')[0]}
                           </td>
                           <td className="px-6 py-4 text-gray-400">{record.batch}</td>
                           <td className="px-6 py-4">
                              <input
                                 type="text"
                                 className="w-20 bg-black/40 border border-white/10 rounded px-2 py-1 text-center font-bold text-blue-400 uppercase focus:border-blue-500 focus:outline-none"
                                 value={record.grade || ''}
                                 placeholder="-"
                                 maxLength={2}
                                 onChange={(e) => handleGradeChange(record.id, e.target.value)}
                              />
                           </td>
                           <td className="px-6 py-4">
                              {record.isDirty ? (
                                 <Badge color="yellow">Unsaved</Badge>
                              ) : record.grade ? (
                                 <Badge color="green">Graded</Badge>
                              ) : (
                                 <Badge color="gray">Pending</Badge>
                              )}
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