import { configureStore } from '@reduxjs/toolkit';
import api from './api';
import auth from '@/features/auth/auth.slice';
import { usersApi } from '../api/users.api';

export const store = configureStore({
  reducer: {
    auth,
    [api.reducerPath]: api.reducer,
    [usersApi.reducerPath]: usersApi.reducer
  },
  middleware: (g) => g().concat(api.middleware, usersApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
