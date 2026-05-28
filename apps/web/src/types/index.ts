export type SortOrder = 'asc' | 'desc';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  q?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

export type PagedResp<T> = {
  items: T[];
  meta: PageMeta;
};

export interface Me {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
}

/** Redux auth state */
export interface Auth {
  accessToken: string | null;
  me: Me | null;
}

export interface Account {
  id: string;
  name: string;
  currency: string;
  ownerId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  note?: string;
  occurredAt: string;
  createdAt: string;
}

export interface Report {
  month: number;
  income: number;
  expense: number;
}
