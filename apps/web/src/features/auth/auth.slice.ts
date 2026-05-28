import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Auth, Me } from '../../types';

// Restore auth state from localStorage
const getInitialState = (): Auth => {
  try {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return {
      accessToken: token,
      me: user
    };
  } catch {
    return { accessToken: null, me: null };
  }
};

const initialState: Auth = getInitialState();

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload ?? null;
      // Persist to localStorage
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload);
      } else {
        localStorage.removeItem('accessToken');
      }
    },
    setUser(state, action: PayloadAction<Me | null>) {
      state.me = action.payload ?? null;
      // Persist to localStorage
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    logout(state) {
      state.accessToken = null;
      state.me = null;
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }
});

export const { setToken, setUser, logout } = slice.actions;

export const selectAuth = (s: { auth: Auth }) => s.auth;
export const selectAccessToken = (s: { auth: Auth }) => s.auth.accessToken;
export const selectUser = (s: { auth: Auth }) => s.auth.me;

export default slice.reducer;
