import prisma from '../config/database';
import { AppError } from '../utils/app-error';
import { CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';

export const categoryService = {
  async list(userId: string) {
    return prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: [{ userId: { sort: 'asc', nulls: 'last' } }, { name: 'asc' }],
    });
  },

  async create(data: CreateCategoryDto, userId: string) {
    const existing = await prisma.category.findFirst({
      where: { userId, name: data.name },
    });
    if (existing) {
      throw new AppError(409, 'Ya existe una categoria con ese nombre');
    }
    return prisma.category.create({
      data: { ...data, userId },
    });
  },

  async update(id: string, userId: string, data: UpdateCategoryDto) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new AppError(404, 'Categoria no encontrada');

    return prisma.category.update({ where: { id }, data });
  },

  async remove(id: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new AppError(404, 'Categoria no encontrada');

    const txCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (txCount > 0) {
      throw new AppError(409, 'No se puede eliminar: tiene transacciones asociadas');
    }

    return prisma.category.delete({ where: { id } });
  },
};
