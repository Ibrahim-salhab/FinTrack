import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { FinancialSummary, MonthlyTrend } from '../types';
import { Button } from '../components/common/Button';
import { FileSpreadsheet, FileText, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, trendData] = await Promise.all([
        api.reports.getSummary(startDate || undefined, endDate || undefined),
        api.reports.getMonthlyTrend(12),
      ]);
      setSummary(sumData);
      setTrends(trendData);
    } catch (err: any) {
      setError(err.message || 'Failed to generate financial reports');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(format);
    try {
      const blob = await api.reports.exportBlob(format, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? 'financial-report.csv' : 'financial-statement.pdf';
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F0F]">Financial Statements &amp; Reports</h1>
          <p className="text-sm text-[#606060] mt-1">
            Comprehensive audit, category distributions, and downloadable statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleExport('csv')}
            isLoading={isExporting === 'csv'}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2BA640]" />
            <span>Download CSV</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleExport('pdf')}
            isLoading={isExporting === 'pdf'}
            className="flex items-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Export Official PDF</span>
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="font-semibold text-[#0F0F0F]">Report Period:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#606060]">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#606060]">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-lg text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
        >
          Reset to Current Month
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-xl text-[#FF0000] text-sm">
          {error}
        </div>
      )}

      {/* Summary Highlights */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606060]">Period Revenue</span>
            <div className="text-2xl font-bold font-mono text-[#2BA640] mt-1">
              +${summary.totalIncome.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606060]">Period Expenses</span>
            <div className="text-2xl font-bold font-mono text-[#FF0000] mt-1">
              -${summary.totalExpense.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606060]">Net Savings</span>
            <div className="text-2xl font-bold font-mono text-[#0F0F0F] mt-1">
              ${summary.netSavings.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E5E5]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606060]">Savings Rate</span>
            <div className="text-2xl font-bold font-mono text-[#0F0F0F] mt-1">
              {summary.savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category Table */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
          <h3 className="font-bold text-base text-[#0F0F0F] mb-4">Expenses by Category</h3>
          {summary?.expenseByCategory && summary.expenseByCategory.length > 0 ? (
            <div className="space-y-4">
              {summary.expenseByCategory.map((c) => (
                <div key={c.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#0F0F0F] font-semibold">{c.categoryName}</span>
                    <span className="text-[#606060] font-mono">
                      ${c.amount.toFixed(2)} ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F2F2F2] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF0000] rounded-full"
                      style={{ width: `${Math.min(c.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[#606060] text-sm">
              No expenses recorded in this period
            </div>
          )}
        </div>

        {/* Income by Category Table */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
          <h3 className="font-bold text-base text-[#0F0F0F] mb-4">Income Sources</h3>
          {summary?.incomeByCategory && summary.incomeByCategory.length > 0 ? (
            <div className="space-y-4">
              {summary.incomeByCategory.map((c) => (
                <div key={c.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#0F0F0F] font-semibold">{c.categoryName}</span>
                    <span className="text-[#606060] font-mono">
                      ${c.amount.toFixed(2)} ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F2F2F2] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2BA640] rounded-full"
                      style={{ width: `${Math.min(c.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[#606060] text-sm">
              No income recorded in this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
