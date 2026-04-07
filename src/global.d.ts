interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

 interface ApiErrorResponse {
  status: number
  error: string
  message: string
  path: string
  timestamp: string
  success: boolean
  fieldErrors: FieldError[]
}

interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

 interface FieldError {
  field: string
  rejectedValue: string
  message: string
  code: string
}


interface ApiPaginationResponse<T> extends ApiResponse<PaginatedResponse<T>> {}

