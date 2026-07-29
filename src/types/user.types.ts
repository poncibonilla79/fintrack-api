import { User } from '@prisma/client';

export type UserPublic = Omit<User, 'password'>;

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}
