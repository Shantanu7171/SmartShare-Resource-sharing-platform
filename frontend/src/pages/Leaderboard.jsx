import React, { useEffect, useState } from 'react';
import { FaTrophy, FaMedal, FaStar, FaUpload, FaChevronRight } from 'react-icons/fa';
import { authAPI } from '../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Helper to get beautiful colored badges based on department name
const getBranchBadgeColor = (branch) => {
  const b = (branch || '').toUpperCase();
  if (b.includes('COMPUTER') || b.includes('CSE')) {
    return 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/40';
  }
  if (b.includes('ELECTRONICS') || b.includes('ECE')) {
    return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
  }
  if (b.includes('IT') || b.includes('INFORMATION')) {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40';
  }
  if (b.includes('MECH') || b.includes('MECHANICAL')) {
    return 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40';
  }
  if (b.includes('CIVIL')) {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
  }
  if (b.includes('BIO') || b.includes('ENG')) {
    return 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/40';
  }
  if (b.includes('MATH')) {
    return 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800';
  }
  if (b.includes('ECON')) {
    return 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/40';
  }
  if (b.includes('HIST')) {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
  }
  if (b.includes('PHYSICS') || b.includes('ASTRO')) {
    return 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900/40';
  }
  return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40';
};

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getLeaderboard();
      setLeaders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  const first = leaders[0] || null;
  const second = leaders[1] || null;
  const third = leaders[2] || null;
  const tableLeaders = leaders.slice(3);

  const formatPoints = (pts) => {
    if (!pts) return '0';
    return pts >= 1000 ? `${(pts / 1000).toFixed(1)}k` : pts.toLocaleString();
  };

  return (
    <div className="relative min-h-screen px-4 sm:px-6 lg:px-8 py-10 space-y-12 overflow-hidden transition-colors duration-300">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-violet-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/5 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Top Contributors</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
          Celebrating the minds that empower our academic community. Your contributions build the foundation for collective success.
        </p>
      </div>

      {loading ? (
        <div className="relative z-10 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      ) : leaders.length === 0 ? (
        /* Empty State */
        <div className="relative z-10 max-w-lg mx-auto text-center space-y-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center py-16 transition-all duration-300">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 shadow-inner">
            <FaTrophy size={36} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">No Contributors Yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Be the first to share academic resources, support your peers, and take the top spot on the leaderboard!
            </p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl hover:shadow-violet-950/20 active:scale-[0.98] transition-all duration-300"
          >
            <FaUpload size={12} />
            <span>Upload Your First Resource</span>
          </Link>
        </div>
      ) : (
        <div className="relative z-10 space-y-12">
          {/* Podium Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6 select-none">
            {/* Rank 2 (Left) */}
            {second ? (
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col items-center space-y-4 text-center order-2 md:order-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-lg dark:shadow-none hover:shadow-violet-950/5">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xl ring-2 ring-slate-300 dark:ring-slate-600 border-2 border-white dark:border-slate-900 overflow-hidden shadow-lg shadow-slate-500/10">
                    {second.avatar ? (
                      <img src={second.avatar} alt={second.username} className="h-full w-full object-cover" />
                    ) : (
                      <span>{second.username ? second.username[0].toUpperCase() : '?'}</span>
                    )}
                  </div>
                  {/* Silver badge */}
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 border border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                    <FaMedal className="text-slate-100 text-xs" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{second.username}</h3>
                  <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest mt-1">{second.branch || 'N/A'}</p>
                </div>
                {/* Stat Boxes */}
                <div className="flex gap-2 w-full text-xs font-bold">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 py-2 rounded-xl text-slate-600 dark:text-slate-400 transition-colors">
                    <p className="text-slate-900 dark:text-white text-sm">{second.total_uploads || 0}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mt-0.5">Uploads</p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 py-2 rounded-xl text-slate-600 dark:text-slate-400 transition-colors">
                    <p className="text-violet-600 dark:text-violet-400 text-sm">{formatPoints(second.points)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mt-0.5">Points</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Dotted Placeholder card */
              <div className="relative bg-slate-50/20 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col items-center space-y-4 text-center order-2 md:order-1 opacity-70 hover:opacity-100 transition-all duration-300 shadow-sm">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 flex items-center justify-center font-bold text-xl border border-dashed border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner">
                    <span>?</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                    <FaMedal className="text-slate-400 dark:text-slate-600 text-xs" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-400 dark:text-slate-500 leading-tight">Claim 2nd Place!</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-600 font-extrabold uppercase tracking-widest mt-1">YOUR BRANCH</p>
                </div>
                <div className="flex gap-2 w-full text-xs font-bold">
                  <div className="flex-1 bg-transparent border border-dashed border-slate-200 dark:border-slate-800/60 py-2 rounded-xl text-slate-400 dark:text-slate-600">
                    <p className="text-sm">-</p>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5">Uploads</p>
                  </div>
                  <div className="flex-1 bg-transparent border border-dashed border-slate-200 dark:border-slate-800/60 py-2 rounded-xl text-slate-400 dark:text-slate-600">
                    <p className="text-sm">-</p>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5">Points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Center) - Elevated & Gold Highlight */}
            {first ? (
              <div className="relative bg-white dark:bg-slate-900/90 border border-amber-400/30 dark:border-amber-500/20 p-6 rounded-3xl flex flex-col items-center space-y-4 text-center order-1 md:order-2 md:-translate-y-4 shadow-xl dark:shadow-none hover:border-amber-500/40 transition-all duration-300">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-2xl ring-2 ring-amber-500 border-2 border-white dark:border-slate-900 overflow-hidden shadow-xl shadow-amber-500/10">
                    {first.avatar ? (
                      <img src={first.avatar} alt={first.username} className="h-full w-full object-cover" />
                    ) : (
                      <span>{first.username ? first.username[0].toUpperCase() : '?'}</span>
                    )}
                  </div>
                  {/* Gold Medal Badge */}
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 border border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                    <FaMedal className="text-amber-900 text-xs" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{first.username}</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-widest mt-1">{first.branch || 'N/A'}</p>
                </div>
                {/* Stat Boxes */}
                <div className="flex gap-2.5 w-full text-xs font-bold">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 transition-colors">
                    <p className="text-slate-900 dark:text-white text-base">{first.total_uploads || 0}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mt-0.5">Uploads</p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 transition-colors">
                    <p className="text-violet-600 dark:text-violet-400 text-base">{formatPoints(first.points)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mt-0.5">Points</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Dotted Placeholder card */
              <div className="relative bg-amber-50/5 dark:bg-amber-950/5 border border-dashed border-amber-300/20 dark:border-amber-500/10 p-6 rounded-3xl flex flex-col items-center space-y-4 text-center order-1 md:order-2 md:-translate-y-4 shadow-sm opacity-80 hover:opacity-100 transition-all duration-300">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 flex items-center justify-center font-bold text-2xl border border-dashed border-amber-400/40 overflow-hidden shadow-inner">
                    <span>?</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                    <FaMedal className="text-amber-500 text-xs" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-amber-600/85 dark:text-amber-500/85 leading-tight">Claim 1st Place!</h3>
                  <p className="text-xs text-amber-500/60 dark:text-amber-500/40 font-extrabold uppercase tracking-widest mt-1">TOP CONTRIBUTOR</p>
                </div>
                <div className="flex gap-2.5 w-full text-xs font-bold">
                  <div className="flex-1 bg-transparent border border-dashed border-amber-300/20 py-2.5 rounded-2xl text-amber-600/60 dark:text-amber-500/40">
                    <p className="text-sm">-</p>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5">Uploads</p>
                  </div>
                  <div className="flex-1 bg-transparent border border-dashed border-amber-300/20 py-2.5 rounded-2xl text-amber-600/60 dark:text-amber-500/40">
                    <p className="text-sm">-</p>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5">Points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Right) */}
            {third ? (
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col items-center space-y-4 text-center order-3 md:order-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-lg dark:shadow-none hover:shadow-violet-950/5">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xl ring-2 ring-orange-400 dark:ring-orange-800 border-2 border-white dark:border-slate-900 overflow-hidden shadow-lg shadow-orange-500/10">
                    {third.avatar ? (
                      <img src={third.avatar} alt={third.username} className="h-full w-full object-cover" />
                    ) : (
                      <span>{third.username ? third.username[0].toUpperCase() : '?'}</span>
                    )}
                  </div>
                  {/* Bronze badge */}
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-600 to-orange-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                    <FaMedal className="text-amber-100 text-xs" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{third.username}</h3>
                  <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest mt-1">{third.branch || 'N/A'}</p>
                </div>
                {/* Stat Boxes */}
                <div className="flex gap-2 w-full text-xs font-bold">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 py-2 rounded-xl text-slate-600 dark:text-slate-400 transition-colors">
                    <p className="text-slate-900 dark:text-white text-sm">{third.total_uploads || 0}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mt-0.5">Uploads</p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 py-2 rounded-xl text-slate-600 dark:text-slate-400 transition-colors">
                    <p className="text-violet-600 dark:text-violet-400 text-sm">{formatPoints(third.points)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mt-0.5">Points</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Dotted Placeholder card */
              <div className="relative bg-slate-50/20 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col items-center space-y-4 text-center order-3 md:order-3 opacity-70 hover:opacity-100 transition-all duration-300 shadow-sm">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 flex items-center justify-center font-bold text-xl border border-dashed border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner">
                    <span>?</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 border border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                    <FaMedal className="text-amber-700/60 dark:text-amber-600/60 text-xs" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-400 dark:text-slate-500 leading-tight">Claim 3rd Place!</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-600 font-extrabold uppercase tracking-widest mt-1">YOUR BRANCH</p>
                </div>
                <div className="flex gap-2 w-full text-xs font-bold">
                  <div className="flex-1 bg-transparent border border-dashed border-slate-200 dark:border-slate-800/60 py-2 rounded-xl text-slate-400 dark:text-slate-600">
                    <p className="text-sm">-</p>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5">Uploads</p>
                  </div>
                  <div className="flex-1 bg-transparent border border-dashed border-slate-200 dark:border-slate-800/60 py-2 rounded-xl text-slate-400 dark:text-slate-600">
                    <p className="text-sm">-</p>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5">Points</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Leaders Table list for Ranks 4+ */}
          {tableLeaders.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-none overflow-hidden max-w-4xl mx-auto transition-colors duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse select-none">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-500 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
                      <th className="px-6 py-4.5 w-20 text-center">Rank</th>
                      <th className="px-6 py-4.5">User</th>
                      <th className="px-6 py-4.5">Department</th>
                      <th className="px-6 py-4.5 text-center">Uploads</th>
                      <th className="px-6 py-4.5 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {tableLeaders.map((leader, index) => {
                      const rank = index + 4;
                      const uploaderName = leader.username || 'Student';

                      return (
                        <tr
                          key={leader.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-smooth"
                        >
                          {/* Rank Badge */}
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">#{rank}</span>
                          </td>

                          {/* User Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {leader.avatar ? (
                                <img
                                  src={leader.avatar}
                                  alt={uploaderName}
                                  className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold capitalize">
                                  {uploaderName[0]}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{uploaderName}</p>
                              </div>
                            </div>
                          </td>

                          {/* Department/Branch Badge */}
                          <td className="px-6 py-4">
                            <span className={`text-xs font-extrabold uppercase border px-2 py-0.5 rounded transition-colors duration-300 ${getBranchBadgeColor(leader.branch)}`}>
                              {leader.branch || 'N/A'}
                            </span>
                          </td>

                          {/* Uploads Count */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-bold">
                              <FaUpload size={9} className="text-slate-400 dark:text-slate-500" />
                              <span>{leader.total_uploads || 0}</span>
                            </span>
                          </td>

                          {/* Points Tally */}
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-violet-600 dark:text-violet-400">
                              <FaStar size={9} className="text-violet-500/80 animate-pulse" />
                              <span>{(leader.points || 0).toLocaleString()}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View Full Leaderboard Link */}
          {leaders.length > 3 && (
            <div className="flex justify-center pt-2">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-smooth cursor-pointer select-none">
                <span>View Full Leaderboard</span>
                <FaChevronRight size={8} />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
