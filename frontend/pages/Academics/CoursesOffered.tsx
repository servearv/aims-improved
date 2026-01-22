
import React, { useState, useEffect } from 'react';
import { Card, Input, Badge } from '../../components/ui';
import { Search, Eraser, Info, Loader2 } from 'lucide-react';
import { getAllCourses } from '../../utils/api';

interface CourseData {
  course_id: string;
  title: string;
  credits: number;
  instructor_email?: string;
  instructor_dept?: string;
  type?: string;
  status?: string;
  ltp?: string;
}

const CoursesOffered: React.FC = () => {
  const [results, setResults] = useState<CourseData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    department: '',
    code: '',
    title: '',
    session: '2024-II',
    ltp: '',
    instructor: '',
    status: ''
  });

  const handleSearch = async () => {
    try {
      setHasSearched(true);
      setLoading(true);
      
      const apiFilters: any = {};
      if (filters.status) apiFilters.status = filters.status;
      
      const data = await getAllCourses(apiFilters);
      let courses = data.courses || [];
      
      // Apply client-side filtering for additional filters
      if (filters.code) {
        courses = courses.filter(c => c.course_id.toLowerCase().includes(filters.code.toLowerCase()));
      }
      if (filters.title) {
        courses = courses.filter(c => c.title.toLowerCase().includes(filters.title.toLowerCase()));
      }
      if (filters.instructor) {
        courses = courses.filter(c => 
          c.instructor_email?.toLowerCase().includes(filters.instructor.toLowerCase()) ||
          c.instructor_dept?.toLowerCase().includes(filters.instructor.toLowerCase())
        );
      }
      
      setResults(courses);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      department: '',
      code: '',
      title: '',
      session: '2024-II',
      ltp: '',
      instructor: '',
      status: ''
    });
    setResults([]);
    setHasSearched(false);
  };

  const handleChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Courses Offered</h1>
        <p className="text-gray-400 text-sm">Search and browse courses offered for enrolment in the current session.</p>
      </div>

      {/* Filter Section */}
      <Card className="p-5 bg-[#18181b] border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
          
          <div className="xl:col-span-1">
            <label className="text-xs text-gray-500 mb-1.5 block">Offering Department</label>
            <select 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:border-blue-500/50 outline-none"
              value={filters.department}
              onChange={(e) => handleChange('department', e.target.value)}
            >
              <option value="">All</option>
              <option value="CSE">CSE</option>
              <option value="EE">EE</option>
              <option value="ME">ME</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
              <option value="HSS">HSS</option>
            </select>
          </div>

          <div className="xl:col-span-1">
             <label className="text-xs text-gray-500 mb-1.5 block">Course Code</label>
             <Input 
                placeholder="" 
                className="h-[34px] text-xs" 
                value={filters.code}
                onChange={(e) => handleChange('code', e.target.value)}
             />
          </div>

          <div className="xl:col-span-2">
             <label className="text-xs text-gray-500 mb-1.5 block">Title</label>
             <Input 
                placeholder="" 
                className="h-[34px] text-xs"
                value={filters.title}
                onChange={(e) => handleChange('title', e.target.value)}
             />
          </div>

          <div className="xl:col-span-1">
             <label className="text-xs text-gray-500 mb-1.5 block">Acad session</label>
             <div className="flex gap-2">
               <select 
                 className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:border-blue-500/50 outline-none"
                 value={filters.session}
                 onChange={(e) => handleChange('session', e.target.value)}
               >
                 <option value="2024-II">2024-II</option>
                 <option value="2024-I">2024-I</option>
               </select>
             </div>
          </div>
           {/* "Other" Checkbox simulated as per screenshot layout flow, but kept simple here */}
          
          <div className="xl:col-span-1">
             <label className="text-xs text-gray-500 mb-1.5 block">L-T-P</label>
             <Input 
                placeholder="" 
                className="h-[34px] text-xs"
                value={filters.ltp}
                onChange={(e) => handleChange('ltp', e.target.value)}
             />
          </div>

          <div className="xl:col-span-1">
             <label className="text-xs text-gray-500 mb-1.5 block">Instructor</label>
             <Input 
                placeholder="" 
                className="h-[34px] text-xs"
                value={filters.instructor}
                onChange={(e) => handleChange('instructor', e.target.value)}
             />
          </div>

          <div className="xl:col-span-1 flex gap-2">
             <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1.5 block">Status</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:border-blue-500/50 outline-none"
                  value={filters.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Offered">Offered</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
             </div>
          </div>

        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <Info size={12} />
            If you do not find the desired results, please try specifying fewer criteria. All non-empty search fields are used <strong>together</strong>.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleSearch}
              className="w-8 h-8 rounded border border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20 flex items-center justify-center transition-colors"
              title="Search"
            >
              <Search size={16} />
            </button>
            <button 
               onClick={handleReset}
               className="w-8 h-8 rounded border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-colors"
               title="Clear"
            >
              <Eraser size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="p-0 overflow-hidden bg-[#18181b] border-white/10 min-h-[300px]">
        <div className="p-3 bg-white/5 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white ml-2">Results</h3>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 mb-4 animate-spin text-blue-500" />
            <p>Loading courses...</p>
          </div>
        ) : !hasSearched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
             <p>Nothing to show yet! Click Search to load courses.</p>
          </div>
        ) : results.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-500">
             <p>No courses found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium">Offering Department</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Acad session</th>
                  <th className="px-4 py-3 font-medium">L-T-P</th>
                  <th className="px-4 py-3 font-medium">Instructor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white">
                      <span className="font-mono text-gray-400 mr-2">{course.course_id}</span>
                      <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] border border-white/5">{course.instructor_dept || 'CSE'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-medium">{course.title}</td>
                    <td className="px-4 py-3 text-gray-500">{filters.session || '2024-II'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono">{course.ltp || '3-0-0'}</td>
                    <td className="px-4 py-3 text-gray-400">{course.instructor_email || 'N/A'}</td>
                    <td className="px-4 py-3">
                       <Badge color="green">{course.status || 'Offered'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
};

export default CoursesOffered;
