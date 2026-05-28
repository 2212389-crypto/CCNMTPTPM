import api from '../store/api';
import type { Transaction, PaginationQuery, PagedResp } from '../types';

export const transactionsApi = api.injectEndpoints({
  endpoints: (b) => ({
    listTransactions: b.query<PagedResp<Transaction>, PaginationQuery | void>({
      query: (q) => ({ url: '/transactions', params: q || {} }),
      providesTags: ['Transactions']
    }),
    createTransaction: b.mutation<Transaction, Partial<Transaction>>({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: ['Transactions', 'Accounts']
    }),
    updateTransaction: b.mutation<Transaction, { id: string } & Partial<Transaction>>({
      query: ({ id, ...body }) => ({ url: `/transactions/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Transactions', 'Accounts']
    }),
    deleteTransaction: b.mutation<{ success: true }, string>({
      query: (id) => ({ url: `/transactions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Transactions', 'Accounts']
    })
  }),
  overrideExisting: true
});

export const {
  useListTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation
} = transactionsApi;
