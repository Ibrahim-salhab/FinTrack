import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Transaction, Category, TransactionType, PageResponse } from '../types';
import { Button } from '../components/common/Button';
import { Chip } from '../components/common/Chip';
import { TransactionModal } from '../components/transactions/TransactionModal';
import {
  Download,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ArrowUpDown,
  Search,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<Transaction> | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('query') || '');
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('transactionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.categories.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.transactions.getAll({
        type: selectedType === 'ALL' ? undefined : selectedType,
        categoryId: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        query: searchQuery || undefined,
        page,
        size: pageSize,
        sortBy,
        sortDirection,
      });
      setTransactions(res.content);
      setPageInfo(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, selectedCategory, startDate, endDate, searchQuery, page, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setIsDeleting(id);
    try {
      await api.transactions.delete(id);
      loadTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(format);
    try {
      const blob = await api.reports.exportBlob(format, {
        type: selectedType === 'ALL' ? undefined : selectedType,
        categoryId: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'transactions.csv' : 'finance-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || `Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F0F]">Transactions Ledger</h1>
          <p className="text-sm text-[#606060] mt-1">
            Filter, search, audit, and export your entire financial history.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            isLoading={isExporting === 'csv'}
            className="flex items-center gap-1.5"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2BA640]" />
            <span>CSV Export</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            isLoading={isExporting === 'pdf'}
            className="flex items-center gap-1.5"
            title="Download formatted PDF statement"
          >
            <FileText className="w-4 h-4 text-[#FF0000]" />
            <span>PDF Statement</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 ml-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-xl text-[#FF0000] text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-xs space-y-4">
        {/* Horizontal Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Chip
            label="All Records"
            isSelected={selectedType === 'ALL'}
            onClick={() => {
              setSelectedType('ALL');
              setPage(0);
            }}
          />
          <Chip
            label="Expenses"
            isSelected={selectedType === 'EXPENSE'}
            onClick={() => {
              setSelectedType('EXPENSE');
              setPage(0);
            }}
          />
          <Chip
            label="Incomes"
            isSelected={selectedType === 'INCOME'}
            onClick={() => {
              setSelectedType('INCOME');
              setPage(0);
            }}
          />
        </div>

        {/* Filters Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#E5E5E5]">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search description..."
              className="w-full h-9 pl-9 pr-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="w-full h-9 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="w-full h-9 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
              placeholder="Start date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="w-full h-9 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-xs font-semibold uppercase text-[#606060] tracking-wider">
              <tr>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-[#0F0F0F] select-none"
                  onClick={() => {
                    setSortBy('transactionDate');
                    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Description</th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-[#0F0F0F] select-none"
                  onClick={() => {
                    setSortBy('amount');
                    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E5E5]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#606060]">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-[#0F0F0F] border-t-transparent rounded-full mb-2" />
                    <p>Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F9F9F9] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[#606060]">
                      {t.transactionDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          t.type === 'INCOME'
                            ? 'bg-[#2BA640]/10 text-[#2BA640]'
                            : 'bg-[#FF0000]/10 text-[#FF0000]'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#0F0F0F]">{t.category.name}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[#0F0F0F] max-w-sm truncate">
                      {t.description || '-'}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold text-base ${
                        t.type === 'INCOME' ? 'text-[#2BA640]' : 'text-[#0F0F0F]'
                      }`}
                    >
                      {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTransaction(t);
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#606060] hover:text-[#0F0F0F] hover:bg-[#F2F2F2] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          disabled={isDeleting === t.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#606060] hover:text-[#FF0000] hover:bg-[#F2F2F2] transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#606060]">
                    <p className="text-base font-medium text-[#0F0F0F]">No transactions match your filters</p>
                    <p className="text-xs text-[#606060] mt-1">Try resetting the search terms or date filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pageInfo && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#606060]">
            <div>
              Showing {transactions.length} of {pageInfo.totalElements} records (Page {pageInfo.pageNumber + 1} of {Math.max(pageInfo.totalPages, 1)})
            </div>

            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="h-8 px-2 bg-white border border-[#E5E5E5] rounded-md text-xs focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageInfo.isFirst || page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageInfo.isLast || page >= pageInfo.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={loadTransactions}
        initialData={editingTransaction}
      />
    </div>
  );
};
