/**
 * Standard API Response envelope
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

/**
 * Standard Server Action / Mutation Response
 */
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}
