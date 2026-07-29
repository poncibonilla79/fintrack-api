export interface CategoryBreakdown {
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
  amount: number;
  count: number;
}

export interface MonthlySummaryResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: CategoryBreakdown[];
}

export interface BudgetDetail {
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  budget: number;
  spent: number;
  remaining: number;
}

export interface BudgetVsActualResponse {
  totalBudget: number;
  totalSpent: number;
  globalRemaining: number;
  byCategory: BudgetDetail[];
}

export interface MonthlyTrend {
  month: string;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface RawTrendRow {
  month: number;
  year: number;
  income: string;
  expense: string;
}
