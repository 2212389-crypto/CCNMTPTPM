export function parsePaging(q: any) {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 10));
  const skip = (page - 1) * limit;
  const sortBy = (q.sortBy as string) || "createdAt";
  const sortOrder = (q.sortOrder as "asc"|"desc") || "desc";
  return { page, limit, skip, orderBy: { [sortBy]: sortOrder } } as const;
}
