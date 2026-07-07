export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

export type ApiListResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}>;
