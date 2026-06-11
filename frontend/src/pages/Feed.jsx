import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaRedo, FaChevronLeft, FaChevronRight, 
  FaThLarge, FaList 
} from 'react-icons/fa';
import { resourceAPI, authAPI } from '../api/axios';
import ResourceCard from '../components/ResourceCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuthStore } from '../store/authStore';

const Feed = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState('');
  const [fileType, setFileType] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [university, setUniversity] = useState('');
  const [universitiesList, setUniversitiesList] = useState([]);
  const [college, setCollege] = useState('');
  const [collegesList, setCollegesList] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const renderFilters = () => (
    <>
      {/* Branch Checkboxes */}
      <div className="space-y-2.5 text-left">
        <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">Department</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={branch === 'CSE'}
              onChange={() => handleBranchToggle('CSE')}
              className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Computer Science (CSE)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={branch === 'IT'}
              onChange={() => handleBranchToggle('IT')}
              className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Information Technology (IT)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={branch === 'ECE'}
              onChange={() => handleBranchToggle('ECE')}
              className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Electronics (ECE)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={branch === 'MECH'}
              onChange={() => handleBranchToggle('MECH')}
              className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Mechanical Eng.</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={branch === 'CIVIL'}
              onChange={() => handleBranchToggle('CIVIL')}
              className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Civil Eng.</span>
          </label>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="space-y-2 text-left">
        <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">Semester</label>
        <select
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setPage(1); }}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 outline-none text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>
      </div>

      {/* University Selector */}
      <div className="space-y-2 text-left">
        <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">University</label>
        <select
          value={university}
          onChange={(e) => { setUniversity(e.target.value); setPage(1); }}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 outline-none text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
        >
          <option value="">All Universities</option>
          {universitiesList.map((uni) => (
            <option key={uni} value={uni}>{uni}</option>
          ))}
        </select>
      </div>

      {/* College Selector */}
      <div className="space-y-2 text-left">
        <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">College Name</label>
        <select
          value={college}
          onChange={(e) => { setCollege(e.target.value); setPage(1); }}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 outline-none text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
        >
          <option value="">All Colleges</option>
          {collegesList.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {/* File Format Badge Filters */}
      <div className="space-y-2 text-left">
        <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">File Format</label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleFileTypeToggle('pdf')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-smooth cursor-pointer ${fileType === 'pdf' ? 'bg-violet-600 border-violet-500 text-white shadow shadow-violet-500/10' : 'bg-slate-100 dark:bg-[#080d1a] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            PDF
          </button>
          <button
            onClick={() => handleFileTypeToggle('ppt')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-smooth cursor-pointer ${fileType === 'ppt' ? 'bg-violet-600 border-violet-500 text-white shadow shadow-violet-500/10' : 'bg-slate-100 dark:bg-[#080d1a] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            PPTX
          </button>
          <button
            onClick={() => handleFileTypeToggle('doc')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-smooth cursor-pointer ${fileType === 'doc' ? 'bg-violet-600 border-violet-500 text-white shadow shadow-violet-500/10' : 'bg-slate-100 dark:bg-[#080d1a] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
          >
            DOCX
          </button>
        </div>
      </div>

      {/* Sort Radios */}
      <div className="space-y-2 text-left">
        <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block">Sort By</label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="radio"
              name="ordering"
              checked={ordering === '-created_at'}
              onChange={() => { setOrdering('-created_at'); setPage(1); }}
              className="border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Most Recent</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="radio"
              name="ordering"
              checked={ordering === '-avg_rating'}
              onChange={() => { setOrdering('-avg_rating'); setPage(1); }}
              className="border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Highly Rated</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 dark:text-slate-300 select-none">
            <input
              type="radio"
              name="ordering"
              checked={ordering === '-downloads'}
              onChange={() => { setOrdering('-downloads'); setPage(1); }}
              className="border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080d1a] text-violet-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Most Downloads</span>
          </label>
        </div>
      </div>
    </>
  );

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [uniRes, colRes] = await Promise.all([
          authAPI.getUniversities(),
          authAPI.getColleges()
        ]);
        setUniversitiesList(uniRes.data || []);
        setCollegesList(colRes.data || []);
      } catch (err) {
        console.error('Error fetching filter options', err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null) {
      setSearchText(q);
      setSearch(q);
      setPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const q = params.get('search');
      if (q === null || searchText !== q) {
        setSearch(searchText);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, location.search]);

  useEffect(() => {
    fetchResources();
  }, [search, branch, semester, fileType, ordering, page, university, college]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        status: 'approved',
        search: search || undefined,
        branch: branch || undefined,
        semester: semester || undefined,
        file_type: fileType || undefined,
        ordering: ordering || undefined,
        uploaded_by__university: university || undefined,
        uploaded_by__college: college || undefined,
      };

      const res = await resourceAPI.getAll(params);
      
      if (res.data.results) {
        setResources(res.data.results);
        setCount(res.data.count);
      } else {
        setResources(res.data);
        setCount(res.data.length);
      }
    } catch (err) {
      console.error('Error loading feed resources', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSearch('');
    setBranch('');
    setSemester('');
    setFileType('');
    setUniversity('');
    setCollege('');
    setOrdering('-created_at');
    setPage(1);
  };

  const handleBranchToggle = (value) => {
    setBranch(prev => (prev === value ? '' : value));
    setPage(1);
  };

  const handleFileTypeToggle = (value) => {
    setFileType(prev => (prev === value ? '' : value));
    setPage(1);
  };

  const totalPages = Math.ceil(count / 12) || 1;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const getBranchLabel = () => {
    switch (branch) {
      case 'CSE': return 'Computer Science';
      case 'ECE': return 'Electronics';
      case 'MECH': return 'Mechanical Engineering';
      case 'CIVIL': return 'Civil Engineering';
      case 'IT': return 'Information Technology';
      default: return 'All Departments';
    }
  };

  const getPageNumbers = () => {
    const list = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else {
      if (page <= 3) {
        list.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        list.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        list.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return list;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      {/* Header and Search Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Academic Resources</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Showing {count} results for <span className="text-violet-600 dark:text-violet-400 font-semibold">{getBranchLabel()}</span>
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
            <FaSearch size={12} />
          </span>
          <input
            type="text"
            placeholder="Search by title, subject, tags..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Mobile Filters Toggle Button */}
      <div className="lg:hidden flex items-center justify-between bg-white dark:bg-[#0d1222]/90 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Narrow search results:</span>
        <button 
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-violet-500/10 active:scale-95 cursor-pointer"
        >
          <FaFilter size={10} />
          <span>Filters & Sort</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block bg-white dark:bg-[#0d1222]/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-2xl h-fit space-y-6 transition-colors duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/40">
            <span className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FaFilter size={10} className="text-violet-600 dark:text-violet-400" />
              <span>Filters</span>
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <FaRedo size={8} />
              <span>Clear all</span>
            </button>
          </div>
          {renderFilters()}
        </div>

        {/* Resources Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest pb-2">
            <span>Found {count} Resources</span>
            <div className="flex items-center gap-4">
              {/* View layouts */}
              <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-900 pr-4">
                <span className="text-xs text-slate-400 font-semibold lowercase">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'text-violet-600 dark:text-violet-400 bg-slate-100 dark:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FaThLarge size={11} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded cursor-pointer ${viewMode === 'list' ? 'text-violet-600 dark:text-violet-400 bg-slate-100 dark:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FaList size={11} />
                </button>
              </div>
              <span>Page {page} of {totalPages}</span>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : resources.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#0d1222]/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg dark:shadow-2xl">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No resources found</p>
              <p className="text-xs text-slate-400 mt-1">Try expanding your search query or removing active filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "flex flex-col gap-4"
            }>
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}

          {/* Numerical Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200 dark:border-slate-900">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 transition-colors cursor-pointer"
              >
                <FaChevronLeft size={10} />
              </button>

              <div className="flex items-center gap-1.5">
                {getPageNumbers().map((num, idx) => {
                  if (num === '...') {
                    return (
                      <span key={`dots-${idx}`} className="text-slate-400 dark:text-slate-600 text-sm px-2 select-none">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={`page-${num}`}
                      onClick={() => setPage(num)}
                      className={`h-8 w-8 text-sm font-bold rounded-lg transition-all cursor-pointer ${page === num ? 'bg-violet-600 text-white shadow shadow-violet-500/20' : 'bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 transition-colors cursor-pointer"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-end lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
            onClick={() => setShowMobileFilters(false)} 
          />
          
          {/* Drawer Panel */}
          <div className="bg-white dark:bg-[#0c1121] border-l border-slate-200 dark:border-slate-800 h-full w-full max-w-sm p-6 shadow-2xl relative flex flex-col justify-between text-left animate-slideInRight z-10 text-slate-800 dark:text-slate-100 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-2">
                  <FaFilter size={10} className="text-violet-600 dark:text-violet-400" />
                  <span>Filters</span>
                </span>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {renderFilters()}
              </div>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6 flex gap-3">
              <button 
                onClick={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 xs:text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                Clear All
              </button>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white xs:text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-md shadow-violet-500/15"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
