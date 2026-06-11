import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaDownload, FaRegBookmark, FaBookmark, FaEye,
  FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt, FaImage
} from 'react-icons/fa';
import { resourceAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Helper to get file type details
const getFileTypeBadge = (fileType) => {
  switch (fileType) {
    case 'pdf': return { label: 'PDF NOTES', icon: <FaFilePdf className="text-red-400 text-lg" /> };
    case 'ppt': return { label: 'SLIDES', icon: <FaFilePowerpoint className="text-amber-400 text-lg" /> };
    case 'doc': return { label: 'DOCUMENT', icon: <FaFileWord className="text-blue-400 text-lg" /> };
    case 'image': return { label: 'IMAGE', icon: <FaImage className="text-emerald-400 text-lg" /> };
    default: return { label: 'RESOURCE', icon: <FaFileAlt className="text-violet-400 text-lg" /> };
  }
};

// Helper to get branch-specific theme colors and background watermark
const getBranchTheme = (branch) => {
  const b = (branch || '').toUpperCase();
  if (b.includes('CSE') || b.includes('COMPUTER')) {
    return {
      gradient: 'from-violet-600 via-indigo-700 to-slate-900',
      watermark: 'CSE',
      glow: 'bg-violet-500/20',
      gridOpacity: 'opacity-10'
    };
  }
  if (b.includes('ECE') || b.includes('ELECTRONICS')) {
    return {
      gradient: 'from-blue-600 via-indigo-800 to-slate-900',
      watermark: 'ECE',
      glow: 'bg-blue-500/20',
      gridOpacity: 'opacity-10'
    };
  }
  if (b.includes('IT') || b.includes('INFORMATION')) {
    return {
      gradient: 'from-emerald-600 via-teal-700 to-slate-900',
      watermark: 'IT',
      glow: 'bg-emerald-500/20',
      gridOpacity: 'opacity-10'
    };
  }
  if (b.includes('MECH') || b.includes('MECHANICAL')) {
    return {
      gradient: 'from-orange-600 via-amber-700 to-slate-900',
      watermark: 'MECH',
      glow: 'bg-orange-500/20',
      gridOpacity: 'opacity-10'
    };
  }
  if (b.includes('CIVIL')) {
    return {
      gradient: 'from-amber-600 via-yellow-700 to-slate-900',
      watermark: 'CIVIL',
      glow: 'bg-amber-500/20',
      gridOpacity: 'opacity-10'
    };
  }
  return {
    gradient: 'from-purple-600 via-violet-800 to-slate-900',
    watermark: 'NOTES',
    glow: 'bg-purple-500/20',
    gridOpacity: 'opacity-10'
  };
};

const DocumentCover = ({ resource, isBookmarked, handleBookmark }) => {
  const { label, icon } = getFileTypeBadge(resource.file_type);
  const { gradient, watermark, glow, gridOpacity } = getBranchTheme(resource.branch);

  return (
    <div className={`relative h-40 w-full bg-gradient-to-br ${gradient} overflow-hidden select-none transition-all duration-300`}>
      {/* 3D Binder Spine Binding on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/45 via-white/10 to-transparent border-r border-white/5 z-20 shadow-[1px_0_4px_rgba(0,0,0,0.35)]"></div>
      
      {/* Binding spiral dots for realistic look */}
      <div className="absolute left-0.5 top-0 bottom-0 w-1.5 flex flex-col justify-around py-2 z-30 opacity-70 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-slate-950/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"></div>
        ))}
      </div>

      {/* Grid Pattern Background */}
      <div className={`absolute inset-0 ${gridOpacity} bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] [background-size:14px_14px] pointer-events-none`}></div>
      
      {/* Neon Radial Glow Blurs */}
      <div className={`absolute -top-12 -right-12 h-28 w-28 rounded-full ${glow} blur-2xl pointer-events-none animate-pulse`}></div>
      <div className={`absolute -bottom-12 left-6 h-28 w-28 rounded-full ${glow} blur-2xl pointer-events-none`}></div>

      {/* Huge Rotated Watermark in the background */}
      <div className="absolute -bottom-4 right-1 text-7xl font-black text-white/[0.045] rotate-12 uppercase tracking-tighter select-none font-sans pointer-events-none">
        {watermark}
      </div>

      {/* Top controls: Bookmark button */}
      <button
        onClick={handleBookmark}
        className="absolute top-3 left-4 bg-black/40 hover:bg-black/85 text-white p-1.5 rounded-full border border-white/5 hover:border-white/10 transition-colors z-20"
      >
        {isBookmarked ? <FaBookmark className="text-violet-400" size={10} /> : <FaRegBookmark size={10} />}
      </button>

      {/* Header labels: Branch & Sem */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        <span className="text-[9px] font-black bg-[#050811]/60 text-white/90 border border-white/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
          Sem {resource.semester}
        </span>
      </div>

      {/* Center Layout: textbook details */}
      <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-3.5 pl-6 pr-4 z-10 text-left">
        {/* Subject Title */}
        <div className="space-y-0.5 pr-2">
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-white/50 block">
            {resource.branch || 'General'} Courseware
          </span>
          <h4 className="text-sm font-black text-white tracking-tight leading-snug line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
            {resource.subject}
          </h4>
        </div>
        
        {/* Footer info inside the cover */}
        <div className="flex justify-between items-end border-t border-white/10 pt-2 mr-1">
          <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-[9px] font-extrabold text-white/70 uppercase tracking-wider">
              {label}
            </span>
          </div>
          
          {/* Subtle logo accent */}
          <span className="text-[7px] text-white/30 font-black tracking-widest uppercase select-none">
            SMARTSHARE
          </span>
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ resource, onBookmarkToggle }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(resource.is_bookmarked);
  const [downloadCount, setDownloadCount] = useState(resource.downloads);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to bookmark resources');
      return;
    }
    try {
      const res = await resourceAPI.bookmark(resource.id);
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
      if (onBookmarkToggle) {
        onBookmarkToggle(resource.id, res.data.bookmarked);
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const res = await resourceAPI.download(resource.id);
      setDownloadCount(prev => prev + 1);
      window.open(res.data.download_url, '_blank');
      toast.success('Download starting...');
    } catch (err) {
      toast.error('Failed to trigger download');
    }
  };

  const handleCardClick = () => {
    navigate(`/resources/${resource.id}`);
  };

  const uploaderAvatar = resource.uploaded_by?.avatar || null;
  const uploaderName = resource.uploaded_by?.username || 'Student';

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-[#0e1322] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-violet-950/20 hover:border-violet-500/35 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
    >
      <DocumentCover 
        resource={resource} 
        isBookmarked={isBookmarked} 
        handleBookmark={handleBookmark} 
      />

      {/* Card Info Body */}
      <div className="p-5 flex-grow flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50 dark:from-[#0e1322] dark:to-[#0a0d18] transition-colors duration-300">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
            {resource.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed h-10">
            {resource.description || 'No description provided.'}
          </p>

          {/* Author/uploader info line */}
          <div className="flex items-center gap-2 mb-4">
            {uploaderAvatar ? (
              <img src={uploaderAvatar} alt={uploaderName} className="h-5 w-5 rounded-full object-cover border border-slate-200 dark:border-slate-700/50" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold capitalize">
                {uploaderName[0]}
              </div>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
              by <span className="text-slate-700 dark:text-slate-200 font-semibold">{uploaderName}</span> • {resource.branch} Sem {resource.semester}
            </span>
          </div>
        </div>

        {/* Footer Details: stats + download action */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1 text-xs">
              <FaDownload size={9} className="text-slate-400 dark:text-slate-500" />
              <span className="font-semibold text-slate-500 dark:text-slate-400">{downloadCount >= 1000 ? `${(downloadCount / 1000).toFixed(1)}k` : downloadCount}</span>
            </span>
          </div>

          <button
            onClick={handleDownload}
            className="bg-violet-600/10 hover:bg-violet-600 border border-violet-500/25 hover:border-violet-500 text-violet-600 dark:text-violet-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded transition-smooth hover:shadow-lg hover:shadow-violet-500/20 active:scale-95 cursor-pointer"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
