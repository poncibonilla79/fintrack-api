export interface JwtPayload {
  userId: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}
