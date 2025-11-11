export interface IUser {
  _id?: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Partial<IUser>;
}

// API request/response shapes
export interface UserCreateRequest {
  name?: string;
  email: string;
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface GenericResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  dueDate?: string | Date;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: "pending" | "completed";
  dueDate?: string | Date | null;
}

export interface TaskResponse {
  _id: string;
  title: string;
  description?: string | undefined;
  status: "pending" | "completed";
  dueDate?: string | null;
  owner: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TaskListResponse {
  success: boolean;
  data: TaskResponse[];
}

// Helper for controller middleware - augment Request type usage in controllers
export interface AuthenticatedRequestUser extends JwtPayload {}

