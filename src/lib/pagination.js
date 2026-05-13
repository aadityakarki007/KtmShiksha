export function buildPagination(query, total) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    pages,
    total,
    skip: (page - 1) * limit,
  };
}

export function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
