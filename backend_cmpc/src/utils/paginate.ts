export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function paginate<T>(
  model: any,
  page: number = 1,
  limit: number = 10,
  options: any = {},
): Promise<PaginatedResult<T>> {
  const offset = (page - 1) * limit;

  const { count, rows } = await model.findAndCountAll({
    ...options,
    limit,
    offset,
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
    },
  };
}
