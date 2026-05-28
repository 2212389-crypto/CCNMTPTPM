import { useState } from "react";
import type { SortOrder } from "../types";

type Init = {
  page?: number;  limit?: number;
  sortBy?: string; sortOrder?: SortOrder;
  q?: string;
};

export default function useQueryState(initial?: Init) {
  const [page, setPage] = useState<number>(initial?.page ?? 1);
  const [limit, setLimit] = useState<number>(initial?.limit ?? 10);
  const [sortBy, setSortBy] = useState<string>(initial?.sortBy ?? "createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>(initial?.sortOrder ?? "desc");
  const [q, setQ] = useState<string>(initial?.q ?? "");

  return { page, setPage, limit, setLimit, sortBy, setSortBy, sortOrder, setSortOrder, q, setQ };
}
