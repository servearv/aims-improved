
import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { useAppStore } from '../store';
import { FileText, Download, AlertCircle, CheckSquare, Square } from 'lucide-react';

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

  // Mock Data mimicking the screenshot
  const academicHistory: AcademicSessionRecord[] = [
    {
      session: "2023-I",
      sgpa: "8.03",
      creditsReg: 18,
      earned: 18,
      cumul: 18,
      cgpa: "8.03",
      courses: [
        { sn: 1, code: "MA101", name: "CALCULUS", ltp: "(3-1-0-5-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "SC", grade: "B", attd: "0%" },
        { sn: 2, code: "CY101", name: "CHEMISTRY FOR ENGINEERS", ltp: "(3-1-2-6-4)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "SC", grade: "B", attd: "0%" },
        { sn: 3, code: "GE103", name: "INTRODUCTION TO COMPUTING AND DATA STRUCTURES", ltp: "(3-0-3-15/2-4.5)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "GR", grade: "B", attd: "0%" },
        { sn: 4, code: "HS102", name: "ENGLISH LANGUAGE SKILLS", ltp: "(2-2/3-2-13/3-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "HC", grade: "B", attd: "0%" },
        { sn: 5, code: "NS101", name: "NSS I", ltp: "(0-0-2-1-1)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "NN", grade: "A-", attd: "0%" },
        { sn: 6, code: "GE105", name: "ENGINEERING DRAWING", ltp: "(0-0-3-3/2-1.5)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "GR", grade: "B-", attd: "0%" },
        { sn: 7, code: "GE101", name: "TECHNOLOGY MUSEUM LAB", ltp: "(0-0-2-1-1)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "GR", grade: "A-", attd: "0%" },
      ]
    },
    {
      session: "2023-II",
      sgpa: "7.92",
      creditsReg: 18.5,
      earned: 18.5,
      cumul: 36.5,
      cgpa: "7.97",
      courses: [
        { sn: 1, code: "CS101", name: "DISCRETE MATHEMATICAL STRUCTURES", ltp: "(3-1-0-5-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "PC", grade: "A-", attd: "0%" },
        { sn: 2, code: "HS101", name: "HISTORY OF TECHNOLOGY", ltp: "(3/2-1/2-0-5/2-1.5)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "HC", grade: "A-", attd: "0%" },
        { sn: 3, code: "PH101", name: "Physics for Engineers", ltp: "(3-1-0-5-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "SC", grade: "B-", attd: "0%" },
        { sn: 4, code: "PH102", name: "Physics for Engineers Lab", ltp: "(0-0-4-2-2)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "SC", grade: "A", attd: "0%" },
        { sn: 5, code: "MA102", name: "LINEAR ALGEBRA, INTEGRAL TRANSFORMS AND SPECIAL FUNCTIONS", ltp: "(3-1-0-5-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "SC", grade: "C-", attd: "0%" },
        { sn: 6, code: "GE104", name: "INTRODUCTION TO ELECTRICAL ENGINEERING", ltp: "(2-2/3-2-13/3-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "GR", grade: "B", attd: "0%" },
        { sn: 7, code: "GE102", name: "WORKSHOP PRACTICE", ltp: "(0-0-4-2-2)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "GR", grade: "B", attd: "0%" },
        { sn: 8, code: "NS102", name: "NSS II", ltp: "(0-0-2-1-1)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "NN", grade: "A", attd: "0%" },
      ]
    },
    {
      session: "2024-I",
      sgpa: "7.92",
      creditsReg: 19.5,
      earned: 19.5,
      cumul: 56,
      cgpa: "7.96",
      courses: [
        { sn: 1, code: "MA201", name: "Differential Equations", ltp: "(3-1-0-5-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "SC", grade: "B", attd: "0%" },
        { sn: 2, code: "EE201", name: "Signals and Systems", ltp: "(3-1-0-5-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "PC", grade: "B", attd: "0%" },
        { sn: 3, code: "CS203", name: "Digital Logic Design", ltp: "(3-1-3-6-4)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "PC", grade: "B", attd: "0%" },
        { sn: 4, code: "CS201", name: "Data Structures", ltp: "(3-1-2-6-4)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "PC", grade: "C", attd: "0%" },
        { sn: 5, code: "HS201", name: "Economics", ltp: "(3-1-0-5-3)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "HC", grade: "A-", attd: "0%" },
        { sn: 6, code: "GE107", name: "Tinkering Lab", ltp: "(0-0-3-3/2-1.5)", status: "Completed", enrolType: "Credit", enrolStatus: "Enrolled", category: "GR", grade: "A-", attd: "0%" },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Student Details Header */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Student Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">First Name</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">ASODARIYA</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Last Name</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">HARSH GOPALBHAI</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Roll No.</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">2023CSB1103</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Degree</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 flex justify-between items-center">
              B.Tech <span className="text-gray-600">▼</span>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-500 block">Email</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">2023csb1103@iitrpr.ac.in</div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-500 block">Department</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 flex justify-between items-center">
              Computer Science and Engineering <span className="text-gray-600">▼</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block">Year-of-entry</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300">2023</div>
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="text-xs text-gray-500 block">Category</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 flex justify-between items-center">
               General <span className="text-gray-600">▼</span>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-500 block">Minor/Concentration Specialization</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 flex justify-between items-center">
               <span className="text-gray-600">▼</span>
            </div>
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs text-gray-500 block">Degree Type</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 flex justify-between items-center">
               B.Tech <span className="text-gray-600">▼</span>
            </div>
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs text-gray-500 block">Current Status</label>
            <div className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 flex justify-between items-center">
               Registered <span className="text-gray-600">▼</span>
            </div>
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
