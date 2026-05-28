import { useState } from "react";
import type { SortOrder } from "@/types";

export function useQueryState(initial?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  q?: string;
}) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [sortBy, setSortBy] = useState(initial?.sortBy ?? "createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>(initial?.sortOrder ?? "desc");
  const [q, setQ] = useState(initial?.q ?? "");

  return { page, setPage, limit, setLimit, sortBy, setSortBy, sortOrder, setSortOrder, q, setQ };
}
