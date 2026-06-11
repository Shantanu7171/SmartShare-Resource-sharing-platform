import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaSignInAlt, FaCircleNotch,
  FaEye, FaEyeSlash, FaArrowRight, FaKey
} from 'react-icons/fa';
import { authAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);

  // View state: 'login', 'forgot_request', 'forgot_reset'
  const [mode, setMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password inputs
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle standard login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.login({ email, password });

      loginUser(res.data.user, {
        access: res.data.access,
        refresh: res.data.refresh,
      });

      toast.success('Welcome back to SmartShare!');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Invalid email or password. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password request
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.forgotPassword({ email });
      toast.success(res.data.detail || 'Password reset OTP sent to your email.');
      setMode('forgot_reset');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to send OTP. Please check email address.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.resetPassword({
        email,
        otp,
        new_password: newPassword
      });
      toast.success(res.data.detail || 'Password reset successfully!');
      
      // Reset forms and go to login
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Reset failed. Invalid OTP or link expired.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 py-16 overflow-hidden transition-colors duration-300">
      {/* Dynamic Glowing Blurred Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-8">
        {/* SmartShare Logo Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:via-pink-400 dark:to-indigo-300 drop-shadow-md select-none">
            SmartShare
          </h1>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-[#0b0f19]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-2xl dark:shadow-violet-950/20 w-full space-y-6 transition-colors duration-300">
          
          {/* VIEW: LOGIN FORM */}
          {mode === 'login' && (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Welcome Back</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sign in to continue your academic journey.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaEnvelope size={11} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-650"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot_request')}
                      className="text-[9px] font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaLock size={11} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-650"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-[#080b14] text-violet-600 focus:ring-0 w-3.5 h-3.5 outline-none transition-all cursor-pointer"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-violet-500/25 active:scale-98 transition-smooth flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {loading ? (
                    <FaCircleNotch className="animate-spin" size={11} />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FaArrowRight size={10} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* VIEW: FORGOT PASSWORD REQUEST OTP */}
          {mode === 'forgot_request' && (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Forgot Password?</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Enter your email and we'll send you an OTP code to verify.</p>
              </div>

              <form onSubmit={handleForgotRequest} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaEnvelope size={11} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-650"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-violet-500/25 active:scale-98 transition-smooth flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {loading ? (
                    <FaCircleNotch className="animate-spin" size={11} />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <FaArrowRight size={10} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white pt-2 block"
                >
                  Back to Sign In
                </button>
              </form>
            </>
          )}

          {/* VIEW: FORGOT PASSWORD RESET */}
          {mode === 'forgot_reset' && (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Reset Password</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">OTP has been sent to {email}. Set your new password.</p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                {/* OTP code */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">OTP Code</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaKey size={11} />
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-650 tracking-[4px] font-mono text-center"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaLock size={11} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-650"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaLock size={11} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-650"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-violet-500/25 active:scale-98 transition-smooth flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {loading ? (
                    <FaCircleNotch className="animate-spin" size={11} />
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <FaArrowRight size={10} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('forgot_request')}
                  className="w-full text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white pt-2 block"
                >
                  Request a new code
                </button>
              </form>
            </>
          )}

          {/* Bottom Register Prompt */}
          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/40">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-600 dark:text-violet-400 hover:underline font-bold">
                Register here
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
