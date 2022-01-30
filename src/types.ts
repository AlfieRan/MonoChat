interface ServiceInit {
  status: "init";
}
interface ServiceLoading {
  status: "loading";
}
interface ServiceLoaded<T> {
  status: "loaded";
  payload: T;
}
interface ServiceError {
  status: "error";
  error: Error;
}
export type Service<T> =
  | ServiceInit
  | ServiceLoading
  | ServiceLoaded<T>
  | ServiceError;

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface SuccessResponse<T> {
  successful: true;
  data: T;
}

export interface ErrorResponse {
  successful: false;
  error: string;
}

export type BaseUserType = {
  name: string;
  email: string;
  password: string;
  passwordCheck: string;
};

export type UserType = {
  name: string;
  email: string;
  password: string;
};

export type LoginType = {
  email: string;
  password: string;
};

export function isBaseUser(object: any): object is BaseUserType {
  return true;
}
