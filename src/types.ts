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

export type MessageInfo = {
  id: string;
  content: string;
  sender: { id: string; name: string };
};

export function isBaseUser(object: any): object is BaseUserType {
  return true;
}

export type UserLogging = UserIsLogging | UserIsntLogging;

interface UserIsLogging {
  logged: true;
  name: string;
}
interface UserIsntLogging {
  logged: false;
}
