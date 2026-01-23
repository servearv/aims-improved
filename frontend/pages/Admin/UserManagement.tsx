import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { UserRole } from '../../types';
import { Search, Plus, Edit, Ban, Trash2, Check, X, Loader2, AlertCircle } from 'lucide-react';
import * as api from '../../utils/api';

const UserManagement: React.FC = () => {
   const [users, setUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [roleFilter, setRoleFilter] = useState('ALL');
   const [error, setError] = useState<string | null>(null);
   const [showAddModal, setShowAddModal] = useState(false);
   const [newUser, setNewUser] = useState({ email: '', role: 'STUDENT' });
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      fetchUsers();
   }, [roleFilter]);

   // Debounce search
   useEffect(() => {
      const timer = setTimeout(() => {
         fetchUsers();
      }, 500);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   const fetchUsers = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await api.getUsers(roleFilter, searchTerm);
         setUsers(data.users || []);
      } catch (err: any) {
         console.error('Failed to fetch users', err);
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleCreateUser = async () => {
      try {
         setSubmitting(true);
         await api.createUser(newUser);
         setShowAddModal(false);
         setNewUser({ email: '', role: 'STUDENT' });
         await fetchUsers();
      } catch (err: any) {
         console.error('Create user failed', err);
         alert(err.message);
      } finally {
         setSubmitting(false);
      }
   };

   const handleToggleStatus = async (user: any) => {
      try {
         const newStatus = !user.is_active;
         await api.updateUser(user.id, { is_active: newStatus });
         // Updates local state optimistically or re-fetch
         setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      } catch (err: any) {
         console.error('Update status failed', err);
         alert('Failed to update user status');
      }
   };

   const handleDeleteUser = async (id: string) => {
      if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
      try {
         await api.deleteUser(id);
         setUsers(users.filter(u => u.id !== id));
      } catch (err: any) {
         console.error('Delete user failed', err);
         alert(err.message);
      }
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
               <p className="text-gray-400 text-sm">Manage student, faculty, and admin accounts.</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
               <Plus size={16} className="mr-2" /> Add User
            </Button>
         </div>

         <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex gap-4 flex-col sm:flex-row">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                  <input
                     type="text"
                     placeholder="Search by email or ID..."
                     className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <select
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
               >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Faculty</option>
                  <option value="ADVISOR">Advisor</option>
                  <option value="ADMIN">Admin</option>
               </select>
            </div>

            {error && (
               <div className="p-4 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
               </div>
            )}

            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-black/20 text-gray-400 border-b border-white/5">
                     <tr>
                        <th className="px-6 py-4 font-medium">User</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
                     ) : users.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td></tr>
                     ) : users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02]">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold
                                ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-500' :
                                       user.role === 'INSTRUCTOR' ? 'bg-orange-500/20 text-orange-500' :
                                          'bg-blue-500/20 text-blue-500'}`}
                                 >
                                    {user.email.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <div className="text-white font-medium truncate max-w-[200px]">{user.email}</div>
                                    <div className="text-gray-500 text-xs font-mono">{user.id}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-gray-300">
                              <Badge color={
                                 user.role === 'ADMIN' ? 'purple' :
                                    user.role === 'INSTRUCTOR' ? 'yellow' :
                                       user.role === 'ADVISOR' ? 'blue' : 'gray'
                              }>{user.role}</Badge>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`flex items-center gap-1.5 text-xs ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                 {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <button
                                    onClick={() => handleToggleStatus(user)}
                                    className={`p-1.5 rounded transition-colors ${user.is_active ? 'text-orange-400 hover:bg-orange-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                                    title={user.is_active ? 'Deactivate' : 'Activate'}
                                 >
                                    {user.is_active ? <Ban size={16} /> : <Check size={16} />}
                                 </button>
                                 <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                    title="Delete User"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>

         {/* Add User Modal */}
         {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-[#18181b] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Add New User</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                        <input
                           type="email"
                           className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                           placeholder="user@iitrpr.ac.in"
                           value={newUser.email}
                           onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Role</label>
                        <select
                           className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                           value={newUser.role}
                           onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                           <option value="STUDENT">Student</option>
                           <option value="INSTRUCTOR">Instructor</option>
                           <option value="ADVISOR">Advisor</option>
                           <option value="ADMIN">Admin</option>
                        </select>
                     </div>
                     <div className="flex gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                        <Button onClick={handleCreateUser} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500">
                           {submitting ? 'Creating...' : 'Create User'}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default UserManagement;