import { AuthResponse, Category, Transaction, Budget, FinancialSummary, MonthlyTrend, PageResponse, TransactionType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Authentication
  auth: {
    register: (data: { email: string; password: string; firstName: string; lastName?: string }) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: () => request<AuthResponse>('/auth/me'),
  },

  // Categories
  categories: {
    getAll: (type?: TransactionType) =>
      request<Category[]>(`/categories${type ? `?type=${type}` : ''}`),
    create: (data: { name: string; type: TransactionType; icon?: string }) =>
      request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Transactions
  transactions: {
    getAll: (params: {
      type?: TransactionType;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      query?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.set('type', params.type);
      if (params.categoryId) queryParams.set('categoryId', params.categoryId);
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);
      if (params.query) queryParams.set('query', params.query);
      if (params.page !== undefined) queryParams.set('page', params.page.toString());
      if (params.size !== undefined) queryParams.set('size', params.size.toString());
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.set('sortDirection', params.sortDirection);

      return request<PageResponse<Transaction>>(`/transactions?${queryParams.toString()}`);
    },
    getById: (id: string) => request<Transaction>(`/transactions/${id}`),
    create: (data: {
      amount: number;
      type: TransactionType;
      categoryId: string;
      transactionDate: string;
      description?: string;
    }) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    update: (
      id: string,
      data: {
        amount: number;
        type: TransactionType;
        categoryId: string;
        transactionDate: string;
        description?: string;
      }
    ) => request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/transactions/${id}`, { method: 'DELETE' }),
  },

  // Budgets
  budgets: {
    getAll: (month?: string) =>
      request<Budget[]>(`/budgets${month ? `?month=${month}` : ''}`),
    set: (data: { categoryId?: string | null; amount: number; budgetMonth: string }) =>
      request<Budget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/budgets/${id}`, { method: 'DELETE' }),
  },

  // Reports
  reports: {
    getSummary: (startDate?: string, endDate?: string) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.set('startDate', startDate);
      if (endDate) queryParams.set('endDate', endDate);
      return request<FinancialSummary>(`/reports/summary?${queryParams.toString()}`);
    },
    getMonthlyTrend: (months: number = 6) =>
      request<MonthlyTrend[]>(`/reports/monthly-trend?months=${months}`),
    downloadCsvUrl: (params: { type?: TransactionType; categoryId?: string; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.set('type', params.type);
      if (params.categoryId) queryParams.set('categoryId', params.categoryId);
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);
      return `${API_BASE_URL}/reports/export/csv?${queryParams.toString()}`;
    },
    downloadPdfUrl: (params: { type?: TransactionType; categoryId?: string; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.set('type', params.type);
      if (params.categoryId) queryParams.set('categoryId', params.categoryId);
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);
      return `${API_BASE_URL}/reports/export/pdf?${queryParams.toString()}`;
    },
    exportBlob: async (type: 'csv' | 'pdf', params: { type?: TransactionType; categoryId?: string; startDate?: string; endDate?: string }) => {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.set('type', params.type);
      if (params.categoryId) queryParams.set('categoryId', params.categoryId);
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);

      const url = `${API_BASE_URL}/reports/export/${type}?${queryParams.toString()}`;
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to export ${type.toUpperCase()}`);
      }

      return res.blob();
    }
  },
};
