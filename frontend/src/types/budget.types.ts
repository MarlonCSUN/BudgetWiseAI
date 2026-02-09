export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  month: string;
  year: number;
  is_active: boolean;
  is_over_budget: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetCreate {
  category: string;
  limit: number;
  month?: string;
  year?: number;
}

export interface BudgetUpdate {
  limit?: number;
  is_active?: boolean;
}

export interface BudgetSummary {
  total_budgeted: number;
  total_spent: number;
  remaining: number;
  percentage_used: number;
  budgets_count: number;
  budgets_over: number;
}