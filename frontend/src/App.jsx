import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import ResourceDetail from './pages/ResourceDetail';
import Leaderboard from './pages/Leaderboard';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import FacultyPanel from './pages/FacultyPanel';
import Chat from './pages/Chat';
import AIQuiz from './pages/AIQuiz';
import UserProfileView from './pages/UserProfileView';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  const theme = useAuthStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080d1a] dark:text-slate-100 transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/ai-quiz" 
                element={
                  <ProtectedRoute>
                    <AIQuiz />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute role="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/faculty" 
                element={
                  <ProtectedRoute role="faculty">
                    <FacultyPanel />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/user-profile/:id" 
                element={
                  <ProtectedRoute>
                    <UserProfileView />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-slate-100 dark:bg-[#050811] dark:border-slate-900 py-6 px-6 sm:px-10 flex items-center justify-center text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider transition-colors duration-300">
            <div>&copy; {new Date().getFullYear()} Smart College Resource Sharing. All rights reserved.</div>
          </footer>
        </div>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
