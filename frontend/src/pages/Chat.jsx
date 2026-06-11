import React, { useEffect, useState, useRef } from 'react';
import { 
  FaPaperPlane, FaComments, FaUsers, FaHashtag, 
  FaInfoCircle, FaShieldAlt, FaCircle, FaCog, FaQuestionCircle,
  FaPlus, FaRegSmile, FaTrash, FaTerminal, FaKeyboard, FaBookOpen
} from 'react-icons/fa';
import { chatAPI } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Popover / Modal state controls
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState('faq');

  const renderSidebarContent = () => (
    <div className="bg-white dark:bg-[#0d1222]/90 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-full text-left overflow-hidden">
      <div className="space-y-5 flex-grow overflow-y-auto pr-1">
        {/* Lobby Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 uppercase">
            <FaCircle className="h-1.5 w-1.5 text-emerald-500 animate-ping" /> Global Lobby
          </span>
        </div>

        {/* Peer Lounge Active selector */}
        <button className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold bg-violet-50/50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20 shadow-sm transition-all text-left">
          <FaUsers size={16} className="text-violet-500" />
          <span>Peer Lounge</span>
        </button>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Welcome to the official SmartShare chat lobby! Hang out here to discuss courses, ask questions, and collaborate with classmates across all semesters.
        </p>

        {/* Online Status */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <span className="flex items-center gap-1.5">
            <FaUsers size={12} className="text-violet-500" />
            <span>Participants</span>
          </span>
          <span className="bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-md text-[10px] font-extrabold border border-violet-200 dark:border-violet-800/60">
            Online
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 my-2"></div>

        {/* Rules */}
        <div className="space-y-3.5 text-left">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <FaShieldAlt className="text-violet-500" />
            <span>Community Rules</span>
          </h4>
          <ul className="space-y-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            <li className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-400 font-bold">1.</span>
              <span>Maintain mutual respect. No slurs, hate speech, or harassment.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-400 font-bold">2.</span>
              <span>Keep content related to academics, projects, and university events.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-400 font-bold">3.</span>
              <span>Do not spam links, advertise external products, or leak exam papers.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-400 font-bold">4.</span>
              <span>Violating guidelines will lead to a temporary or permanent ban.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sidebar Actions: Settings & Help */}
      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2 space-y-1.5 flex-shrink-0">
        <button 
          onClick={() => {
            setShowSettingsModal(true);
            setShowMobileSidebar(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white transition-all text-left cursor-pointer"
        >
          <FaCog size={13} className="text-slate-400" />
          <span>Settings</span>
        </button>
        <button 
          onClick={() => {
            setShowHelpModal(true);
            setShowMobileSidebar(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white transition-all text-left cursor-pointer"
        >
          <FaQuestionCircle size={13} className="text-slate-400" />
          <span>Help</span>
        </button>
      </div>
    </div>
  );

  // Settings configurations
  const [compactMode, setCompactMode] = useState(
    localStorage.getItem('chatCompactMode') === 'true'
  );
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('chatSoundEnabled') !== 'false'
  );

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const EMOJIS = ['😀', '😂', '🤣', '😊', '😍', '😘', '😜', '😎', '👍', '👎', '❤️', '🔥', '🎉', '👏', '🙌', '🤔', '👀', '✨', '💯', '🎈', '⚡', '💡', '🚀', '🎓'];

  // Fetch messages initially and setup polling
  useEffect(() => {
    fetchMessages(true);
    
    // Set up polling every 3 seconds
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  const fetchMessages = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await chatAPI.getMessages();
      const newMessages = res.data || [];
      
      setMessages((prevMessages) => {
        // Play notification sound on new incoming messages
        if (!initial && newMessages.length > prevMessages.length) {
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.user?.id !== user?.id) {
            playNotificationSound();
          }
        }

        // Simple optimization: only update state and scroll if message list length or content changes
        if (prevMessages.length !== newMessages.length) {
          // Trigger scroll to bottom on new messages
          setTimeout(() => scrollToBottom(initial ? 'auto' : 'smooth'), 100);
          return newMessages;
        }
        // Check if any message IDs changed or content changed
        const hasChanges = newMessages.some((msg, idx) => 
          prevMessages[idx]?.id !== msg.id || prevMessages[idx]?.message !== msg.message
        );
        if (hasChanges) {
          setTimeout(() => scrollToBottom('smooth'), 100);
          return newMessages;
        }
        return prevMessages;
      });
    } catch (err) {
      console.error('Failed to fetch chat messages', err);
      if (initial) toast.error('Failed to load chat room messages');
    } finally {
      if (initial) setLoading(false);
    }
  };

  const playNotificationSound = () => {
    if (localStorage.getItem('chatSoundEnabled') === 'false') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.2);
      }, 80);
    } catch (e) {
      console.warn("Audio Context not allowed yet", e);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setSending(true);
      try {
        const res = await chatAPI.sendMessage(base64Data);
        setMessages(prev => {
          const updated = [...prev, res.data];
          setTimeout(() => scrollToBottom('smooth'), 50);
          return updated;
        });
        toast.success('Image shared successfully!');
      } catch (err) {
        toast.error('Failed to send image');
      } finally {
        setSending(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history? This will hide previous messages from your view, but other users will still see them.')) return;
    try {
      await chatAPI.clearHistory();
      setMessages([]);
      toast.success('Your chat history has been cleared successfully');
    } catch (err) {
      toast.error('Failed to clear chat history');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let messageText = newMessage.trim();
    
    // Replace custom inline shortcuts with their emoticons
    messageText = messageText.replace(/\/shrug/g, '🤷‍♂️');
    messageText = messageText.replace(/\/tableflip/g, '🤬 ┻━┻');

    if (messageText === '/points') {
      toast(`🏆 Contributor Score: ${user?.points || 0} points`, {
        icon: '👏',
        style: {
          background: '#8b5cf6',
          color: '#ffffff',
        }
      });
      setNewMessage('');
      return;
    }

    setNewMessage('');
    setSending(true);

    try {
      const res = await chatAPI.sendMessage(messageText);
      setMessages(prev => {
        const updated = [...prev, res.data];
        setTimeout(() => scrollToBottom('smooth'), 50);
        return updated;
      });
    } catch (err) {
      toast.error('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatChatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await chatAPI.deleteMessage(messageId);
      toast.success('Message deleted successfully');
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message', err);
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-185px)] min-h-[350px] flex flex-col transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow h-full min-h-0">
        
        {/* Left Column: Info, Guidelines & Sidebar Actions - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex lg:col-span-1 flex-col h-full min-h-0">
          {renderSidebarContent()}
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0d1222]/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg dark:shadow-2xl flex flex-col h-full min-h-0 overflow-hidden">
          
          {/* Chat Window Header */}
          <div className="px-4 sm:px-6 py-4.5 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0b0f1b]/40 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5 text-left min-w-0">
              <span className="text-slate-400 dark:text-slate-650 flex items-center justify-center font-bold flex-shrink-0">
                <FaHashtag size={15} className="text-violet-600 dark:text-violet-400" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white leading-none truncate">general-discussion</h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 truncate">Lounge for queries and resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-wider rounded-xl border border-violet-100 dark:border-violet-900/30 cursor-pointer"
              >
                <FaUsers size={11} />
                <span>Info</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-405 dark:text-slate-500">
                <FaInfoCircle size={12} className="text-violet-500" />
                <span>50 messages max</span>
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div 
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/10 dark:bg-slate-950/20"
          >
            {loading ? (
              // Skeletal messages loader
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`flex items-start gap-3.5 max-w-lg ${i % 2 === 0 ? 'ml-auto flex-row-reverse text-right' : ''}`}>
                    <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="space-y-1.5 flex-grow">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24 animate-pulse"></div>
                      <div className="h-10 bg-slate-100 dark:bg-[#0f1528] rounded-xl w-60 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-dashed border-violet-300">
                  <FaComments size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700 dark:text-white">Lobby is Quiet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Be the first to break the ice and start a discussion!</p>
                </div>
              </div>
            ) : (
              // Message List
              messages.map((msg, index) => {
                const isCurrentUser = msg.user?.id === user?.id;
                const senderName = msg.user?.username || 'Peer';
                const senderAvatar = msg.user?.avatar || null;
                const canDelete = isCurrentUser || user?.role === 'admin' || user?.is_staff || user?.is_superuser;

                return (
                  <div 
                    key={msg.id || index}
                    className={`flex items-start group animate-fadeIn ${
                      compactMode ? 'gap-2.5 py-0.5' : 'gap-3.5 py-1.5'
                    } ${isCurrentUser ? 'ml-auto flex-row-reverse text-right' : 'text-left'}`}
                    style={{ maxWidth: '85%' }}
                  >
                    {/* User Avatar with online status indicator (hidden in compact mode) */}
                    {!compactMode && (
                      <div className="relative flex-shrink-0">
                        {senderAvatar ? (
                          <img 
                            src={senderAvatar} 
                            alt={senderName} 
                            className="h-9 w-9 rounded-full object-cover border border-violet-500/20"
                          />
                        ) : (
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-black capitalize select-none text-white shadow ${
                            isCurrentUser 
                              ? 'bg-gradient-to-tr from-violet-600 to-indigo-600' 
                              : 'bg-gradient-to-tr from-purple-500 to-pink-500'
                          }`}>
                            {senderName[0]}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d1222]"></span>
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="space-y-0.5 max-w-xl">
                      {/* Message Meta: User + Time */}
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {isCurrentUser ? (
                          <>
                            <span>{formatChatTime(msg.created_at)}</span>
                            <span className="text-slate-700 dark:text-slate-350 font-black">{senderName}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-700 dark:text-slate-350 font-black">{senderName}</span>
                            <span>{formatChatTime(msg.created_at)}</span>
                          </>
                        )}
                      </div>

                      {/* Bubble & Actions Wrapper */}
                      <div className={`flex items-center gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Text Bubble */}
                        <div className={`shadow-sm break-words border text-left ${
                          compactMode ? 'px-3 py-1.5 text-xs rounded-xl' : 'px-4 py-2.5 text-sm rounded-2xl'
                        } ${
                          isCurrentUser 
                            ? 'bg-violet-600 text-white border-violet-500/10 dark:border-violet-500/20 shadow-violet-500/5' 
                            : 'bg-slate-100 dark:bg-[#0c1222] text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-slate-800/80'
                        }`}>
                          {msg.message.startsWith('data:image/') ? (
                            <div className="space-y-1">
                              <img 
                                src={msg.message} 
                                alt="Attachment" 
                                className="max-w-xs max-h-48 rounded-xl object-cover border border-violet-500/10 cursor-zoom-in hover:opacity-95 transition-opacity"
                                onClick={() => {
                                  const w = window.open();
                                  if (w) {
                                    w.document.write(`<iframe src="${msg.message}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                  }
                                }}
                              />
                              <p className="text-[9px] opacity-60 italic">Image attachment</p>
                            </div>
                          ) : (
                            <p>{msg.message}</p>
                          )}
                        </div>

                        {/* Delete Button (visible on hover) */}
                        {canDelete && msg.id && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer flex-shrink-0"
                            title="Delete Message"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-[#090f1e] transition-colors duration-300 relative">
            
            {/* Hidden file input for images */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />

            {/* Attachment Dropdown Popover */}
            {showAttachmentMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowAttachmentMenu(false)} />
                <div className="absolute bottom-full mb-2 left-4 bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-2xl z-40 w-48 flex flex-col gap-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                      setShowAttachmentMenu(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white transition-all text-left cursor-pointer"
                  >
                    <span>📷</span>
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      toast.success("Document attached: Notes.pdf (mock)");
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white transition-all text-left cursor-pointer"
                  >
                    <span>📄</span>
                    <span>Share Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      toast.success("Study material link attached (mock)");
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white transition-all text-left cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>Share Material Link</span>
                  </button>
                </div>
              </>
            )}

            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
                <div className="absolute bottom-full mb-2 right-24 bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl z-40 w-60 grid grid-cols-6 gap-2 text-center select-none">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-3">
              {/* Inner wrapper for input, plus icon, and emoji icon */}
              <div className="flex-grow flex items-center bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800/80 rounded-2xl px-3.5 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
                {/* Plus button */}
                <button 
                  type="button" 
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  <span className="flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-full h-5 w-5 text-xs font-black font-sans">+</span>
                </button>

                {/* Text input */}
                <input
                  type="text"
                  disabled={sending}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message #general-discussion"
                  className="w-full min-w-0 bg-transparent border-none outline-none py-3 px-3.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500"
                />

                {/* Emoji button */}
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-slate-455 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  <span className="text-base select-none">☺</span>
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/10 active:scale-95 disabled:opacity-40 disabled:hover:from-violet-600 disabled:hover:to-indigo-600 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Send</span>
                <span className="text-xs font-bold leading-none select-none">▷</span>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowSettingsModal(false)} />
          <div className="bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800/80 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-scaleUp text-left z-10 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <FaCog className="text-violet-600 dark:text-violet-400" />
                <span>Lobby Settings</span>
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-5">
              {/* Compact Mode setting */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Compact Layout</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Hides avatars and decreases message spacing.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !compactMode;
                    setCompactMode(nextMode);
                    localStorage.setItem('chatCompactMode', String(nextMode));
                  }}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${compactMode ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${compactMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Sound notification setting */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Notification Sound</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Plays a chime on new incoming messages.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextSound = !soundEnabled;
                    setSoundEnabled(nextSound);
                    localStorage.setItem('chatSoundEnabled', String(nextSound));
                  }}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${soundEnabled ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${soundEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Personal Chat Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-red-500">Danger Zone</h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    handleClearHistory();
                  }}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-extrabold border border-red-200 dark:border-red-900/35 transition-all cursor-pointer text-center"
                >
                  Clear My Chat History
                </button>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button 
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowHelpModal(false)} />
          <div className="bg-white/95 dark:bg-[#0d1222]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative animate-scaleUp text-left z-10 text-slate-800 dark:text-slate-100 max-h-[85vh] flex flex-col min-h-[450px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <FaQuestionCircle className="text-violet-600 dark:text-violet-400" />
                <span>Help & Documentation</span>
              </h3>
              <button 
                onClick={() => setShowHelpModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-150 dark:border-slate-800/30 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveHelpTab('faq')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeHelpTab === 'faq'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/10'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <FaBookOpen size={13} />
                <span>FAQs</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab('commands')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeHelpTab === 'commands'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/10'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <FaTerminal size={12} />
                <span>Commands</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveHelpTab('shortcuts')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeHelpTab === 'shortcuts'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/10'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <FaKeyboard size={13} />
                <span>Shortcuts</span>
              </button>
            </div>
            
            {/* Modal Body / Scrollable Content */}
            <div className="flex-grow overflow-y-auto pr-1">
              
              {/* FAQ Section */}
              {activeHelpTab === 'faq' && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all border-l-4 border-l-violet-500 text-left">
                    <h5 className="font-extrabold text-[12px] sm:text-[13px] text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0 animate-pulse"></span>
                      Who can use the Peer Lounge?
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-[11px] leading-relaxed pl-3.5 font-medium">
                      Any registered, authenticated student or faculty member can access the global chat room to talk and share resources.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all border-l-4 border-l-violet-500 text-left">
                    <h5 className="font-extrabold text-[12px] sm:text-[13px] text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0 animate-pulse"></span>
                      Can I share attachments?
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-[11px] leading-relaxed pl-3.5 font-medium">
                      Yes! Click the <code className="bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold border border-violet-200/30">+</code> button in the input bar. You can upload images up to 2MB. They will be shared in real time.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all border-l-4 border-l-violet-500 text-left">
                    <h5 className="font-extrabold text-[12px] sm:text-[13px] text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0 animate-pulse"></span>
                      What is the Contributor Score?
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-[11px] leading-relaxed pl-3.5 font-medium">
                      You earn points when other classmates download or review the academic resources you upload in SmartShare.
                    </p>
                  </div>
                </div>
              )}

              {/* Slash Commands Section */}
              {activeHelpTab === 'commands' && (
                <div className="space-y-3.5 animate-fadeIn">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-1">
                    Type these directly in the chat box or click to auto-insert them:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { name: '/shrug', desc: 'Inserts a shrug emoji 🤷‍♂️', value: '🤷‍♂️' },
                      { name: '/tableflip', desc: 'Inserts a tableflip emoji 🤬 ┻━┻', value: '🤬 ┻━┻' },
                      { name: '/points', desc: 'Displays your current contributor points in a purple toast notification', value: '/points' }
                    ].map((cmd) => (
                      <button
                        key={cmd.name}
                        onClick={() => {
                          if (cmd.name === '/points') {
                            toast(`🏆 Contributor Score: ${user?.points || 0} points`, {
                              icon: '👏',
                              style: {
                                background: '#8b5cf6',
                                color: '#ffffff',
                              }
                            });
                          } else {
                            setNewMessage(prev => {
                              const spacer = prev.trim() ? ' ' : '';
                              return prev + spacer + cmd.value;
                            });
                            toast.success(`Inserted emoticon!`);
                          }
                          setShowHelpModal(false);
                        }}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/60 rounded-2xl hover:border-violet-500/80 dark:hover:border-violet-550/50 hover:bg-violet-50/20 dark:hover:bg-violet-950/15 transition-all text-left group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="inline-block font-mono text-[11px] font-black text-violet-600 dark:text-violet-400 bg-violet-100/70 dark:bg-violet-950/50 border border-violet-200/50 dark:border-violet-850 px-2 py-0.5 rounded-lg group-hover:scale-[1.03] transition-transform">
                            {cmd.name}
                          </span>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-2 font-medium truncate">{cmd.desc}</p>
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800 px-3 py-1 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all">
                          Use
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts Section */}
              {activeHelpTab === 'shortcuts' && (
                <div className="space-y-4 animate-fadeIn">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-1">
                    Useful shortcuts for fast keyboard navigation:
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800/65 hover:border-violet-500/20 transition-all">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">Send Message</span>
                      <kbd className="px-3 py-1.5 text-xs font-bold font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-350 dark:border-slate-700 rounded-lg shadow-[0_2.5px_0_rgba(0,0,0,0.15)] dark:shadow-[0_2.5px_0_rgba(255,255,255,0.05)] select-none">
                        Enter
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800/65 hover:border-violet-500/20 transition-all">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">Close Popups / Modals</span>
                      <kbd className="px-3 py-1.5 text-xs font-bold font-sans text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-350 dark:border-slate-700 rounded-lg shadow-[0_2.5px_0_rgba(0,0,0,0.15)] dark:shadow-[0_2.5px_0_rgba(255,255,255,0.05)] select-none">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/60 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Rules & Guidelines Drawer Modal */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 flex items-center justify-start lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowMobileSidebar(false)} 
          />
          
          {/* Drawer Panel */}
          <div className="bg-white dark:bg-[#0c1121] border-r border-slate-200 dark:border-slate-800 h-full w-full max-w-xs shadow-2xl relative flex flex-col justify-between text-left animate-slideInLeft z-10 text-slate-800 dark:text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 flex-shrink-0">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-350 flex items-center gap-2">
                <FaInfoCircle size={11} className="text-violet-600 dark:text-violet-400" />
                <span>Lobby Info</span>
              </span>
              <button 
                onClick={() => setShowMobileSidebar(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
