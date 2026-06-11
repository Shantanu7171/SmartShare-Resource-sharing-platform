import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBookOpen, FaUserCircle, FaSignOutAlt, FaUpload, 
  FaTrophy, FaBell, FaBars, FaTimes, FaCog, FaUser, FaSearch,
  FaSun, FaMoon
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { notificationAPI } from '../api/axios';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout, theme, toggleTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [navSearch, setNavSearch] = useState('');

  const profileRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.list();
      setNotifications(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/feed?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#080d1a]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 px-4 sm:px-6 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white select-none">
          <FaBookOpen className="text-xl text-violet-600 dark:text-violet-500 animate-pulse" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-800 dark:from-violet-400 dark:to-indigo-300">SmartShare</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`font-medium text-sm transition-colors ${isActive('/') ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Home
          </Link>
          <Link 
            to="/feed" 
            className={`font-medium text-sm transition-colors ${isActive('/feed') ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Resources
          </Link>
          <Link 
            to="/leaderboard" 
            className={`font-medium text-sm transition-colors ${isActive('/leaderboard') ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Leaderboard
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/chat" 
                className={`font-medium text-sm transition-colors ${isActive('/chat') ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Chat
              </Link>
              <Link 
                to="/ai-quiz" 
                className={`font-medium text-sm transition-colors ${isActive('/ai-quiz') ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                AI Quiz
              </Link>
            </>
          )}
        </div>

        {/* Search & Actions Container */}
        <div className="hidden md:flex items-center gap-4 flex-grow max-w-md justify-end">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[150px] lg:max-w-[200px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <FaSearch size={11} />
            </span>
            <input
              type="text"
              placeholder="Search materials..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300"
            />
          </form>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-full transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <FaSun size={13} className="text-amber-400" /> : <FaMoon size={13} className="text-violet-600" />}
          </button>

          {/* Authenticated Controls */}
          {isAuthenticated ? (
            <>
              {/* Upload Button */}
              <Link 
                to="/upload" 
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-smooth hover:shadow-lg hover:shadow-violet-500/20 active:scale-95"
              >
                <FaUpload size={11} />
                <span>Upload</span>
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-full transition-colors cursor-pointer"
                >
                  <FaBell size={14} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-violet-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto px-2 py-1">
                      {notifications.filter(n => !n.is_read).length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.filter(n => !n.is_read).map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-2.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors bg-violet-50 dark:bg-violet-950/20 text-slate-800 dark:text-slate-200 border-l-2 border-violet-500"
                          >
                            <p>{notif.message}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 pr-2.5 rounded-full transition-all border border-slate-200 dark:border-slate-800"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} className="h-6 w-6 rounded-full object-cover border border-violet-500/20" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold capitalize">
                      {user?.username?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 pr-1">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden text-slate-700 dark:text-slate-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090e1a]/60">
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Contributor Score</p>
                      <p className="text-sm font-extrabold text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mt-0.5">
                        <FaTrophy size={11} />
                        <span>{user?.points} pts</span>
                      </p>
                    </div>
                    
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-white transition-colors">
                      <FaUser size={11} />
                      <span>My Profile</span>
                    </Link>

                    {(user?.role === 'admin' || user?.is_staff) && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-white transition-colors border-t border-slate-100 dark:border-slate-800/30">
                        <FaCog size={11} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    {user?.role === 'faculty' && user?.is_approved_faculty && (
                      <Link to="/faculty" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-white transition-colors border-t border-slate-100 dark:border-slate-800/30">
                        <FaCog size={11} />
                        <span>Faculty Console</span>
                      </Link>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-slate-100 dark:border-slate-800/60"
                    >
                      <FaSignOutAlt size={11} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:shadow-lg hover:shadow-violet-500/10 active:scale-95 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2.5">
          {/* Theme switcher on mobile */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 dark:text-slate-400 rounded-full transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <FaSun size={14} className="text-amber-400" /> : <FaMoon size={14} className="text-violet-600" />}
          </button>

          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <FaBell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-violet-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-[-45px] sm:right-0 mt-3 w-72 bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-800 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold hover:underline">
                        Mark all
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto px-2 py-1 text-left">
                    {notifications.filter(n => !n.is_read).length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.filter(n => !n.is_read).map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-2 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-violet-50 dark:bg-violet-950/20 text-slate-800 dark:text-slate-200 border-l border-violet-500"
                        >
                          <p>{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with Smooth Slide Transition */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-[600px] opacity-100 mt-3 pt-3 border-t border-slate-100 dark:border-slate-900' 
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-2 pb-2">
          {/* Mobile User Profile Header */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 px-3 py-2.5 mx-3 mb-2 bg-slate-50 dark:bg-[#0c1222]/80 rounded-xl border border-slate-250 dark:border-slate-800/80">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="h-10 w-10 rounded-full object-cover border border-violet-500/20" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold capitalize shadow-sm">
                  {user.username?.[0] || 'U'}
                </div>
              )}
              <div className="text-left flex-grow">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">{user.role || 'Student'}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">Score</span>
                <span className="text-xs font-black text-violet-600 dark:text-violet-400">{user.points} pts</span>
              </div>
            </div>
          )}

          <Link 
            to="/" 
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Home
          </Link>
          <Link 
            to="/feed" 
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/feed') ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Resources
          </Link>
          <Link 
            to="/leaderboard" 
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/leaderboard') ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'}`}
          >
            Leaderboard
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/chat" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/chat') ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'}`}
              >
                Chat
              </Link>
              <Link 
                to="/ai-quiz" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/ai-quiz') ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'}`}
              >
                AI Quiz
              </Link>
            </>
          )}

          <form onSubmit={handleSearchSubmit} className="relative mx-3 my-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <FaSearch size={11} />
            </span>
            <input
              type="text"
              placeholder="Search materials..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </form>

          {isAuthenticated ? (
            <>
              <Link 
                to="/upload" 
                className="mx-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold py-2 rounded-full shadow"
              >
                <FaUpload size={11} />
                <span>Upload a Resource</span>
              </Link>
              <Link 
                to="/profile" 
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white"
              >
                My Profile
              </Link>
              {(user?.role === 'admin' || user?.is_staff) && (
                <Link 
                  to="/admin" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white"
                >
                  Admin Console
                </Link>
              )}
              {user?.role === 'faculty' && user?.is_approved_faculty && (
                <Link 
                  to="/faculty" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white"
                >
                  Faculty Console
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="mx-3 py-2 mt-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg border border-red-200 dark:border-red-900/30 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 mx-3 my-2">
              <Link 
                to="/login" 
                className="flex-1 text-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/30"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="flex-1 text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold py-2 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
