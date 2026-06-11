import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFileAlt, FaTimes, FaCircleNotch } from 'react-icons/fa';
import API, { resourceAPI, authAPI } from '../api/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const Upload = () => {
  const navigate = useNavigate();
  const theme = useAuthStore((state) => state.theme);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [tags, setTags] = useState('');

  // Dropzone file state
  const [file, setFile] = useState(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Auto-populate title if empty
      const nameWithoutExtension = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setTitle(prev => prev || nameWithoutExtension);

      // Guess file type
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (['pdf'].includes(ext)) setFileType('pdf');
      else if (['doc', 'docx', 'odt'].includes(ext)) setFileType('doc');
      else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) setFileType('image');
      else if (['ppt', 'pptx'].includes(ext)) setFileType('ppt');
      else setFileType('other');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload a file first.');
      return;
    }
    if (!branch || !semester) {
      toast.error('Please select a branch and semester.');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', subject);
      formData.append('branch', branch);
      formData.append('semester', semester);
      formData.append('file_type', fileType);
      formData.append('tags', tags);
      formData.append('file', file);

      // Call axios directly with progress listener
      await API.post('/resources/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      // Sync user profile statistics (total uploads)
      try {
        const profileRes = await authAPI.getProfile();
        useAuthStore.getState().updateUser(profileRes.data);
      } catch (profileErr) {
        console.error('Failed to fetch updated profile after upload:', profileErr);
      }

      toast.success('Resource uploaded and approved successfully!');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload resource. Please check inputs.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 py-10 overflow-hidden transition-colors duration-300 w-full">
      {/* Dynamic Glowing Blurred Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>

      <div className="bg-white dark:bg-[#0b0f19]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl dark:shadow-violet-950/20 w-full max-w-2xl space-y-6 transition-colors duration-300 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Upload Resource</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Share lecture slides, notes, or lab practical manuals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Upload Dropzone */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Select File</label>
            {!file ? (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080b14]/50 hover:bg-slate-50 dark:hover:bg-[#0c101d]/50'
                }`}
              >
                <input {...getInputProps()} />
                <FaCloudUploadAlt className="text-4xl text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Drag & Drop file here, or click to browse</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PDF, DOC, PPT, Images up to 25MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white dark:bg-[#0d1222] rounded-xl text-violet-500 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <FaFileAlt size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[200px] sm:max-w-[400px] truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleRemoveFile}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Resource Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures Handout"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Subject Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Advanced Algorithms"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Branch</label>
              <select
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
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

            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Semester</label>
              <select
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem} className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Semester {sem}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">File Category</label>
              <select
                required
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth cursor-pointer"
              >
                <option value="pdf" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">PDF File</option>
                <option value="doc" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Word / Text Doc</option>
                <option value="image" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Image Format</option>
                <option value="ppt" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">PowerPoint Slide</option>
                <option value="other" className="bg-white dark:bg-[#080b14] text-slate-800 dark:text-slate-200">Other / Zip Archive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Description</label>
            <textarea
              placeholder="Provide a clear, brief outline of what this resource covers..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="notes, unit-1, mid-sem, recursion"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Uploading to database...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-violet-500/25 active:scale-98 transition-smooth flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {uploading ? (
              <FaCircleNotch className="animate-spin" size={11} />
            ) : (
              <FaCloudUploadAlt size={13} />
            )}
            <span>{uploading ? `Uploading (${progress}%)` : 'Upload File'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
