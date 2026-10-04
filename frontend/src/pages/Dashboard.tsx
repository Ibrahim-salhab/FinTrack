import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { FinancialSummary, MonthlyTrend, Budget } from '../types';
import { Button } from '../components/common/Button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  AlertTriangle,
  Receipt,
  Plus,
} from 'lucide-react';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, trendData, budgetData] = await Promise.all([
        api.reports.getSummary(),
        api.reports.getMonthlyTrend(6),
        api.budgets.getAll(),
      ]);
      setSummary(summaryData);
      setTrends(trendData);
      setBudgets(budgetData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const handleUpdate = () => loadDashboardData();
    window.addEventListener('transaction-updated', handleUpdate);
    return () => window.removeEventListener('transaction-updated', handleUpdate);
  }, [loadDashboardData]);

  if (isLoading && !summary) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[#E5E5E5] animate-pulse rounded-md w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#E5E5E5] animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#E5E5E5] animate-pulse rounded-xl" />
          <div className="h-80 bg-[#E5E5E5] animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const exceededBudgets = budgets.filter((b) => b.isExceeded);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F0F0F]">Financial Overview</h1>
            <span className="px-2 py-0.5 text-xs font-bold bg-[#FF0000] text-white rounded-full">
              LIVE
            </span>
          </div>
          <p className="text-sm text-[#606060] mt-1">
            Real-time balance, cash flow analytics, and monthly budget telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/reports">
            <Button variant="outline" size="md">
              View Statement
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-xl text-[#FF0000] text-sm">
          {error}
        </div>
      )}

      {/* Budget Overrun Warning Banner */}
      {exceededBudgets.length > 0 && (
        <div className="p-4 bg-[#FB8C00]/10 border border-[#FB8C00]/30 rounded-xl flex items-start gap-3 text-[#0F0F0F]">
          <AlertTriangle className="w-5 h-5 text-[#FB8C00] shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-bold">Budget Alert: </span>
            {exceededBudgets.length} {exceededBudgets.length === 1 ? 'category has' : 'categories have'} exceeded their monthly spending limit!
            <Link to="/budgets" className="text-[#065FD4] font-bold hover:underline ml-2">
              Review Budgets &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance / Savings */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-xs">
          <div className="flex items-center justify-between text-[#606060] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Cash Flow</span>
            <DollarSign className="w-4 h-4 text-[#0F0F0F]" />
          </div>
          <div className="text-2xl font-bold text-[#0F0F0F]">
            ${summary ? summary.netSavings.toFixed(2) : '0.00'}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1 font-medium text-[#606060]">
            <span>Income minus expenses this month</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-xs">
          <div className="flex items-center justify-between text-[#606060] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-6 h-6 rounded-full bg-[#2BA640]/10 flex items-center justify-center text-[#2BA640]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2BA640]">
            +${summary ? summary.totalIncome.toFixed(2) : '0.00'}
          </div>
          <div className="mt-2 text-xs text-[#606060]">
            Current billing cycle earnings
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-xs">
          <div className="flex items-center justify-between text-[#606060] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spending</span>
            <div className="w-6 h-6 rounded-full bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000]">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#FF0000]">
            -${summary ? summary.totalExpense.toFixed(2) : '0.00'}
          </div>
          <div className="mt-2 text-xs text-[#606060]">
            Total disbursements this month
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E5E5] shadow-xs">
          <div className="flex items-center justify-between text-[#606060] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Savings Rate</span>
            <PieChart className="w-4 h-4 text-[#065FD4]" />
          </div>
          <div className="text-2xl font-bold text-[#0F0F0F]">
            {summary ? summary.savingsRate.toFixed(1) : 0}%
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#F2F2F2] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#2BA640] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(summary?.savingsRate || 0, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Monthly Trends + Spending by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Visual SVG Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F0F0F]">Income vs Expense Trends</h3>
                <p className="text-xs text-[#606060] mt-0.5">Last 6 months cash-flow velocity</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#2BA640]" />
                  Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF0000]" />
                  Expense
                </span>
              </div>
            </div>

            {/* SVG Trend Bar Chart */}
            <div className="w-full h-64 mt-6 flex items-end justify-between gap-4 px-2 pt-6 pb-2 border-b border-[#E5E5E5]">
              {trends.map((item) => {
                const maxVal = Math.max(
                  ...trends.map((t) => Math.max(t.income, t.expense)),
                  100
                );
                const incHeight = Math.max((item.income / maxVal) * 180, 4);
                const expHeight = Math.max((item.expense / maxVal) * 180, 4);

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-48">
                      {/* Income Bar */}
                      <div
                        className="w-1/2 max-w-[24px] bg-[#2BA640] rounded-t-md transition-all group-hover:brightness-110 relative"
                        style={{ height: `${incHeight}px` }}
                        title={`Income: $${item.income}`}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-1/2 max-w-[24px] bg-[#FF0000] rounded-t-md transition-all group-hover:brightness-110 relative"
                        style={{ height: `${expHeight}px` }}
                        title={`Expense: $${item.expense}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-[#606060]">
                      {item.month.substring(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#606060] pt-4 mt-2">
            <span>Chart values normalized dynamically</span>
            <Link to="/reports" className="text-[#065FD4] font-medium hover:underline flex items-center gap-1">
              <span>View full financial breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Expense Category Breakdown (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#0F0F0F]">Spending by Category</h3>
              <Link to="/categories" className="text-xs text-[#065FD4] font-medium hover:underline">
                Categories &rarr;
              </Link>
            </div>

            {summary?.expenseByCategory && summary.expenseByCategory.length > 0 ? (
              <div className="space-y-4 mt-4">
                {summary.expenseByCategory.slice(0, 5).map((cat) => (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[#0F0F0F] font-semibold">{cat.categoryName}</span>
                      <span className="text-[#606060] font-mono">
                        ${cat.amount.toFixed(2)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F2F2F2] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0F0F0F] rounded-full"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[#606060]">
                <Receipt className="w-10 h-10 mx-auto text-[#E5E5E5] mb-2" />
                <p className="text-sm">No expenses recorded for this period</p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 text-xs text-[#065FD4] font-bold hover:underline"
                >
                  + Add First Expense
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E5E5E5] mt-4 text-center">
            <span className="text-xs text-[#606060]">
              Showing top disbursement categories
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-[#0F0F0F]">Recent Transactions</h3>
            <p className="text-xs text-[#606060] mt-0.5">Most recent ledger updates</p>
          </div>
          <Link to="/transactions">
            <Button variant="outline" size="sm">
              View All Transactions
            </Button>
          </Link>
        </div>

        {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#606060] text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {summary.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F9F9F9] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-[#606060]">
                      {tx.transactionDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F2F2F2] text-[#0F0F0F]">
                        {tx.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#0F0F0F] max-w-xs truncate">
                      {tx.description || '-'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        tx.type === 'INCOME' ? 'text-[#2BA640]' : 'text-[#0F0F0F]'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-[#606060] text-sm">
            No transactions found. Click "Add Record" to start tracking.
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
