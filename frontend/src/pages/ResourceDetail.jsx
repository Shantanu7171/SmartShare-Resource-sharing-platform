import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaDownload, FaRegBookmark, FaBookmark, FaStar, 
  FaComments, FaUser, FaClock, FaTags, FaFileAlt,
  FaFilePdf, FaFileWord, FaFileImage, FaFilePowerpoint
} from 'react-icons/fa';
import { resourceAPI, reviewAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'pdf': return <FaFilePdf className="text-red-500 dark:text-red-400 text-5xl" />;
    case 'doc': return <FaFileWord className="text-blue-500 dark:text-blue-400 text-5xl" />;
    case 'image': return <FaFileImage className="text-emerald-500 dark:text-emerald-400 text-5xl" />;
    case 'ppt': return <FaFilePowerpoint className="text-amber-500 dark:text-amber-400 text-5xl" />;
    default: return <FaFileAlt className="text-gray-500 dark:text-slate-400 text-5xl" />;
  }
};

const ResourceDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();

  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchResourceAndReviews();
  }, [id]);

  const fetchResourceAndReviews = async () => {
    try {
      setLoading(true);
      const [resData, reviewsData] = await Promise.all([
        resourceAPI.getOne(id),
        reviewAPI.listByResource(id),
      ]);
      setResource(resData.data);
      setIsBookmarked(resData.data.is_bookmarked);
      setReviews(reviewsData.data.results || reviewsData.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resource details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark resources.');
      return;
    }
    try {
      const res = await resourceAPI.bookmark(id);
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) {
      toast.error('Failed to bookmark resource.');
    }
  };

  const handleDownload = async () => {
    try {
      const res = await resourceAPI.download(id);
      
      // Update local download count
      setResource(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);

      // Open file URL or trigger download
      window.open(res.data.download_url, '_blank');
      toast.success('Download starting...');
    } catch (err) {
      toast.error('Failed to trigger download.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to leave a review.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please provide a comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewAPI.create({
        resource: parseInt(id),
        rating,
        comment,
      });
      toast.success('Review submitted! +2 points earned');
      setComment('');
      setRating(5);
      
      // Reload resource details (ratings update) and reviews list
      const [resData, reviewsData] = await Promise.all([
        resourceAPI.getOne(id),
        reviewAPI.listByResource(id),
      ]);
      setResource(resData.data);
      setReviews(reviewsData.data.results || reviewsData.data || []);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.non_field_errors?.[0] || 
                     err.response?.data?.detail || 
                     'You have already reviewed this resource.';
      toast.error(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-xl font-bold text-gray-700 dark:text-slate-300">Resource not found</p>
        <Link to="/feed" className="text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block font-semibold">Return to Feed</Link>
      </div>
    );
  }

  const uploaderName = resource.uploaded_by?.username || 'Peer User';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      {/* Title block */}
      <div className="bg-white dark:bg-[#0d1222]/90 border border-gray-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-md">{resource.branch}</span>
            <span className="text-sm font-bold bg-purple-50 dark:bg-violet-950/40 text-purple-700 dark:text-violet-400 px-3 py-1 rounded-md">Semester {resource.semester}</span>
            <span className="text-sm font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-md capitalize">{resource.file_type}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-tight">{resource.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <FaUser size={11} />
              <span>Uploaded by <span className="font-semibold text-gray-700 dark:text-slate-200">{uploaderName}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock size={11} />
              <span>{new Date(resource.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleBookmarkToggle}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900/60 px-5 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {isBookmarked ? (
              <>
                <FaBookmark className="text-primary-600 dark:text-primary-400 animate-pulse" />
                <span>Bookmarked</span>
              </>
            ) : (
              <>
                <FaRegBookmark className="text-gray-400 dark:text-slate-500" />
                <span>Bookmark</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <FaDownload />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details and Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* File Preview Card */}
          <div className="bg-white dark:bg-[#0d1222]/90 border border-gray-100 dark:border-slate-800/80 p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
            <div className="p-5 bg-gray-50 dark:bg-slate-900/65 rounded-2xl">
              {getFileIcon(resource.file_type)}
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 dark:text-white text-lg">{resource.title}</h3>
              <p className="text-sm text-gray-400 dark:text-slate-400 mt-1">Subject: {resource.subject}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
              Previews are disabled for this type. Click the download button above to retrieve the full file document.
            </p>
            <button 
              onClick={handleDownload}
              className="px-5 py-2.5 bg-gray-50 dark:bg-slate-900/60 hover:bg-gray-100 dark:hover:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FaDownload size={12} />
              <span>Download File</span>
            </button>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-[#0d1222]/90 border border-gray-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-gray-800 dark:text-white">Resource Description</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {resource.description || 'No description provided for this resource.'}
            </p>
            {resource.tags && (
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800/80 flex items-start gap-2">
                <FaTags className="text-gray-400 dark:text-slate-500 mt-1" size={14} />
                <div className="flex flex-wrap gap-1.5">
                  {resource.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="text-sm bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/60 px-2.5 py-0.5 rounded text-gray-600 dark:text-slate-400 font-semibold">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white dark:bg-[#0d1222]/90 border border-gray-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
              <FaComments className="text-secondary-500" />
              <span>Reviews ({reviews.length})</span>
            </h3>

            <div className="space-y-4 divide-y divide-gray-50 dark:divide-slate-800/40">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 py-4">No reviews yet. Be the first to leave feedback!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center text-xs font-bold">
                          {rev.user?.username?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{rev.user?.username}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(rev.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StarRating rating={rev.rating} size={12} readOnly />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 pl-9 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Submit Review */}
        <div className="space-y-6">
          {/* Uploader Details */}
          <div className="bg-white dark:bg-[#0d1222]/90 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Shared By</h4>
            <div className="flex items-center gap-3">
              {resource.uploaded_by?.avatar ? (
                <img src={resource.uploaded_by.avatar} alt={uploaderName} className="h-10 w-10 rounded-full object-cover border border-primary-200 dark:border-primary-900" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-sm capitalize">
                  {uploaderName[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{uploaderName}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 capitalize">{resource.uploaded_by?.role || 'Contributor'}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-slate-800/80 pt-3 flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400 font-medium">Contributor Points:</span>
              <span className="font-extrabold text-secondary-600 dark:text-secondary-400">{resource.uploaded_by?.points || 0} pts</span>
            </div>
          </div>

          {/* Average Rating Stats */}
          <div className="bg-white dark:bg-[#0d1222]/90 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Average Rating</h4>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-gray-800 dark:text-white">{resource.avg_rating.toFixed(1)}</span>
              <div className="space-y-0.5">
                <StarRating rating={resource.avg_rating} size={14} readOnly />
                <span className="text-xs text-gray-400 dark:text-slate-400 font-semibold block">{reviews.length} ratings submitted</span>
              </div>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="bg-white dark:bg-[#0d1222]/90 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Add Your Review</h4>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-500 dark:text-slate-400 block">Rating</label>
                  <StarRating rating={rating} onRatingChange={setRating} readOnly={false} size={18} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-500 dark:text-slate-400 block">Your Comment</label>
                  <textarea
                    required
                    placeholder="Write a helpful review..."
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-[#0d1222] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none text-slate-800 dark:text-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl p-3 border border-dashed border-gray-200 dark:border-slate-800">
                <p className="text-sm text-gray-500 dark:text-slate-400">You must be logged in to review this file.</p>
                <Link to="/login" className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline mt-1.5 block">Login Now</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
