export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  description?: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category?: Category | null;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isExceeded: boolean;
  budgetMonth: string;
}

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  icon?: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  startDate: string;
  endDate: string;
  expenseByCategory: CategorySpend[];
  incomeByCategory: CategorySpend[];
  recentTransactions: Transaction[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}
