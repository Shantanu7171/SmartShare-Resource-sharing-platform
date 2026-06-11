import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBookReader, FaCloudUploadAlt, FaUsers, FaDownload,
  FaBook, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';
import { resourceAPI, authAPI } from '../api/axios';
import ResourceCard from '../components/ResourceCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Home = () => {
  const [resources, setResources] = useState([]);
  const [displayedResources, setDisplayedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const [topContributors, setTopContributors] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [heroResources, setHeroResources] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const res = await resourceAPI.getAll({ status: 'approved' });
        const list = res.data.results || res.data || [];
        setResources(list);

        const trendingList = [...list].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        setDisplayedResources(trendingList.slice(0, 4));
        setHeroResources(trendingList.slice(0, 3));
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchContributors = async () => {
      try {
        setLoadingContributors(true);
        const contribRes = await authAPI.getLeaderboard();
        setTopContributors(contribRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching leaderboard in home', err);
      } finally {
        setLoadingContributors(false);
      }
    };

    fetchHomeData();
    fetchContributors();
  }, []);

  useEffect(() => {
    if (resources.length === 0) return;

    let sorted = [...resources];
    if (activeTab === 'trending') {
      sorted.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    setDisplayedResources(sorted.slice(0, 4));
  }, [activeTab, resources]);

  return (
    <div className="relative min-h-screen flex flex-col space-y-16 pb-16 overflow-hidden transition-colors duration-300">
      {/* Background glow graphics */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Info & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 uppercase">
              ✦ Now optimized for Semester Finals 2026
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white transition-colors">
              The Ultimate College <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-400 dark:via-pink-400 dark:to-indigo-300 drop-shadow-sm animate-pulse">
                Study Vault
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
              Access a crowdsourced library of premium lecture notes, previous year question papers, and interactive guides shared by top-performing students across the globe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
              <Link
                to="/feed"
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-full hover:shadow-xl hover:shadow-violet-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Browse Study Material</span>
                <FaArrowRight size={10} />
              </Link>
              <Link
                to="/upload"
                className="w-full sm:w-auto px-7 py-3 bg-white dark:bg-[#0d1222]/80 hover:bg-slate-50 dark:hover:bg-[#12192e]/80 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-full border border-slate-200 dark:border-slate-800 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <FaCloudUploadAlt size={13} className="text-violet-600 dark:text-violet-400" />
                <span>Share a Resource</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Floating 3D-styled Preview Card matching user image */}
          <div className="lg:col-span-5 flex justify-center items-center py-8" style={isMobile ? {} : { perspective: '1200px' }}>
            <div
              className="relative w-full max-w-[360px] aspect-[1/1] bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-[#0c1324]/80 dark:to-[#0e162d]/95 border border-slate-200/80 dark:border-slate-700/40 p-6 rounded-[32px] shadow-2xl dark:shadow-blue-950/20 flex flex-col justify-between select-none transition-all duration-500 hover:border-violet-500/40 dark:hover:border-violet-500/40 group animate-float"
              style={isMobile ? {
                boxShadow: '0 15px 30px rgba(59, 130, 246, 0.08)',
              } : {
                transform: 'rotateX(12deg) rotateY(-18deg) rotateZ(6deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '0 30px 80px -15px rgba(59, 130, 246, 0.15), inset 0 1px 1px rgba(255,255,255,0.4)',
              }}
            >
              {/* Radial gradient background highlights for glowing effects */}
              <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-violet-500/10 dark:bg-violet-500/20 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl pointer-events-none"></div>

              {/* Top header decoration */}
              <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800/40 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>System Live</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1 w-2 bg-slate-300 dark:bg-slate-700 rounded-sm"></span>
                  <span className="h-1 w-3 bg-slate-300 dark:bg-slate-700 rounded-sm"></span>
                  <span className="h-1.5 w-4 bg-violet-500 rounded-sm"></span>
                </div>
              </div>

              {/* The Three Vertical Glowing Cards */}
              <div className="flex justify-between gap-3 relative z-10 py-6">
                {[0, 1, 2].map((idx) => {
                  const res = heroResources[idx];
                  if (res) {
                    let rankClass = '';
                    let borderClass = '';
                    let textClass = '';
                    if (idx === 0) {
                      rankClass = 'bg-purple-100 dark:bg-purple-600/30 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/25';
                      borderClass = 'from-purple-100/30 to-violet-50/20 dark:from-purple-500/15 dark:via-purple-600/10 dark:to-violet-950/20 border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400';
                      textClass = 'text-purple-600 dark:text-purple-300/80';
                    } else if (idx === 1) {
                      rankClass = 'bg-blue-100 dark:bg-blue-600/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/25';
                      borderClass = 'from-blue-100/30 to-indigo-50/20 dark:from-blue-500/15 dark:via-blue-600/10 dark:to-indigo-950/20 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-400';
                      textClass = 'text-blue-600 dark:text-blue-300/80';
                    } else {
                      rankClass = 'bg-pink-100 dark:bg-pink-600/30 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-500/25';
                      borderClass = 'from-pink-100/30 to-purple-50/20 dark:from-pink-500/15 dark:via-pink-600/10 dark:to-purple-950/20 border-pink-200 dark:border-pink-500/30 hover:border-pink-400 dark:hover:border-pink-400';
                      textClass = 'text-pink-600 dark:text-pink-300/80';
                    }

                    return (
                      <Link
                        to={`/resources/${res.id}`}
                        key={res.id}
                        className={`flex-1 bg-gradient-to-b ${borderClass} rounded-2xl p-3 flex flex-col justify-between items-center text-center h-40 transition-all duration-300 cursor-pointer`}
                      >
                        <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md border uppercase ${rankClass}`}>
                          {res.branch}
                        </span>
                        <div className="my-2">
                          <p className="text-xs font-black text-slate-800 dark:text-white leading-snug line-clamp-2">{res.title}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1">Sem {res.semester}</p>
                        </div>
                        <span className={`text-[9px] font-bold ${textClass}`}>{res.downloads || 0} dl</span>
                      </Link>
                    );
                  } else {
                    let rankClass = '';
                    let borderClass = '';
                    let branch = '';
                    if (idx === 0) {
                      branch = 'CSE';
                      rankClass = 'bg-purple-100 dark:bg-purple-600/30 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/20';
                      borderClass = 'from-purple-100/20 to-transparent dark:from-purple-500/5 dark:via-purple-950/10 dark:to-transparent border-purple-200 dark:border-purple-500/20 border-dashed hover:border-purple-400/55 dark:hover:border-purple-400/55';
                    } else if (idx === 1) {
                      branch = 'ECE';
                      rankClass = 'bg-blue-100 dark:bg-blue-600/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/20';
                      borderClass = 'from-blue-100/20 to-transparent dark:from-blue-500/5 dark:via-indigo-950/10 dark:to-transparent border-blue-200 dark:border-blue-500/20 border-dashed hover:border-blue-400/55 dark:hover:border-blue-400/55';
                    } else {
                      branch = 'IT';
                      rankClass = 'bg-pink-100 dark:bg-pink-600/30 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-500/20';
                      borderClass = 'from-pink-100/20 to-transparent dark:from-pink-500/5 dark:via-purple-950/10 dark:to-transparent border-pink-200 dark:border-pink-500/20 border-dashed hover:border-pink-400/55 dark:hover:border-pink-400/55';
                    }

                    return (
                      <Link
                        to="/upload"
                        key={`empty-hero-${idx}`}
                        className={`flex-1 bg-gradient-to-b ${borderClass} border rounded-2xl p-3 flex flex-col justify-between items-center text-center h-40 transition-all duration-300 cursor-pointer`}
                      >
                        <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md border uppercase ${rankClass}`}>
                          {branch}
                        </span>
                        <div className="my-2 space-y-1">
                          <p className="text-[11px] font-extrabold text-slate-800 dark:text-white/90 leading-tight">Claim Slot!</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-tight">Be the first to upload</p>
                        </div>
                        <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400/80 animate-pulse">Upload ✦</span>
                      </Link>
                    );
                  }
                })}
              </div>

              {/* Lower Search Pill */}
              <div className="w-full bg-slate-100/80 dark:bg-[#070b14]/90 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-2xl text-center flex items-center justify-center shadow-inner relative z-10 transition-colors">
                <span className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 dark:from-violet-400 dark:to-pink-400 tracking-wide truncate">
                  ✦ {heroResources[0]?.title || 'Quantum Physics Lecture Notes'}
                </span>
              </div>

              {/* Bottom indicators matching user image */}
              <div className="relative z-10 border-t border-slate-200 dark:border-slate-800/60 pt-4 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 transition-colors">
                <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Verified Content</span>
                <div className="flex gap-1.5 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-left">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Top Contributors</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Top performing peers sharing notes and final study resources.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingContributors ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-[#0c1122]/70 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl animate-pulse flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            [0, 1, 2].map((idx) => {
              const contributor = topContributors[idx];
              if (contributor) {
                let rankLabel = '';
                let rankClass = '';
                let borderClass = '';
                if (idx === 0) {
                  rankLabel = '🏆 1st Rank';
                  rankClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
                  borderClass = 'border-amber-400/30 dark:border-amber-400/20 hover:border-amber-400/50 hover:shadow-amber-500/5';
                } else if (idx === 1) {
                  rankLabel = '🥈 2nd Rank';
                  rankClass = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
                  borderClass = 'border-slate-400/30 dark:border-slate-800 hover:border-slate-500/40 hover:shadow-slate-500/5';
                } else {
                  rankLabel = '🥉 3rd Rank';
                  rankClass = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
                  borderClass = 'border-orange-400/30 dark:border-orange-900/40 hover:border-orange-500/40 hover:shadow-orange-500/5';
                }

                return (
                  <div
                    key={contributor.id}
                    className={`bg-white dark:bg-[#0c1122]/70 border p-6 rounded-2xl flex items-center gap-5 hover:translate-y-[-2px] transition-all duration-300 hover:shadow-lg ${borderClass}`}
                  >
                    {contributor.avatar ? (
                      <img src={contributor.avatar} alt={contributor.username} className="h-14 w-14 rounded-full object-cover border-2 border-violet-500/20" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl capitalize shadow-inner shadow-black/10">
                        {contributor.username?.[0] || 'U'}
                      </div>
                    )}
                    <div className="text-left">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${rankClass}`}>
                        {rankLabel}
                      </span>
                      <span className="text-lg font-black text-slate-800 dark:text-white block mt-1">{contributor.username}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5 block">
                        {contributor.branch || 'Student'} • {contributor.total_uploads || 0} uploads
                      </span>
                      <span className="text-xs text-violet-600 dark:text-violet-400 font-bold block mt-1">
                        {contributor.points || 0} Points
                      </span>
                    </div>
                  </div>
                );
              } else {
                let rankLabel = idx === 0 ? '1st Rank Slot' : idx === 1 ? '2nd Rank Slot' : '3rd Rank Slot';
                return (
                  <div
                    key={`empty-${idx}`}
                    className="bg-white dark:bg-[#0c1122]/40 border border-dashed border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-5 opacity-70"
                  >
                    <div className="h-14 w-14 rounded-full border border-dashed border-slate-350 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 font-bold text-xl">
                      ?
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{rankLabel}</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300 mt-1">Claim this place!</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Upload notes to rank here.</p>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Featured Resources</h2>
            <p className="text-sm text-slate-500 font-medium">The most helpful materials picked by our community this week.</p>
          </div>

          {/* Trending vs New Arrivals selector */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-1 text-xs font-extrabold uppercase tracking-wider transition-colors">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-1.5 rounded transition-smooth cursor-pointer ${activeTab === 'trending' ? 'bg-white dark:bg-violet-600 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('new_arrivals')}
              className={`px-4 py-1.5 rounded transition-smooth cursor-pointer ${activeTab === 'new_arrivals' ? 'bg-white dark:bg-violet-600 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : displayedResources.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0d1222]/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 transition-colors duration-300">
            <FaBookReader className="text-4xl text-slate-400 dark:text-slate-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">No resources found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Be the first to upload and share study notes for your department!</p>
            <Link to="/upload" className="inline-block mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-full">
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}

        {/* View All Resources Button */}
        {resources.length > 4 && (
          <div className="flex justify-center pt-10">
            <Link
              to="/feed"
              className="px-6 py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm font-semibold rounded-lg transition-smooth active:scale-95"
            >
              View All Resources
            </Link>
          </div>
        )}
      </section>

      {/* Purple Contributor CTA Banner */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-violet-500/20 shadow-violet-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>

          <div className="space-y-4 max-w-xl text-left relative z-10">
            <span className="text-xs font-semibold uppercase tracking-widest bg-white/15 text-white border border-white/20 px-2.5 py-0.5 rounded-full">
              Become a Top Contributor and Earn Exclusive Perks
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Join the ranks of thousands of students helping each other succeed. Share your best resources and unlock premium features.
            </h3>
            <div className="pt-2">
              <Link
                to="/upload"
                className="inline-flex items-center bg-white hover:bg-slate-50 text-violet-600 text-sm font-semibold px-6 py-3 rounded-full hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-center"
              >
                Get Started Today
              </Link>
            </div>
          </div>

          {/* Overlapping contributor avatars */}
          <div className="flex items-center relative z-10">
            <div className="flex -space-x-3 overflow-hidden">
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-violet-600 bg-gradient-to-tr from-pink-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs select-none">A</div>
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-violet-600 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs select-none">B</div>
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-violet-600 bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">C</div>
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-violet-600 bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs select-none">D</div>
              <div className="inline-block h-10 w-10 rounded-full ring-2 ring-violet-600 bg-slate-900 border border-violet-500 text-violet-400 flex items-center justify-center font-bold text-xs">12k+</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
