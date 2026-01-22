import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/ui';
import { useAppStore } from '../store';
import { FileText, Download, AlertCircle, CheckSquare, Square, Loader2 } from 'lucide-react';
import { getStudentRecord } from '../utils/api';

interface CourseRecord {
  sn: number;
  code: string;
  name: string;
  ltp: string;
  status: string;
  enrolType: string;
  enrolStatus: string;
  category: string;
  grade: string;
  attd: string;
}

interface AcademicSessionRecord {
  session: string;
  sgpa: string;
  creditsReg: number;
  earned: number;
  cumul: number;
  cgpa: string;
  courses: CourseRecord[];
}

const StudentRecord: React.FC = () => {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'Academics' | 'Documents'>('Academics');
  const [showOnlyEnrolled, setShowOnlyEnrolled] = useState(true);
  const [academicHistory, setAcademicHistory] = useState<AcademicSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentRecord();
  }, [currentUser.email]);

  const fetchStudentRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentRecord();
      
      // Transform backend data to frontend format
      if (data.academicRecord) {
        const history: AcademicSessionRecord[] = [];
        let cumulativeCredits = 0;

        // Sort semesters
        const semesters = Object.keys(data.academicRecord.semesterStats || {}).sort();

        semesters.forEach((semester, idx) => {
          const stats = data.academicRecord.semesterStats[semester];
          cumulativeCredits += stats.creditsCompleted || 0;

          const courses: CourseRecord[] = (stats.enrollments || []).map((enrollment: any, i: number) => ({
            sn: i + 1,
            code: enrollment.course_id || '',
            name: enrollment.course_title || '',
            ltp: '', // Can be added if available in course data
            status: enrollment.status === 'Completed' ? 'Completed' : 'In Progress',
            enrolType: 'Credit',
            enrolStatus: enrollment.status || 'Enrolled',
            category: enrollment.course_type || 'PC',
            grade: enrollment.grade || '-',
            attd: '0%' // Attendance not yet implemented
          }));

          history.push({
            session: semester.replace('-', '-'), // Format: 2024-1 -> 2024-I
            sgpa: (stats.sgpa || 0).toFixed(2),
            creditsReg: stats.creditsCompleted || 0,
            earned: stats.creditsCompleted || 0,
            cumul: cumulativeCredits,
            cgpa: idx === semesters.length - 1 ? (data.academicRecord.cgpa || 0).toFixed(2) : '0.00',
            courses
          });
        });

        setAcademicHistory(history);
      }
    } catch (err: any) {
      console.error('Error fetching student record:', err);
      setError(err.message || 'Failed to load student record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Student Details Header */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Student Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Email</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">{currentUser.email}</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Name</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">{currentUser.name}</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Role</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">{currentUser.role}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-8">
        <button 
          className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${activeTab === 'Academics' ? 'bg-blue-600/10 text-blue-500 border-blue-500/50' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20'}`}
          onClick={() => setActiveTab('Academics')}
        >
          Academics
        </button>
        <button 
          className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${activeTab === 'Documents' ? 'bg-blue-600/10 text-blue-500 border-blue-500/50' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20'}`}
          onClick={() => setActiveTab('Documents')}
        >
          Documents
        </button>
      </div>

      {/* Content Area */}
      <Card className="p-0 border-white/10 bg-[#18181b]">
        {activeTab === 'Academics' && (
          <div className="space-y-0">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="text-gray-400">Loading academic record...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-400">{error}</p>
              </div>
            ) : academicHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>No academic records found.</p>
              </div>
            ) : (
              <>
                {/* Header Notice */}
                <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-red-400 font-bold">
                        NOTE: <span className="font-normal text-red-300">Some of the grades shown here may be pending approval by the senate. The records confirmed by the academic section will take precedence over anything shown here.</span>
                      </p>
                    </div>
                    <div 
                       className="flex items-center gap-2 cursor-pointer"
                       onClick={() => setShowOnlyEnrolled(!showOnlyEnrolled)}
                    >
                       {showOnlyEnrolled 
                         ? <CheckSquare size={16} className="text-blue-500" /> 
                         : <Square size={16} className="text-gray-500" />
                       }
                       <span className="text-xs text-gray-300 select-none">Show only Enrolled</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                     <thead className="bg-[#18181b] border-b border-white/10 text-gray-400 font-bold">
                        <tr>
                           <th className="px-4 py-3 w-10">S#</th>
                           <th className="px-4 py-3">Course</th>
                           <th className="px-4 py-3 w-20">Enrol.</th>
                           <th className="px-4 py-3 w-24">Enrol. status</th>
                           <th className="px-4 py-3 w-20">Course cat.</th>
                           <th className="px-4 py-3 w-16">Grade</th>
                           <th className="px-4 py-3 w-16 text-right">Attd.</th>
                        </tr>
                     </thead>
                  </table>
                  
                  {/* Semester Groups */}
                  {academicHistory.map((sem) => (
                     <div key={sem.session}>
                        {/* Semester Header Bar */}
                        <div className="bg-black border-y border-white/10 px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white font-medium">
                           <span className="text-white font-bold">Academic session: {sem.session}</span>
                           <span className="text-gray-600">|</span>
                           <span>SGPA: <span className="text-gray-300">{sem.sgpa}</span></span>
                           <span className="text-gray-600">|</span>
                           <span>Credits registered: <span className="text-gray-300">{sem.creditsReg}</span></span>
                           <span className="text-gray-600">|</span>
                           <span>Earned Credits: <span className="text-gray-300">{sem.earned}</span></span>
                           <span className="text-gray-600">|</span>
                           <span>Cumul. Earned Credits: <span className="text-gray-300">{sem.cumul}</span></span>
                           <span className="text-gray-600">|</span>
                           <span>CGPA: <span className="text-gray-300">{sem.cgpa}</span></span>
                        </div>

                        {/* Courses Table */}
                        <table className="w-full text-xs text-left">
                           <tbody className="divide-y divide-white/5">
                              {sem.courses.map((course) => (
                                 <tr key={course.code} className="hover:bg-white/[0.02] even:bg-white/[0.01]">
                                    <td className="px-4 py-2 w-10 text-gray-500">{course.sn}</td>
                                    <td className="px-4 py-2 text-gray-300">
                                       <span className="font-semibold text-gray-200">{course.code}</span> - {course.name} <span className="text-gray-500">{course.ltp}</span> <span className="text-gray-500">({course.status})</span>
                                    </td>
                                    <td className="px-4 py-2 w-20 text-gray-400">{course.enrolType}</td>
                                    <td className="px-4 py-2 w-24 text-gray-400">{course.enrolStatus}</td>
                                    <td className="px-4 py-2 w-20 text-gray-400">{course.category}</td>
                                    <td className="px-4 py-2 w-16 font-medium text-white">{course.grade}</td>
                                    <td className="px-4 py-2 w-16 text-right text-blue-400 underline decoration-blue-500/30 cursor-pointer hover:text-blue-300">{course.attd}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'Documents' && (
           <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No documents uploaded.</p>
           </div>
        )}
      </Card>
    </div>
  );
};

export default StudentRecord;
