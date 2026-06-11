import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaUser, FaEnvelope, FaUniversity, FaGraduationCap, 
  FaAward, FaBook, FaDownload, FaTrash, FaExclamationTriangle 
} from 'react-icons/fa';
import { authAPI, resourceAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import ResourceCard from '../components/ResourceCard';
import GridSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const UserProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const viewer = useAuthStore((state) => state.user);

  // States
  const [profileUser, setProfileUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchUserResources();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoadingProfile(true);
      const res = await authAPI.getUserProfile(id);
      setProfileUser(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user profile details.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchUserResources = async () => {
    try {
      setLoadingResources(true);
      const res = await resourceAPI.getAll({ uploaded_by: id });
      const list = res.data.results || res.data || [];
      setResources(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user study materials.');
    } finally {
      setLoadingResources(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!profileUser) return;
    const isSelf = viewer?.id === profileUser.id;
    if (isSelf) {
      toast.error('You cannot delete your own account.');
      return;
    }

    const confirmMsg = `Are you sure you want to permanently delete user '${profileUser.username}'? This will delete all of their study uploads and user data. This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setDeleting(true);
      await authAPI.deleteUser(profileUser.id);
      toast.success(`User '${profileUser.username}' deleted successfully.`);
      
      // Navigate back to where they came from
      if (viewer?.role === 'admin') {
        navigate('/admin');
      } else if (viewer?.role === 'faculty') {
        navigate('/faculty');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user account.');
    } finally {
      setDeleting(false);
    }
  };

  // Check if current viewer has delete authority over this profile
  const canDelete = viewer && profileUser && (
    viewer.role === 'admin' || 
    (viewer.role === 'faculty' && 
     profileUser.role === 'student' && 
     profileUser.university === viewer.university &&
     (!viewer.college || profileUser.college === viewer.college)
    )
  ) && viewer.id !== profileUser.id;

  if (loadingProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="bg-white dark:bg-[#0d1222]/90 h-64 border border-slate-250 dark:border-slate-800/80 rounded-2xl"></div>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <GridSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <FaExclamationTriangle className="text-5xl text-amber-500 mx-auto" />
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Profile Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">The user may have been deleted, or you might not have permission to view their profile details.</p>
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <FaArrowLeft size={10} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalUploads = resources.length;
  const totalDownloads = resources.reduce((sum, item) => sum + (item.downloads || 0), 0);
  const avgRating = resources.length > 0 
    ? (resources.reduce((sum, item) => sum + (item.avg_rating || 0), 0) / resources.length).toFixed(1) 
    : '0.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative overflow-hidden transition-colors duration-300">
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          <FaArrowLeft size={10} />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Header Banner */}
      <div className="relative z-10 bg-white dark:bg-[#0d1222]/90 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/50 dark:shadow-none flex flex-col md:flex-row items-center md:items-stretch transition-colors">
        {/* Banner left side decoration */}
        <div className="w-full md:w-48 bg-gradient-to-r md:bg-gradient-to-b from-violet-600 to-indigo-600 dark:from-violet-950/45 dark:to-indigo-950/45 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-850">
          {profileUser.avatar ? (
            <img 
              src={profileUser.avatar} 
              alt={profileUser.username} 
              className="h-24 w-24 rounded-full object-cover border-4 border-white/25 shadow-md" 
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-white/10 text-white text-3xl font-black flex items-center justify-center border border-white/20 uppercase shadow-md select-none">
              {profileUser.username?.[0] || 'U'}
            </div>
          )}
        </div>

        {/* Profile user details */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between text-left space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                {profileUser.first_name && profileUser.last_name 
                  ? `${profileUser.first_name} ${profileUser.last_name}` 
                  : profileUser.username}
              </h1>
              
              <span className={`inline-block font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                profileUser.role === 'admin' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                profileUser.role === 'faculty' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' : 
                'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
              }`}>
                {profileUser.role}
              </span>

              {profileUser.role === 'faculty' && profileUser.is_approved_faculty && (
                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Approved Faculty
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
              {profileUser.bio || 'This user has not written a bio yet.'}
            </p>

            {/* University, College, Branch row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3.5 gap-x-6 pt-2 text-slate-650 dark:text-slate-350">
              <div className="flex items-center gap-2 text-xs">
                <FaEnvelope className="text-slate-400 flex-shrink-0" />
                <span className="font-semibold select-all">{profileUser.email}</span>
              </div>

              {profileUser.university && (
                <div className="flex items-center gap-2 text-xs">
                  <FaUniversity className="text-slate-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block leading-none mb-0.5">University</span>
                    <span className="font-bold">{profileUser.university}</span>
                  </div>
                </div>
              )}

              {profileUser.college && (
                <div className="flex items-center gap-2 text-xs">
                  <FaGraduationCap className="text-slate-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block leading-none mb-0.5">College Name</span>
                    <span className="font-bold">{profileUser.college}</span>
                  </div>
                </div>
              )}

              {profileUser.role !== 'admin' && profileUser.branch && (
                <div className="flex items-center gap-2 text-xs">
                  <FaBook className="text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block leading-none mb-0.5">Department / Branch</span>
                    <span className="font-bold uppercase">{profileUser.branch}</span>
                  </div>
                </div>
              )}

              {profileUser.role === 'student' && profileUser.semester && (
                <div className="flex items-center gap-2 text-xs">
                  <FaCalendarAlt className="text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block leading-none mb-0.5">Semester</span>
                    <span className="font-bold">Semester {profileUser.semester}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User management action buttons: Delete Account */}
          {canDelete && (
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:border-red-900/35 text-red-700 dark:text-red-400 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 cursor-pointer disabled:opacity-50"
              >
                <FaTrash size={11} className={deleting ? 'animate-pulse' : ''} />
                <span>{deleting ? 'Deleting Account...' : 'Delete User Account'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg">
            <FaBook />
          </div>
          <div className="text-left">
            <p className="text-lg font-black text-gray-800 dark:text-white">{totalUploads}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Resources Uploaded</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
            <FaDownload />
          </div>
          <div className="text-left">
            <p className="text-lg font-black text-gray-800 dark:text-white">{totalDownloads}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total File Downloads</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d1222]/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
            <FaAward />
          </div>
          <div className="text-left">
            <p className="text-lg font-black text-gray-800 dark:text-white">{profileUser.points || 0}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Contribution Points</p>
          </div>
        </div>
      </div>

      {/* Uploaded Resources Grid */}
      <div className="space-y-6 relative z-10 text-left">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            Uploaded Study Materials
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Browse through the resources and handouts shared by this user</p>
        </div>

        {loadingResources ? (
          <GridSkeleton count={3} />
        ) : resources.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0d1222]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-8">
            <FaBook className="text-4xl text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700 dark:text-white">No materials uploaded yet</p>
            <p className="text-xs text-gray-450 dark:text-slate-400 mt-1">This user hasn't shared any study resources yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;
