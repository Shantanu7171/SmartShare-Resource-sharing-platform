import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaUniversity, FaTrophy, 
  FaEdit, FaUpload, FaBookmark, FaRegStar, FaDownload,
  FaCheckCircle, FaExclamationCircle, FaTimesCircle,
  FaCog, FaBook, FaUsers, FaExclamationTriangle
} from 'react-icons/fa';
import { authAPI, resourceAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import ResourceCard from '../components/ResourceCard';
import GridSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'system' : 'uploads'); // system or uploads for admin

  // Data states
  const [myUploads, setMyUploads] = useState([]);
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  // Admin stats
  const [adminStats, setAdminStats] = useState({
    pending: 0,
    totalResources: 0,
    totalUsers: 0,
  });
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);

  // Edit Profile form states
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [college, setCollege] = useState(user?.college || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    refreshUserProfile();
    if (user?.role === 'admin') {
      fetchAdminStats();
    } else {
      fetchMyUploads();
      fetchMyBookmarks();
    }
  }, [user?.role]);

  const fetchAdminStats = async () => {
    try {
      setLoadingAdminStats(true);
      const [resourcesRes, usersRes] = await Promise.all([
        resourceAPI.getAll(),
        authAPI.getUsersAdmin(),
      ]);
      const resourcesList = resourcesRes.data.results || resourcesRes.data || [];
      const usersList = usersRes.data || [];
      setAdminStats({
        pending: resourcesList.filter(item => item.status === 'pending').length,
        totalResources: resourcesList.length,
        totalUsers: usersList.length,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingAdminStats(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      updateUser(res.data);
    } catch (err) {
      console.error('Error refreshing profile info on mount:', err);
    }
  };

  const fetchMyUploads = async () => {
    try {
      setLoadingUploads(true);
      const res = await resourceAPI.getAll({ uploaded_by: user?.id });
      const list = res.data.results || res.data || [];
      setMyUploads(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load uploads list');
    } finally {
      setLoadingUploads(false);
    }
  };

  const fetchMyBookmarks = async () => {
    try {
      setLoadingBookmarks(true);
      const res = await authAPI.getBookmarks();
      setMyBookmarks(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookmarks list');
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleBookmarkToggle = (resourceId, isBookmarked) => {
    if (!isBookmarked) {
      setMyBookmarks(prev => prev.filter(item => item.id !== resourceId));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);

      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      formData.append('university', university);
      formData.append('college', college);
      formData.append('branch', user?.role === 'admin' ? '' : branch);
      formData.append('semester', (user?.role === 'admin' || !semester) ? '' : parseInt(semester));
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const res = await authAPI.updateProfile(formData);
      updateUser(res.data);
      toast.success('Profile updated successfully!');
      setActiveTab(user?.role === 'admin' ? 'edit' : 'uploads');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile settings.');
    } finally {
      setUpdating(false);
    }
  };

  // Stats calculators
  const totalUploads = myUploads.length;
  const totalDownloads = myUploads.reduce((sum, item) => sum + (item.downloads || 0), 0);
  const avgRating = myUploads.length > 0 
    ? (myUploads.reduce((sum, item) => sum + (item.avg_rating || 0), 0) / myUploads.length).toFixed(1) 
    : '0.0';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md"><FaCheckCircle /> Approved</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30 px-2.5 py-1 rounded-md"><FaTimesCircle /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-2.5 py-1 rounded-md"><FaExclamationCircle /> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Faculty Approval Warning Banner */}
      {user?.role === 'faculty' && !user?.is_approved_faculty && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4.5 rounded-2xl flex items-start gap-3 text-left">
          <FaExclamationTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm tracking-tight text-amber-700 dark:text-amber-300">Registration Pending Approval</h4>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400/85 mt-0.5">
              Your faculty account is pending review by the system administrator. You will gain access to the Faculty Console and student moderation features once your registration is approved.
            </p>
          </div>
        </div>
      )}

      {/* Header Profile Info */}
      <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="h-20 w-20 rounded-full object-cover border border-primary-200 dark:border-primary-800" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-3xl capitalize">
            {user?.username?.[0] || 'U'}
          </div>
        )}

        <div className="space-y-2 flex-grow text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </h1>
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-950/40 text-violet-750 dark:text-violet-400 px-2.5 py-0.5 rounded-md w-fit mx-auto md:mx-0">
              {user?.role}
            </span>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-violet-600 hover:bg-violet-750 text-white px-3 py-1 rounded-full w-fit mx-auto md:mx-0 transition-smooth shadow-sm hover:shadow-violet-500/20 active:scale-95"
              >
                <FaCog size={10} className="animate-spin-slow" />
                <span>Go to Admin Panel</span>
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-400 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-1">
            <FaEnvelope />
            <span>{user?.email}</span>
          </p>
          {user?.bio && <p className="text-sm text-gray-500 dark:text-slate-350 max-w-md">{user.bio}</p>}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1.5 text-sm text-gray-500 dark:text-slate-400 font-medium">
            {user?.role !== 'admin' && user?.branch && <span className="bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 px-2.5 py-0.5 rounded-md">{user.branch}</span>}
            {user?.role !== 'admin' && user?.semester && <span className="bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 px-2.5 py-0.5 rounded-md">Semester {user.semester}</span>}
            {user?.university && <span className="bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 px-2.5 py-0.5 rounded-md flex items-center gap-1"><FaUniversity size={12} /> {user.university}</span>}
            {user?.college && <span className="bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 px-2.5 py-0.5 rounded-md flex items-center gap-1"><FaUniversity size={12} /> {user.college}</span>}
          </div>
        </div>

        {/* User Points or Admin Console */}
        {user?.role !== 'admin' ? (
          <div className="bg-secondary-50 dark:bg-secondary-950/20 border border-secondary-100 dark:border-secondary-900/40 rounded-2xl p-5 text-center min-w-[150px] shadow-sm flex flex-col justify-center items-center gap-1">
            <FaTrophy className="text-secondary-500 dark:text-secondary-400 text-2xl animate-pulse" />
            <span className="text-2xl font-black text-secondary-700 dark:text-secondary-400 tracking-tight">{user?.points || 0}</span>
            <span className="text-xs text-secondary-600 dark:text-secondary-400/85 font-bold uppercase tracking-wider">Total Points</span>
          </div>
        ) : (
          <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-5 text-center min-w-[150px] shadow-sm flex flex-col justify-center items-center gap-1">
            <FaCog className="text-violet-500 dark:text-violet-400 text-2xl animate-spin-slow" />
            <span className="text-sm font-black text-violet-750 dark:text-violet-400 tracking-tight uppercase">Admin Console</span>
            <span className="text-[10px] text-violet-650 dark:text-violet-400/80 font-bold uppercase tracking-wider">Full Access</span>
          </div>
        )}
      </div>

      {/* Stats Cards Row */}
      {user?.role === 'admin' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link to="/admin" className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-violet-500 dark:hover:border-violet-500 transition-smooth">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
               <FaExclamationTriangle />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800 dark:text-white">{adminStats.pending}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Pending Moderation</p>
            </div>
          </Link>

          <Link to="/admin" className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-violet-500 dark:hover:border-violet-500 transition-smooth">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
              <FaBook />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800 dark:text-white">{adminStats.totalResources}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Platform Resources</p>
            </div>
          </Link>

          <Link to="/admin" className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:border-violet-500 dark:hover:border-violet-500 transition-smooth">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              <FaUsers />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800 dark:text-white">{adminStats.totalUsers}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Registered Users</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
               <FaUpload />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800 dark:text-white">{user?.total_uploads || 0}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Uploads</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              <FaDownload />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800 dark:text-white">{user?.total_downloads || 0}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Downloads Received</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <FaRegStar />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800 dark:text-white">{avgRating}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Average Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-200 dark:border-slate-800/80 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 pb-0.5">
          {user?.role === 'admin' ? (
            <>
              <button
                onClick={() => setActiveTab('system')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
                  activeTab === 'system' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FaCog size={14} className="animate-spin-slow" />
                <span>System Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
                  activeTab === 'edit' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FaEdit size={14} />
                <span>Edit Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('uploads')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
                  activeTab === 'uploads' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FaUpload size={14} />
                <span>My Uploads ({user?.total_uploads || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
                  activeTab === 'bookmarks' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FaBookmark size={14} />
                <span>Bookmarks ({myBookmarks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 flex-shrink-0 ${
                  activeTab === 'edit' 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FaEdit size={14} />
                <span>Edit Profile</span>
              </button>
            </>
          )}
        </div>

        {/* Tab contents */}
        {user?.role === 'admin' && activeTab === 'system' && (
          <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm max-w-4xl space-y-6">
            <h3 className="text-lg font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
              <FaCog className="text-violet-500 animate-spin-slow" />
              <span>Administrative Overview & Quick Links</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-100 dark:border-slate-800/50 p-5 rounded-2xl bg-slate-50/50 dark:bg-[#090e1a]/60 space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <FaExclamationTriangle className="text-amber-500" />
                  <span>Approvals ({adminStats.pending})</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Review pending lecture slides, documents, and other notes uploaded by users.</p>
                <Link to="/admin" className="inline-block text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                  Go to Moderation Console &rarr;
                </Link>
              </div>

              <div className="border border-slate-100 dark:border-slate-800/50 p-5 rounded-2xl bg-slate-50/50 dark:bg-[#090e1a]/60 space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <FaBook className="text-blue-500" />
                  <span>All Uploads ({adminStats.totalResources})</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage all materials, delete outdated notes or flagged documents.</p>
                <Link to="/admin" className="inline-block text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                  Go to Resource Library &rarr;
                </Link>
              </div>

              <div className="border border-slate-100 dark:border-slate-800/50 p-5 rounded-2xl bg-slate-50/50 dark:bg-[#090e1a]/60 space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <FaUsers className="text-purple-500" />
                  <span>Users ({adminStats.totalUsers})</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Moderate registered users, promote contributors, and adjust points.</p>
                <Link to="/admin" className="inline-block text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                  Go to User Management &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div>
            {loadingUploads ? (
              <GridSkeleton count={3} />
            ) : myUploads.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-8">
                <p className="text-base font-bold text-gray-700 dark:text-white">You haven't uploaded any resources yet</p>
                <p className="text-sm text-gray-400 dark:text-slate-400 mt-1">Start sharing lecture slides or lab manual files with your college!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myUploads.map((resource) => (
                  <div key={resource.id} className="relative group">
                    <ResourceCard resource={resource} />
                    <div className="absolute top-3 left-3 pointer-events-none shadow-sm rounded-md overflow-hidden">
                      {getStatusBadge(resource.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            {loadingBookmarks ? (
              <GridSkeleton count={3} />
            ) : myBookmarks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-8">
                <p className="text-base font-bold text-gray-700 dark:text-white">No bookmarked resources</p>
                <p className="text-sm text-gray-400 dark:text-slate-400 mt-1">Bookmark files in the search feed to see them saved here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBookmarks.map((resource) => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    onBookmarkToggle={handleBookmarkToggle} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm max-w-2xl">
            <h3 className="text-lg font-extrabold text-gray-800 dark:text-white mb-5">Update Profile Information</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600 dark:text-slate-300 block">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900/80 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600 dark:text-slate-300 block">Avatar Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                    className="w-full text-sm text-gray-500 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-100 dark:file:bg-slate-800 file:text-gray-700 dark:file:text-slate-300 hover:file:bg-gray-200 dark:hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              {user?.role !== 'admin' && (
                <div className={`grid grid-cols-1 ${user?.role === 'faculty' ? '' : 'sm:grid-cols-2'} gap-4`}>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-600 dark:text-slate-300 block">Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900/80 outline-none"
                    >
                      <option value="" className="dark:bg-slate-900">Select Branch</option>
                      <option value="CSE" className="dark:bg-slate-900">CSE</option>
                      <option value="IT" className="dark:bg-slate-900">IT</option>
                      <option value="ECE" className="dark:bg-slate-900">ECE</option>
                      <option value="MECH" className="dark:bg-slate-900">MECH</option>
                      <option value="CIVIL" className="dark:bg-slate-900">CIVIL</option>
                    </select>
                  </div>

                  {user?.role !== 'faculty' && (
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-gray-600 dark:text-slate-300 block">Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900/80 outline-none"
                      >
                        <option value="" className="dark:bg-slate-900">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                          <option key={sem} value={sem} className="dark:bg-slate-900">Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 dark:text-slate-300 block">University Name</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900/80 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 dark:text-slate-300 block">College Name</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900/80 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 dark:text-slate-300 block">Bio Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell peers about yourself..."
                  className="w-full p-3.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900/80 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-all"
              >
                {updating ? 'Saving updates...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
