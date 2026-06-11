import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCog, FaCheck, FaTimes, FaUser, FaBook, 
  FaClock, FaEye, FaUsers, FaFolderOpen, FaExclamationTriangle,
  FaTrash
} from 'react-icons/fa';
import { resourceAPI, authAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user: currentAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending'); // pending, all, users, approvals
  
  // Data states
  const [allResources, setAllResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resourcesRes, usersRes] = await Promise.all([
        resourceAPI.getAll(),
        authAPI.getUsersAdmin(),
      ]);

      setAllResources(resourcesRes.data.results || resourcesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await resourceAPI.approve(id, 'approved');
      toast.success('Resource approved successfully! Uploader rewarded.');
      // Refresh local resources list
      setAllResources(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    } catch (err) {
      toast.error('Failed to approve resource');
    }
  };

  const handleReject = async (id) => {
    try {
      await resourceAPI.approve(id, 'rejected');
      toast.success('Resource rejected.');
      // Refresh local resources list
      setAllResources(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
    } catch (err) {
      toast.error('Failed to reject resource');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this resource?')) {
      return;
    }
    try {
      await resourceAPI.delete(id);
      toast.success('Resource deleted successfully!');
      setAllResources(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const handleRemoveUser = async (id, username) => {
    if (id === currentAdmin?.id) {
      toast.error("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently remove user '${username}'?`)) {
      return;
    }
    try {
      await authAPI.deleteUser(id);
      toast.success(`User '${username}' removed successfully.`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove user account');
    }
  };

  const handleUpdateRole = async (id, newRole, username) => {
    if (id === currentAdmin?.id) {
      toast.error("You cannot change your own admin role.");
      return;
    }
    try {
      await authAPI.updateUserAdmin(id, { role: newRole });
      toast.success(`Role for '${username}' updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update role for '${username}'`);
    }
  };

  const handleApproveFaculty = async (id, username) => {
    try {
      await authAPI.updateUserAdmin(id, { is_approved_faculty: true });
      toast.success(`Faculty registration for '${username}' approved successfully!`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_approved_faculty: true } : u));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to approve faculty '${username}'`);
    }
  };

  const handleUpdatePoints = async (id, newPoints, username) => {
    try {
      await authAPI.updateUserAdmin(id, { points: parseInt(newPoints) || 0 });
      toast.success(`Points for '${username}' updated to ${newPoints}`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, points: parseInt(newPoints) || 0 } : u));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update points for '${username}'`);
    }
  };

  // Stats calculation
  const totalResources = allResources.length;
  const pendingCount = allResources.filter(item => item.status === 'pending').length;
  const totalUsers = users.length;
  const pendingFaculty = users.filter(u => u.role === 'faculty' && !u.is_approved_faculty);

  const pendingResources = allResources.filter(item => item.status === 'pending');
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative overflow-hidden transition-colors duration-300">
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <FaCog className="text-primary-600 dark:text-primary-500 animate-spin-slow" />
          <span>Admin Console</span>
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-0.5">Moderate study files, review reports, and manage college accounts</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
            <FaExclamationTriangle />
          </div>
          <div>
            <p className="text-lg font-black text-gray-800 dark:text-white">{pendingCount}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Pending Moderation</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
            <FaBook />
          </div>
          <div>
            <p className="text-lg font-black text-gray-800 dark:text-white">{totalResources}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Uploads</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
            <FaUsers />
          </div>
          <div>
            <p className="text-lg font-black text-gray-800 dark:text-white">{totalUsers}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Registered Users</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6 relative z-10">
        <div className="flex border-b border-gray-200 dark:border-slate-800/80 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 pb-0.5">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
              activeTab === 'pending' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Pending Approval ({pendingResources.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
              activeTab === 'all' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All Resources ({allResources.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
              activeTab === 'users' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
              activeTab === 'approvals' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Faculty Approvals ({pendingFaculty.length})
          </button>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-8 shadow-sm flex justify-center items-center py-16 transition-colors">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : (
          <div>
            {/* Tab Pending Approval */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingResources.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-8 transition-colors">
                    <FaFolderOpen className="text-4xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-700 dark:text-white">No resources pending approval</p>
                    <p className="text-xs text-gray-450 dark:text-slate-400 mt-1">Excellent work! All uploads are currently moderated.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-sm divide-y divide-gray-50 dark:divide-slate-800/40 overflow-hidden transition-colors">
                    {pendingResources.map((item) => (
                      <div key={item.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="space-y-1.5 flex-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md">{item.branch}</span>
                            <span className="text-xs font-bold bg-purple-50 dark:bg-violet-950/40 text-purple-700 dark:text-violet-400 px-2 py-0.5 rounded-md">Sem {item.semester}</span>
                            <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-md capitalize">{item.file_type}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">{item.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-350 max-w-xl line-clamp-1">{item.description || 'No description provided.'}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500 font-semibold pt-1">
                            <span className="flex items-center gap-0.5"><FaUser size={8} /> by <span className="text-gray-700 dark:text-slate-300 font-bold">{item.uploaded_by?.username}</span></span>
                            <span className="flex items-center gap-0.5"><FaClock size={8} /> {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <a 
                            href={item.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                          >
                            <FaEye size={11} />
                            <span>Preview</span>
                          </a>
                          <button 
                            onClick={() => handleReject(item.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition-colors"
                          >
                            <FaTimes size={11} />
                            <span>Reject</span>
                          </button>
                          <button 
                            onClick={() => handleApprove(item.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
                          >
                            <FaCheck size={11} />
                            <span>Approve</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab All Resources */}
            {activeTab === 'all' && (
              <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/40 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Uploader</th>
                        <th className="px-6 py-4">Subject/Branch</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Downloads</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-xs transition-colors">
                      {allResources.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800 dark:text-slate-200">{item.title}</p>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-semibold">
                            {item.uploaded_by?.username}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-700 dark:text-slate-350 block">{item.subject}</span>
                            <span className="text-[10px] bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-800 px-1 rounded">{item.branch} / Sem {item.semester}</span>
                          </td>
                          <td className="px-6 py-4 capitalize">
                            <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded ${
                              item.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                              item.status === 'rejected' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-slate-300">
                            {item.downloads}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete Resource"
                            >
                              <FaTrash size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Users list */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/40 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">University & College</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4 text-center">Points</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-xs text-gray-600 dark:text-slate-300 transition-colors">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4 font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                            <Link to={`/user-profile/${u.id}`} className="flex items-center gap-2 hover:text-violet-650 dark:hover:text-violet-400 transition-colors">
                              <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-[10px] font-bold flex items-center justify-center">
                                {u.username?.[0] || 'U'}
                              </div>
                              <span>{u.username}</span>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value, u.username)}
                              disabled={u.id === currentAdmin?.id}
                              className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:border-violet-500 cursor-pointer text-xs font-semibold"
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-750 dark:text-slate-200 block">{u.university || 'N/A'}</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{u.college || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-700 dark:text-slate-300 uppercase">{u.role === 'admin' ? 'N/A' : (u.branch || 'N/A')}</span>
                            {u.role !== 'admin' && u.semester && <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">Sem {u.semester}</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="number"
                                defaultValue={u.points}
                                onBlur={(e) => {
                                  if (parseInt(e.target.value) !== u.points) {
                                    handleUpdatePoints(u.id, e.target.value, u.username);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdatePoints(u.id, e.target.value, u.username);
                                    e.target.blur();
                                  }
                                }}
                                className="w-16 px-1.5 py-0.5 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:border-violet-500 text-xs font-bold"
                              />
                              <span className="text-[10px] text-slate-400 font-bold uppercase">pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.id !== currentAdmin?.id && (
                              <button
                                onClick={() => handleRemoveUser(u.id, u.username)}
                                className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Remove User Account"
                              >
                                <FaTrash size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Faculty Approvals list */}
            {activeTab === 'approvals' && (
              <div className="space-y-4">
                {pendingFaculty.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-8 transition-colors">
                    <FaUsers className="text-4xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-700 dark:text-white">No pending faculty approvals</p>
                    <p className="text-xs text-gray-450 dark:text-slate-400 mt-1">Excellent! All registered faculty accounts are approved.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/40 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                            <th className="px-6 py-4">Faculty User</th>
                            <th className="px-6 py-4">Email Address</th>
                            <th className="px-6 py-4">University & College</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-xs text-gray-600 dark:text-slate-300 transition-colors">
                          {pendingFaculty.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                              <td className="px-6 py-4 font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                                <Link to={`/user-profile/${u.id}`} className="flex items-center gap-2 hover:text-violet-650 dark:hover:text-violet-400 transition-colors">
                                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-[10px] font-bold flex items-center justify-center">
                                    {u.username?.[0] || 'F'}
                                  </div>
                                  <span>{u.username}</span>
                                </Link>
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-750 dark:text-slate-300">
                                {u.email}
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-bold text-gray-805 dark:text-slate-200 block">{u.university || 'N/A'}</span>
                                <span className="text-[10px] text-gray-400 dark:text-slate-500">{u.college || 'N/A'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-gray-700 dark:text-slate-300 uppercase">{u.branch || 'N/A'}</span>
                              </td>
                              <td className="px-6 py-4 text-right flex items-center justify-end gap-2 pt-3 pb-3">
                                <button
                                  onClick={() => handleRemoveUser(u.id, u.username)}
                                  className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                                  title="Reject & Delete Account"
                                >
                                  <FaTimes size={10} />
                                  <span>Reject</span>
                                </button>
                                <button
                                  onClick={() => handleApproveFaculty(u.id, u.username)}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                                  title="Approve Faculty"
                                >
                                  <FaCheck size={10} />
                                  <span>Approve</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
