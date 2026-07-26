import { TransactionType } from './enums.types';
import { CategoryResponse } from './category.types';

export interface CreateTransactionDto {
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  description?: string;
  date?: string;
  type?: TransactionType;
  categoryId?: string;
}

export interface TransactionFilter {
  month?: number;
  year?: number;
  type?: TransactionType;
  categoryId?: string;
}

export interface TransactionResponse {
  id: string;
  amount: number;
  description: string;
  date: Date;
  type: TransactionType;
  userId: string;
  categoryId: string;
}

export interface TransactionWithCategory extends TransactionResponse {
  category: Pick<CategoryResponse, 'id' | 'name' | 'icon' | 'color'>;
}
