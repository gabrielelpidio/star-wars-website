export type PaginatedResponse<T> = {
  count: string;
  next: string | null;
  previous: string | null;
  results: T[];
};
