import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../../components/ui';
import { User, UserRole } from '../../types';
import { Search, Plus, MoreVertical, Edit, Ban, Trash2 } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock Data
  const users: User[] = [
    { id: "s1", name: "Aravind Verma", email: "aravind.v@iitrpr.ac.in", role: UserRole.STUDENT, department: "CSE", status: "Active" },
    { id: "i1", name: "Dr. S. K. Das", email: "skdas@iitrpr.ac.in", role: UserRole.INSTRUCTOR, department: "CSE", status: "Active" },
    { id: "a1", name: "Prof. R. Gupta", email: "rgupta@iitrpr.ac.in", role: UserRole.ADVISOR, department: "ME", status: "Active" },
    { id: "s2", name: "Rahul Sharma", email: "rahul.s@iitrpr.ac.in", role: UserRole.STUDENT, department: "EE", status: "Inactive" },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
           <p className="text-gray-400 text-sm">Manage student, faculty, and admin accounts.</p>
        </div>
        <Button>
           <Plus size={16} className="mr-2" /> Add User
        </Button>
      </div>

      <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input 
                 type="text" 
                 placeholder="Search users..." 
                 className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Faculty</option>
           </select>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                 <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02]">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                                {user.name.charAt(0)}
                             </div>
                             <div>
                                <div className="text-white font-medium">{user.name}</div>
                                <div className="text-gray-500 text-xs">{user.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-gray-300">
                          <Badge color={user.role === UserRole.STUDENT ? 'blue' : 'yellow'}>{user.role}</Badge>
                       </td>
                       <td className="px-6 py-4 text-gray-400">{user.department}</td>
                       <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs ${user.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                             {user.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"><Edit size={16} /></button>
                             <button className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"><Ban size={16} /></button>
                          </div>
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

export default UserManagement;