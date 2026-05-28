import api from '../store/api';
import type { Report } from '../types';

export const reportsApi = api.injectEndpoints({
  endpoints: (b) => ({
    monthlySummary: b.query<Report[], { year: number }>({
      query: ({ year }) => ({ url: '/reports/monthly-summary', params: { year } }),
      providesTags: ['Reports']
    })
  }),
  overrideExisting: true
});

export const { useMonthlySummaryQuery } = reportsApi;
