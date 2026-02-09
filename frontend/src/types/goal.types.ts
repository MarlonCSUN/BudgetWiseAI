export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  percentage_completed: number;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  monthly_deposit_needed: number;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface GoalCreate {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  priority?: 'low' | 'medium' | 'high';
  initial_deposit?: number;
}

export interface GoalUpdate {
  name?: string;
  description?: string;
  target_amount?: number;
  target_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface GoalDeposit {
  amount: number;
}

export interface GoalSummary {
  active_goals: number;
  completed_goals: number;
  total_target: number;
  total_saved: number;
  total_remaining: number;
  percentage_complete: number;
}