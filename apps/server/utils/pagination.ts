export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const paginate = async <T>(
  dbQuery: Promise<T[]>,
  countQuery: Promise<{ count: number }[]>,
  page: number,
  limit: number
): Promise<PaginatedResponse<T>> => {
  const [data, totalResult] = await Promise.all([dbQuery, countQuery]);
  const total = Number(totalResult?.[0]?.count || 0);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
