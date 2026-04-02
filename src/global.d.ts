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

 interface FieldError {
  field: string
  rejectedValue: string
  message: string
  code: string
}
