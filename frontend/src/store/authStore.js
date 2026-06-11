import { create } from 'zustand';

const initialUser = (() => {
  try {
    const u = localStorage.getItem('user');
    if (!u || u === 'null' || u === 'undefined') return null;
    return JSON.parse(u);
  } catch (e) {
    return null;
  }
})();

const initialToken = (() => {
  const token = localStorage.getItem('accessToken');
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
})();

export const useAuthStore = create((set) => ({
  user: initialUser,
  accessToken: initialToken,
  isAuthenticated: !!initialToken,
  theme: localStorage.getItem('theme') || 'dark',

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),

  login: (userData, tokens) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    set({
      user: userData,
      accessToken: tokens.access,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  updateUser: (data) => {
    localStorage.setItem('user', JSON.stringify(data));
    set({ user: data });
  },

  setTokens: (access, refresh) => {
    localStorage.setItem('accessToken', access);
    if (refresh) {
      localStorage.setItem('refreshToken', refresh);
    }
    set({
      accessToken: access,
      isAuthenticated: true,
    });
  }
}));
