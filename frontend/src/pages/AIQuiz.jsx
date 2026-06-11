import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FaBrain, FaPlus, FaArrowLeft, FaCloudUploadAlt, 
  FaFileAlt, FaTimes, FaCircleNotch, FaTrophy, 
  FaCheck, FaTimesCircle, FaChevronRight, FaChevronLeft,
  FaBook, FaLightbulb, FaHistory, FaUndo, FaSearch
} from 'react-icons/fa';
import toast from 'react-hot-toast';

import { aiQuizAPI, resourceAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';

const AIQuiz = () => {
  const { user } = useAuthStore();
  const [view, setView] = useState('dashboard'); // dashboard, generator, playing, results
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Generator form state
  const [sourceType, setSourceType] = useState('upload'); // upload, text, resource
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Resources options for dropdown
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const selectedResource = resources.find(res => res.id && selectedResourceId && res.id.toString() === selectedResourceId.toString());
  const filteredResources = resources.filter(res => {
    const term = resourceSearch.toLowerCase();
    return (
      res.title?.toLowerCase().includes(term) ||
      res.branch?.toLowerCase().includes(term) ||
      res.semester?.toString().includes(term) ||
      (res.file_type || '').toLowerCase().includes(term)
    );
  });

  // Generation status and loader messages
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Active Quiz Play State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // {questionId: 'A'|'B'|'C'|'D'}
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Loader steps during generation
  const loaderMessages = [
    "Uploading study material...",
    "Extracting text content...",
    "Analyzing topics with Gemini AI...",
    "Formulating conceptual multiple choice questions...",
    "Generating answers and explanations...",
    "Saving quiz to database..."
  ];

  // Fetch quizzes history
  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const res = await aiQuizAPI.listQuizzes();
      setQuizzes(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quiz history.');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Fetch resources for selection
  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const res = await resourceAPI.getAll({ status: 'approved' });
      setResources(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchResources();
  }, []);

  // Set up sequential loader messages when generating
  useEffect(() => {
    let interval;
    if (generating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loaderMessages.length - 1 ? prev + 1 : prev));
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  // Dropzone file upload
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      const allowedExts = ['pdf', 'txt', 'png', 'jpg', 'jpeg'];
      if (!allowedExts.includes(ext)) {
        toast.error('Only PDF, TXT, and Image (PNG/JPG) files are supported.');
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  // Start generation
  const handleGenerate = async (e) => {
    e.preventDefault();

    if (sourceType === 'upload' && !file) {
      toast.error('Please upload a notes file.');
      return;
    }
    if (sourceType === 'text' && textContent.trim().length < 50) {
      toast.error('Please paste notes with at least 50 characters.');
      return;
    }
    if (sourceType === 'resource' && !selectedResourceId) {
      toast.error('Please select an existing resource.');
      return;
    }

    try {
      setGenerating(true);
      setLoadingStep(0);

      const formData = new FormData();
      formData.append('num_questions', numQuestions);
      formData.append('difficulty', difficulty);

      if (sourceType === 'upload') {
        formData.append('file', file);
      } else if (sourceType === 'text') {
        formData.append('text_content', textContent);
      } else if (sourceType === 'resource') {
        formData.append('resource_id', selectedResourceId);
      }

      const response = await aiQuizAPI.generate(formData);
      
      toast.success('Quiz generated successfully!');
      
      // Update local states
      const newQuiz = response.data;
      setActiveQuiz(newQuiz);
      setSelectedAnswers({});
      setCurrentQuestionIdx(0);
      setFile(null);
      setTextContent('');
      setSelectedResourceId('');
      
      // Refresh list
      fetchQuizzes();
      
      // Switch view
      setView('playing');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to generate quiz. Check API key/file size.';
      toast.error(errMsg);
    } finally {
      setGenerating(false);
    }
  };

  // Play Quiz Actions
  const handleOptionSelect = (questionId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  // Submit Answers
  const handleSubmitQuiz = async () => {
    const unansweredCount = activeQuiz.questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have left ${unansweredCount} questions unanswered. Do you want to submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmittingAnswers(true);
      const res = await aiQuizAPI.submitQuiz(activeQuiz.id, {
        answers: selectedAnswers
      });
      setQuizResult(res.data);
      
      // Update points in authStore
      if (res.data.points_awarded > 0) {
        toast.success(`Quiz Completed! You earned +${res.data.points_awarded} points!`);
      }
      
      setView('results');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit quiz.');
    } finally {
      setSubmittingAnswers(false);
    }
  };

  // Retake quiz
  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setView('playing');
  };

  // Select an existing quiz from history list to attempt
  const handleStartExistingQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setView('playing');
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center px-4 py-8 overflow-hidden transition-colors duration-300 w-full">
      {/* Background glow graphics */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

      {/* DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <div className="w-full max-w-6xl space-y-8 relative z-10 text-left">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-12 shadow-2xl border border-violet-500/20 shadow-violet-500/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-white/15 text-white border border-white/20 uppercase">
                ✦ Powered by Gemini 2.5 Flash
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                AI MCQ Quiz Generator
              </h1>
              <p className="text-xs md:text-sm text-violet-100 font-medium leading-relaxed">
                Upload your lecture notes, slides, or syllabus and let our AI analyze the concepts to generate customized multiple-choice tests. Earn study points for scoring well!
              </p>
            </div>
            <button
              onClick={() => setView('generator')}
              className="px-6 py-3.5 bg-white text-violet-600 hover:bg-slate-50 font-bold text-sm rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <FaPlus size={12} />
              <span>Generate New Quiz</span>
            </button>
          </div>

          {/* Quiz list and history */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FaHistory className="text-violet-500" size={16} />
              <span>Your Quiz History</span>
            </h2>

            {loadingQuizzes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-white dark:bg-[#0c1122]/70 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#0d1222]/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 transition-colors">
                <FaBrain className="text-5xl text-slate-350 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">No quizzes generated yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Upload your first set of notes to auto-generate custom MCQ quizzes and practice concepts.</p>
                <button 
                  onClick={() => setView('generator')}
                  className="mt-5 px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full cursor-pointer hover:shadow-lg transition-smooth"
                >
                  Create Your First Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => {
                  const bestAttempt = quiz.attempts?.reduce((best, attempt) => attempt.score > best.score ? attempt : best, { score: 0 });
                  return (
                    <div 
                      key={quiz.id}
                      className="bg-white dark:bg-[#0c1122]/80 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:border-violet-500/30 group"
                    >
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200/50 dark:border-violet-500/15">
                          {quiz.questions?.length || 0} MCQs
                        </span>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white line-clamp-2 mt-1 group-hover:text-violet-500 transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          Created on {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/60 mt-4 pt-3 flex items-center justify-between text-xs">
                        <div>
                          {quiz.attempts?.length > 0 ? (
                            <div className="flex flex-col text-left">
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Best Score</span>
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <FaTrophy size={10} />
                                {bestAttempt.score}/{bestAttempt.total_questions} ({Math.round(bestAttempt.score / bestAttempt.total_questions * 100)}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">Not attempted yet</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartExistingQuiz(quiz)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-violet-600 hover:text-white dark:bg-[#070b14]/80 text-slate-700 dark:text-slate-350 text-[11px] font-black rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{quiz.attempts?.length > 0 ? 'Retake' : 'Start'}</span>
                          <FaChevronRight size={7} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GENERATOR MODE */}
      {view === 'generator' && (
        <div className="w-full max-w-2xl bg-white dark:bg-[#0b0f19]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 text-left">
          {/* Loading Overlay */}
          {generating && (
            <div className="absolute inset-0 bg-white/95 dark:bg-[#080d1a]/95 rounded-2xl z-50 flex flex-col justify-center items-center p-6 text-center space-y-6">
              <FaCircleNotch className="text-5xl text-violet-600 dark:text-violet-500 animate-spin" />
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight animate-pulse">Generating MCQ Quiz</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {loaderMessages[loadingStep]}
                </p>
              </div>
              <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${((loadingStep + 1) / loaderMessages.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800/60">
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Generate Quiz</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Create interactive quizzes from your college materials</p>
            </div>
            <button 
              onClick={() => setView('dashboard')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full text-slate-500 transition-colors cursor-pointer"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6 pt-5">
            {/* Input source tab selection */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Select Material Source</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSourceType('upload')}
                  className={`py-2 rounded-lg cursor-pointer transition-all ${sourceType === 'upload' ? 'bg-white dark:bg-violet-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                  📁 File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('text')}
                  className={`py-2 rounded-lg cursor-pointer transition-all ${sourceType === 'text' ? 'bg-white dark:bg-violet-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                  📝 Copy-Paste
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('resource')}
                  className={`py-2 rounded-lg cursor-pointer transition-all ${sourceType === 'resource' ? 'bg-white dark:bg-violet-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                  📚 shared notes
                </button>
              </div>
            </div>

            {/* Input area depends on sourceType */}
            {sourceType === 'upload' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">Upload Document</label>
                {!file ? (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#080b14]/50 hover:bg-slate-100/50 dark:hover:bg-[#0c101d]/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FaCloudUploadAlt className="text-3xl text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & Drop file here, or click to browse</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Supports PDF, TXT and Image files (PNG/JPG)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white dark:bg-[#0d1222] rounded-lg text-violet-500 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <FaFileAlt size={16} />
                      </div>
                      <div className="truncate max-w-[300px]">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {sourceType === 'text' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">Paste Study Notes</label>
                <textarea
                  required
                  placeholder="Paste your lecture notes, summaries, or conceptual questions here (min 50 characters)..."
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full p-3.5 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-slate-800 dark:text-slate-200 outline-none transition-smooth placeholder-slate-400 resize-none font-sans"
                />
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block text-right mt-1">
                  Character count: {textContent.length} (minimum 50)
                </span>
              </div>
            )}

            {sourceType === 'resource' && (
              <div className="space-y-1.5 relative">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">Select Shared Resource</label>
                {loadingResources ? (
                  <div className="h-10 bg-slate-100 dark:bg-[#080b14] rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">Loading resources...</div>
                ) : resources.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    No study materials available on the platform yet. Try copy-pasting or file upload instead.
                  </div>
                ) : (
                  <div className="relative">
                    {/* Trigger: Input for search or selected resource preview */}
                    <div 
                      className="w-full flex items-center justify-between px-3.5 py-3 text-xs bg-slate-100 dark:bg-[#080b14] border border-slate-200 dark:border-slate-800 rounded-xl focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 text-slate-800 dark:text-slate-200 cursor-pointer transition-all"
                      onClick={() => setSearchDropdownOpen(true)}
                    >
                      {selectedResource ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate pr-2 font-bold text-left">
                            <span className="text-violet-650 dark:text-violet-400 font-extrabold mr-1.5">
                              [{selectedResource.branch} - Sem {selectedResource.semester}]
                            </span>
                            {selectedResource.title} 
                            <span className="text-slate-400 dark:text-slate-550 text-[10px] ml-1.5 uppercase font-black">
                              ({selectedResource.file_type?.toUpperCase()})
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResourceId('');
                              setResourceSearch('');
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <FaSearch className="text-slate-400 dark:text-slate-600 shrink-0" size={11} />
                          <input
                            type="text"
                            placeholder="Search by title, branch, semester..."
                            value={resourceSearch}
                            onChange={(e) => {
                              setResourceSearch(e.target.value);
                              setSearchDropdownOpen(true);
                            }}
                            onFocus={() => setSearchDropdownOpen(true)}
                            className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-250 placeholder-slate-400"
                          />
                        </div>
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    {searchDropdownOpen && (
                      <>
                        {/* Overlay to close the dropdown */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setSearchDropdownOpen(false)}
                        />
                        
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0c1122] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                          {selectedResource && (
                            <div className="p-2 sticky top-0 bg-white dark:bg-[#0c1122] border-b border-slate-150 dark:border-slate-800/80 flex items-center gap-2 z-10">
                              <FaSearch className="text-slate-400 dark:text-slate-600 ml-1.5 shrink-0" size={11} />
                              <input
                                type="text"
                                placeholder="Search other resources..."
                                value={resourceSearch}
                                onChange={(e) => setResourceSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400"
                                autoFocus
                              />
                            </div>
                          )}

                          {filteredResources.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                              No matching resources found
                            </div>
                          ) : (
                            filteredResources.map((res) => {
                              const isSelected = res.id.toString() === selectedResourceId.toString();
                              return (
                                <button
                                  key={res.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedResourceId(res.id);
                                    setSearchDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-xs transition-colors flex flex-col gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 ${
                                    isSelected ? 'bg-violet-500/5 dark:bg-violet-500/10 text-violet-650 dark:text-violet-400' : 'text-slate-700 dark:text-slate-350'
                                  }`}
                                >
                                  <span className="font-extrabold text-[10px] text-violet-550 dark:text-violet-400 uppercase tracking-wide">
                                    {res.branch} • Semester {res.semester}
                                  </span>
                                  <span className="font-bold flex justify-between items-center gap-2">
                                    <span className="truncate">{res.title}</span>
                                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold shrink-0">
                                      {res.file_type}
                                    </span>
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quiz Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">Number of MCQ Questions</label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNumQuestions(num)}
                      className={`flex-1 py-2.5 rounded-xl cursor-pointer text-xs font-bold border transition-all ${
                        numQuestions === num 
                          ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
                          : 'bg-slate-100 dark:bg-[#080b14] border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-350'
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">Difficulty Level</label>
                <div className="flex items-center gap-2">
                  {['Easy', 'Medium', 'Hard'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-2.5 rounded-xl cursor-pointer text-xs font-bold border transition-all ${
                        difficulty === lvl 
                          ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
                          : 'bg-slate-100 dark:bg-[#080b14] border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-350'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-violet-500/25 active:scale-98 transition-smooth flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              <FaBrain size={13} />
              <span>Generate MCQ Quiz with Gemini</span>
            </button>
          </form>
        </div>
      )}

      {/* PLAY MODE */}
      {view === 'playing' && activeQuiz && (
        <div className="w-full max-w-3xl space-y-6 relative z-10 text-left">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-lg">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200/50">
                Playing Quiz
              </span>
              <h2 className="text-base font-black text-slate-800 dark:text-white mt-1.5">{activeQuiz.title}</h2>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to quit this quiz? Your progress will be lost.")) {
                  setView('dashboard');
                }
              }}
              className="px-3 py-1.5 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg cursor-pointer self-start sm:self-center"
            >
              Quit Quiz
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
              <span>{Math.round(((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          {activeQuiz.questions[currentQuestionIdx] && (() => {
            const q = activeQuiz.questions[currentQuestionIdx];
            const options = [
              { key: 'A', text: q.option_a },
              { key: 'B', text: q.option_b },
              { key: 'C', text: q.option_c },
              { key: 'D', text: q.option_d },
            ];

            return (
              <div className="bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white leading-relaxed">
                  {q.question_text}
                </h3>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {options.map((opt) => {
                    const isSelected = selectedAnswers[q.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleOptionSelect(q.id, opt.key)}
                        className={`flex items-start gap-4 p-4 rounded-xl text-left border font-semibold text-xs transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500' 
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#080b14]/50 dark:hover:bg-[#0c101d]/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-black tracking-wide ${
                          isSelected
                            ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                            : 'bg-white dark:bg-[#0d1222] border-slate-200 dark:border-slate-850 text-slate-500'
                        }`}>
                          {opt.key}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIdx === 0}
              className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                currentQuestionIdx === 0
                  ? 'bg-slate-100 dark:bg-[#080b14]/20 border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-650 cursor-not-allowed opacity-40'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#0f172a] dark:hover:bg-[#1e293b] border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-violet-500/5'
              }`}
            >
              <FaChevronLeft size={10} />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white shadow-md hover:shadow-violet-500/25 hover:scale-105 active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Next</span>
                <FaChevronRight size={10} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submittingAnswers}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-emerald-500/25 hover:scale-105 active:scale-95 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer"
              >
                {submittingAnswers ? (
                  <FaCircleNotch className="animate-spin" size={11} />
                ) : (
                  <FaCheck size={11} />
                )}
                <span>{submittingAnswers ? 'Submitting...' : 'Submit Quiz'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULTS VIEW */}
      {view === 'results' && quizResult && (
        <div className="w-full max-w-3xl space-y-8 relative z-10 text-left pb-10">
          {/* Card Score ring */}
          <div className="bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-slate-800/80 rounded-[32px] p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 uppercase">
                ✦ Quiz Completed
              </span>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Your Score Summary</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">
                Great effort! Review the detailed answers below to reinforce correct concepts and learn from incorrect choices.
              </p>
              {quizResult.points_awarded > 0 && (
                <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-xl border border-amber-500/20 text-xs font-extrabold uppercase tracking-wide">
                  <FaTrophy size={11} />
                  <span>+{quizResult.points_awarded} Contributor Points Added!</span>
                </div>
              )}
            </div>

            {/* Circular score gauge */}
            <div className="relative h-32 w-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-violet-600 dark:text-violet-500"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={(2 * Math.PI * 50) * (1 - quizResult.score / quizResult.total_questions)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="64"
                  cy="64"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-850 dark:text-white">
                  {quizResult.score}/{quizResult.total_questions}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
                  {Math.round(quizResult.score / quizResult.total_questions * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleRetake}
              className="flex-1 py-3 bg-white hover:bg-slate-50 dark:bg-[#0b0f19]/80 dark:hover:bg-[#0c101d]/65 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
            >
              <FaUndo size={10} />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => setView('dashboard')}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-smooth flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Question Review</h3>
            <div className="space-y-5">
              {activeQuiz.questions.map((q, idx) => {
                const reviewItem = quizResult.results.find(r => r.question_id === q.id) || {};
                const isCorrect = reviewItem.is_correct;
                const userAns = reviewItem.user_answer;
                
                const options = [
                  { key: 'A', text: q.option_a },
                  { key: 'B', text: q.option_b },
                  { key: 'C', text: q.option_c },
                  { key: 'D', text: q.option_d },
                ];

                return (
                  <div 
                    key={q.id}
                    className="bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    {/* Header: Question Status */}
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-extrabold text-slate-500 dark:text-slate-400">Question {idx + 1}</span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold">
                          <FaCheck size={11} />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-extrabold">
                          <FaTimesCircle size={11} />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-relaxed">
                      {q.question_text}
                    </h4>

                    {/* Options list with highlight */}
                    <div className="grid grid-cols-1 gap-2 pt-1.5">
                      {options.map((opt) => {
                        const isCorrectAnswerOption = opt.key === q.correct_answer;
                        const isUserAnswerOption = opt.key === userAns;
                        
                        let borderClass = 'border-slate-200 dark:border-slate-850';
                        let bgClass = 'bg-slate-50/50 dark:bg-[#080b14]/20';
                        let textClass = 'text-slate-600 dark:text-slate-400';
                        let badge = null;

                        if (isCorrectAnswerOption) {
                          borderClass = 'border-emerald-500 dark:border-emerald-500/50';
                          bgClass = 'bg-emerald-500/5';
                          textClass = 'text-emerald-700 dark:text-emerald-400 font-bold';
                          badge = <span className="text-[8px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded ml-auto uppercase tracking-wide">Correct Answer</span>;
                        } else if (isUserAnswerOption && !isCorrect) {
                          borderClass = 'border-red-500 dark:border-red-500/50';
                          bgClass = 'bg-red-500/5';
                          textClass = 'text-red-700 dark:text-red-400 font-bold';
                          badge = <span className="text-[8px] font-black bg-red-500 text-white px-2 py-0.5 rounded ml-auto uppercase tracking-wide">Your Choice</span>;
                        }

                        return (
                          <div 
                            key={opt.key}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed ${borderClass} ${bgClass} ${textClass}`}
                          >
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-black ${
                              isCorrectAnswerOption
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : isUserAnswerOption && !isCorrect
                                ? 'bg-red-500 border-red-500 text-white'
                                : 'bg-white dark:bg-[#0d1222] border-slate-200 dark:border-slate-800 text-slate-500'
                            }`}>
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                            {badge}
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Explanation Accordion/Panel */}
                    {q.explanation && (
                      <div className="bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/15 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-slate-650 dark:text-slate-350">
                        <FaLightbulb className="text-violet-500 shrink-0 mt-0.5" size={12} />
                        <div>
                          <p className="font-extrabold text-violet-700 dark:text-violet-400 text-[10px] uppercase tracking-wider mb-1">AI Explanation</p>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuiz;
