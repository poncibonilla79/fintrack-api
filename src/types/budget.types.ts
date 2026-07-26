import { CategoryResponse } from './category.types';

export interface CreateBudgetDto {
  amount: number;
  month: number;
  year: number;
  categoryId?: string | null;
}

export interface BudgetFilter {
  month: number;
  year: number;
}

export interface BudgetResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string | null;
  userId: string;
}

export interface BudgetWithCategory extends BudgetResponse {
  category: Pick<CategoryResponse, 'id' | 'name' | 'icon' | 'color'> | null;
}
