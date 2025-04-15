export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  type: 'income' | 'expense';
  paymentMethod: string;
  creditCardId: string | null;
  createdAt?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  limit: number;
  dueDay: number;
  closingDay: number;
  createdAt?: string;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  dayOfMonth: number;
  notes: string;
  creditCardId: string | null;
  createdAt?: string;
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface MonthData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface BalanceData {
  date: string;
  balance: number;
}
