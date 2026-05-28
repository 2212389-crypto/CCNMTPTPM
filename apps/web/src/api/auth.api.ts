import api from '../store/api';
import type { Me } from '../types';

type LoginBody = { email: string; password: string };
type RegisterBody = { email: string; password: string; fullName: string };
type LoginResp = { accessToken: string; me: Me };

export const authApi = api.injectEndpoints({
  endpoints: (b) => ({
    login: b.mutation<LoginResp, LoginBody>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth', 'Me']
    }),
    register: b.mutation<LoginResp, RegisterBody>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth', 'Me']
    }),
    logout: b.mutation<{ message: string }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth', 'Me']
    }),
    me: b.query<Me, void>({
      query: () => '/auth/me',
      providesTags: ['Me']
    })
  }),
  overrideExisting: true
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useMeQuery } = authApi;
