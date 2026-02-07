const parsePagination = (query) => {
  const pageRaw = query?.page;
  const limitRaw = query?.limit;
  const page = pageRaw ? Math.max(1, parseInt(pageRaw)) : 1;
  const limit = limitRaw ? Math.min(50, Math.max(1, parseInt(limitRaw))) : 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginateArray = (items, page, limit) => {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: items.slice(start, end),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
};

export { parsePagination, paginateArray };
