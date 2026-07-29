import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/app-error';
import { CreateUserDto, UpdateUserDto, UserPublic } from '../types/user.types';
import bcrypt from 'bcryptjs';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const usersService = {
  async findAll(): Promise<UserPublic[]> {
    return prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string): Promise<UserPublic | null> {
    return prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  },

  async create(data: CreateUserDto): Promise<UserPublic> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
      },
      select: USER_SELECT,
    });
  },

  async update(id: string, data: UpdateUserDto, userId: string): Promise<UserPublic> {
    if (id !== userId) throw new AppError(403, 'No tienes permiso para modificar este usuario');

    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });
  },

  async remove(id: string, userId: string): Promise<void> {
    if (id !== userId) throw new AppError(403, 'No tienes permiso para eliminar este usuario');

    await prisma.user.delete({ where: { id } });
  },
};
