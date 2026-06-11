import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaLock, FaUniversity,
  FaGraduationCap, FaCircleNotch, FaUserPlus
} from 'react-icons/fa';
import { authAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
    role: 'student',
    branch: '',
    semester: '',
    university: '',
    college: '',
  });

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role' && value === 'admin') {
      setFormData({ ...formData, role: value, branch: '', semester: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code.');
      return;
    }

    try {
      setOtpLoading(true);
      const res = await authAPI.verifyOTP({
        email: formData.email,
        otp: otpCode,
      });

      // Login user with response data
      loginUser(res.data.user, {
        access: res.data.access,
        refresh: res.data.refresh,
      });

      toast.success('Email verified successfully! Welcome onboard.');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || 'Verification failed. Please check the OTP code.';
      toast.error(errorMsg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResending(true);
      await authAPI.resendOTP({ email: formData.email });
      toast.success('A new OTP code has been sent to your email.');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || 'Failed to resend OTP.';
      toast.error(errorMsg);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);

      // Register request
      await authAPI.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        role: formData.role,
        branch: formData.role === 'admin' ? null : (formData.branch || null),
        semester: formData.role === 'admin' ? null : (formData.semester ? parseInt(formData.semester) : null),
        university: formData.university,
        college: formData.college,
      });

      toast.success('Account created! A verification code has been sent to your email.');
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const firstErrorKey = Object.keys(errors)[0];
        const errorVal = errors[firstErrorKey];
        const msg = Array.isArray(errorVal) ? errorVal[0] : errorVal;
        toast.error(`${firstErrorKey}: ${msg}`);
      } else {
        toast.error('Registration failed. Please check details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 py-10 overflow-hidden transition-colors duration-300">
      {/* Dynamic Glowing Blurred Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center space-y-6">
        {/* SmartShare Logo Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:via-pink-400 dark:to-indigo-300 drop-shadow-md select-none text-glow-violet">
            SmartShare
          </h1>
        </div>

        {/* OTP Verification Box */}
        {otpSent ? (
          <div className="bg-white dark:bg-[#0b0f19]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-2xl dark:shadow-violet-950/20 w-full space-y-6 transition-colors duration-300">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-dashed border-violet-300">
                <span className="text-base">✉</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Verify Your Email</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                We have sent a 6-digit OTP code to <br />
                <span className="font-extrabold text-violet-600 dark:text-violet-400">{formData.email}</span>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-center">
                (Note: During development, check your backend server terminal logs for the email printout)
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block text-center">Enter Verification Code</label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.75em] pl-[0.75em] py-3 text-lg font-black bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-350 dark:placeholder-slate-750"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-violet-500/25 active:scale-98 transition-smooth flex items-center justify-center gap-2 cursor-pointer"
              >
                {otpLoading ? (
                  <FaCircleNotch className="animate-spin" size={11} />
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>
            </form>

            <div className="flex flex-col items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/40 text-[11px]">
              <button
                type="button"
                disabled={resending}
                onClick={handleResendOTP}
                className="text-violet-600 dark:text-violet-400 hover:underline font-bold disabled:opacity-40"
              >
                {resending ? 'Resending Code...' : 'Resend Verification Code'}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300 font-semibold"
              >
                ← Back to Registration
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0b0f19]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-2xl dark:shadow-violet-950/20 w-full space-y-6 transition-colors duration-300">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Create Account</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Join the network and share notes with peers</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block text-left">First Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaUser size={11} />
                    </span>
                    <input
                      type="text"
                      name="first_name"
                      required
                      placeholder="Enter your first name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block text-left">Last Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaUser size={11} />
                    </span>
                    <input
                      type="text"
                      name="last_name"
                      required
                      placeholder="Enter your last name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block text-left">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                    <FaEnvelope size={11} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="youremail@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block text-left">University Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaUniversity size={11} />
                    </span>
                    <input
                      type="text"
                      name="university"
                      required
                      placeholder="State University"
                      value={formData.university}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block text-left">College Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaUniversity size={11} />
                    </span>
                    <input
                      type="text"
                      name="college"
                      required
                      placeholder="Engineering College"
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaLock size={11} />
                    </span>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <FaLock size={11} />
                    </span>
                    <input
                      type="password"
                      name="password2"
                      required
                      placeholder="••••••••"
                      value={formData.password2}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${formData.role === 'faculty' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">User Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth cursor-pointer"
                  >
                    <option value="student" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Student</option>
                    <option value="faculty" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Faculty</option>
                  </select>
                </div>

                {formData.role !== 'admin' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Branch</label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth cursor-pointer"
                      >
                        <option value="" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Select Branch</option>
                        <option value="CSE" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">CSE</option>
                        <option value="IT" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">IT</option>
                        <option value="ECE" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">ECE</option>
                        <option value="MECH" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">MECH</option>
                        <option value="CIVIL" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">CIVIL</option>
                      </select>
                    </div>

                    {formData.role !== 'faculty' && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Semester</label>
                        <select
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth cursor-pointer"
                        >
                          <option value="" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Select Sem</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem} className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">{sem}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-violet-500/25 active:scale-98 transition-smooth flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {loading ? (
                  <FaCircleNotch className="animate-spin" size={11} />
                ) : (
                  <FaUserPlus size={11} />
                )}
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              </button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:underline font-bold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
