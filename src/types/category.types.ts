import { TransactionType } from './enums.types';

export interface CreateCategoryDto {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  userId: string | null;
}
