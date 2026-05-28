import api from '../store/api';
import type { Account, PaginationQuery, PagedResp } from '../types';

export const accountsApi = api.injectEndpoints({
  endpoints: (b) => ({
    listAccounts: b.query<PagedResp<Account>, PaginationQuery | void>({
      query: (q) => ({ url: '/accounts', params: q || {} }),
      providesTags: ['Accounts']
    }),
    createAccount: b.mutation<Account, Partial<Account>>({
      query: (body) => ({ url: '/accounts', method: 'POST', body }),
      invalidatesTags: ['Accounts']
    }),
    deleteAccount: b.mutation<{ success: true }, string>({
      query: (id) => ({ url: `/accounts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Accounts']
    })
  }),
  overrideExisting: true
});

export const {
  useListAccountsQuery,
  useCreateAccountMutation,
  useDeleteAccountMutation
} = accountsApi;
