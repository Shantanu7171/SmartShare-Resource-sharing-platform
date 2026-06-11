import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCog, FaCheck, FaTimes, FaUser, FaBook, 
  FaClock, FaEye, FaUsers, FaFolderOpen, FaExclamationTriangle,
  FaUniversity, FaGraduationCap, FaTrash
} from 'react-icons/fa';
import { resourceAPI, authAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const FacultyPanel = () => {
  const { user: currentFaculty } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending'); // pending, all, students
  
  // Data states
  const [resources, setResources] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchFacultyData();
    if (activeTab === 'students') {
      fetchStudentsData();
    }
  }, [currentFaculty?.university, activeTab]);

  const fetchFacultyData = async () => {
    if (!currentFaculty?.university) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Fetch only resources belonging to this faculty's university
      const res = await resourceAPI.getAll({ 
        uploaded_by__university: currentFaculty.university 
      });
      const list = res.data.results || res.data || [];
      setResources(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load university resource requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsData = async () => {
    try {
      setLoadingStudents(true);
      const res = await authAPI.getFacultyStudents();
      setStudents(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load university students.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await resourceAPI.approve(id, 'approved');
      toast.success('Resource approved successfully! Student rewarded.');
      // Update local state status
      setResources(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    } catch (err) {
      toast.error('Failed to approve resource');
    }
  };

  const handleReject = async (id) => {
    try {
      await resourceAPI.approve(id, 'rejected');
      toast.success('Resource request rejected.');
      // Update local state status
      setResources(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
    } catch (err) {
      toast.error('Failed to reject resource');
    }
  };

  const handleDeleteStudent = async (id, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user '${username}'? This action cannot be undone.`)) {
      return;
    }
    try {
      await authAPI.deleteUser(id);
      toast.success(`Student '${username}' has been deleted successfully.`);
      setStudents(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete student.');
    }
  };

  // Filter calculations
  const pendingResources = resources.filter(item => item.status === 'pending');
  const approvedCount = resources.filter(item => item.status === 'approved').length;
  const pendingCount = pendingResources.length;
  const totalCount = resources.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative overflow-hidden transition-colors duration-300">
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <FaCog className="text-violet-600 dark:text-violet-500 animate-spin-slow" />
            <span>Faculty Console</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-0.5">
            Approve study requests and lecture files uploaded by students
          </p>
        </div>

        {/* University details badge */}
        {currentFaculty?.university && (
          <div className="flex items-center gap-2.5 px-4.5 py-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 rounded-2xl w-fit">
            <FaUniversity className="text-violet-600 dark:text-violet-400 text-lg" />
            <div className="text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Registered University</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">{currentFaculty.university}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
            <FaExclamationTriangle />
          </div>
          <div>
            <p className="text-lg font-black text-gray-800 dark:text-white">{pendingCount}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Pending Approvals</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
            <FaCheck className="text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-800 dark:text-white">{approvedCount}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Approved Materials</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
            <FaBook />
          </div>
          <div>
            <p className="text-lg font-black text-gray-800 dark:text-white">{totalCount}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Requests Received</p>
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
            Pending Requests ({pendingResources.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
              activeTab === 'all' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All University Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
              activeTab === 'students' 
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            My Students ({students.length})
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
                    <p className="text-sm font-bold text-gray-700 dark:text-white">No pending resource requests</p>
                    <p className="text-xs text-gray-450 dark:text-slate-400 mt-1">Students at your university have all their shares approved.</p>
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
                            {item.uploaded_by?.college && (
                              <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-400 flex items-center gap-0.5">
                                <FaGraduationCap size={10} />
                                <span>{item.uploaded_by.college}</span>
                              </span>
                            )}
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
                        <th className="px-6 py-4">College</th>
                        <th className="px-6 py-4">Subject/Branch</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Downloads</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-xs transition-colors">
                      {resources.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800 dark:text-slate-200">{item.title}</p>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-semibold">
                            {item.uploaded_by?.username}
                          </td>
                          <td className="px-6 py-4 text-gray-650 dark:text-slate-350">
                            {item.uploaded_by?.college || 'N/A'}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Students list */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                {/* Search box */}
                <div className="flex justify-between items-center bg-white dark:bg-[#0d1222]/90 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
                  <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaUsers size={12} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:border-violet-500 outline-none text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Total: {students.filter(s => s.username.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase())).length}
                  </span>
                </div>

                {loadingStudents ? (
                  <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-8 shadow-sm flex justify-center items-center py-16 transition-colors">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-8 transition-colors">
                    <FaUsers className="text-4xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-700 dark:text-white">No students registered under your university</p>
                    <p className="text-xs text-gray-450 dark:text-slate-400 mt-1">Students will appear here once they register with your university name.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800/40 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Department & Sem</th>
                            <th className="px-6 py-4 text-center">Resources Uploaded</th>
                            <th className="px-6 py-4 text-center">Contribution Points</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40 text-xs text-gray-600 dark:text-slate-300 transition-colors">
                          {students
                            .filter(u => u.username.toLowerCase().includes(studentSearch.toLowerCase()) || u.email.toLowerCase().includes(studentSearch.toLowerCase()))
                            .map((u) => (
                              <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                                <td className="px-6 py-4">
                                  <Link to={`/user-profile/${u.id}`} className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                                    {u.avatar ? (
                                      <img src={u.avatar} alt={u.username} className="h-6 w-6 rounded-full object-cover border border-violet-500/20" />
                                    ) : (
                                      <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-[10px] font-bold flex items-center justify-center">
                                        {u.username?.[0] || 'S'}
                                      </div>
                                    )}
                                    <span>{u.username}</span>
                                  </Link>
                                </td>
                                <td className="px-6 py-4 font-semibold">
                                  {u.email}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-gray-700 dark:text-slate-300 uppercase">{u.branch || 'N/A'}</span>
                                  {u.semester && <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1">Sem {u.semester}</span>}
                                </td>
                                <td className="px-6 py-4 text-center font-bold">
                                  {u.total_uploads || 0}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-950/30 text-violet-750 dark:text-violet-400">
                                    {u.points || 0} pts
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => handleDeleteStudent(u.id, u.username)}
                                    className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Student Account"
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyPanel;
