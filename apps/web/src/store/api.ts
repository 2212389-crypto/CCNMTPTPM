import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.auth?.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ['Auth', 'Me', 'Accounts', 'Transactions', 'Reports'],
  endpoints: () => ({})
});

export default api;
