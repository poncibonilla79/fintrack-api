import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../utils/app-error';
import { getJwtSecret, getJwtExpiry } from '../utils/jwt.util';
import { AuthResponse } from '../types/auth.types';
import { UserPublic } from '../types/user.types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'El email ya esta registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret(),
      { expiresIn: getJwtExpiry() }
    );

    return { token, user };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Credenciales invalidas');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError(401, 'Credenciales invalidas');
    }

    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret(),
      { expiresIn: getJwtExpiry() }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    };
  },

  async getProfile(userId: string): Promise<UserPublic> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new AppError(404, 'Usuario no encontrado');
    return user;
  },
};
