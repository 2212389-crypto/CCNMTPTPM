import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PagedResp, PaginationQuery } from '../types';
import type { RootState } from '../store';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState)?.auth?.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  }
});

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  lastActivityType: string | null; // 'account', 'transaction', 'report', 'login', 'logout'
  isActive: boolean;
  isCurrentlyActive: boolean; // Currently logged in or not
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  activityType: 'account' | 'transaction' | 'report' | 'login';
  timestamp: string;
  description: string;
}

export interface ListUsersRequest extends PaginationQuery {
  role?: 'ADMIN' | 'USER';
  isActive?: boolean;
}

export interface ListUserActivitiesRequest extends PaginationQuery {
  userId?: string;
  activityType?: string;
  fromDate?: string;
  toDate?: string;
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes: ['User', 'UserActivity'],
  endpoints: (builder) => ({
    // Lấy danh sách users (chỉ Admin)
    listUsers: builder.query<PagedResp<User>, ListUsersRequest>({
      query: (params: ListUsersRequest) => ({
        url: '/users',
        params
      }),
      providesTags: ['User']
    }),

    // Lấy thông tin user chi tiết
    getUser: builder.query<User, string>({
      query: (id: string) => `/users/${id}`,
      providesTags: ['User']
    }),

    // Lấy lịch sử hoạt động của users
    listUserActivities: builder.query<PagedResp<UserActivity>, ListUserActivitiesRequest>({
      query: (params: ListUserActivitiesRequest) => ({
        url: '/user-activities',
        params
      }),
      providesTags: ['UserActivity']
    }),

    // Xóa user (chỉ Admin)
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id: string) => ({
        url: `/users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User', 'UserActivity']
    })
  })
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useListUserActivitiesQuery,
  useDeleteUserMutation
} = usersApi;