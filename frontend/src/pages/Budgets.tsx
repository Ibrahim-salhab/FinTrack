import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Budget, Category } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Plus, Trash2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export const Budgets: React.FC = () => {
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [budgetCategory, setBudgetCategory] = useState<string>(''); // empty for overall
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [budgetData, catData] = await Promise.all([
        api.budgets.getAll(selectedMonth),
        api.categories.getAll('EXPENSE'),
      ]);
      setBudgets(budgetData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Delete this budget target?')) return;
    try {
      await api.budgets.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const amountNum = parseFloat(budgetAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setModalError('Please enter a valid budget amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.budgets.set({
        categoryId: budgetCategory ? budgetCategory : null,
        amount: amountNum,
        budgetMonth: selectedMonth,
      });
      setIsModalOpen(false);
      setBudgetAmount('');
      setBudgetCategory('');
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F0F]">Monthly Budgets</h1>
          <p className="text-sm text-[#606060] mt-1">
            Establish spending caps and monitor category thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm font-semibold text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
          />

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setModalError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-xl text-[#FF0000] text-sm">
          {error}
        </div>
      )}

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-[#E5E5E5] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const isExceeded = b.isExceeded;
            const isWarning = b.percentageUsed >= 80 && !isExceeded;

            return (
              <div
                key={b.id}
                className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs flex flex-col justify-between relative overflow-hidden"
              >
                {/* Status Bar Indicator */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isExceeded ? 'bg-[#FF0000]' : isWarning ? 'bg-[#FB8C00]' : 'bg-[#2BA640]'
                  }`}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#606060]">
                        {b.category ? 'Category Limit' : 'Total Monthly Cap'}
                      </span>
                      <h3 className="text-lg font-bold text-[#0F0F0F] mt-0.5">
                        {b.category ? b.category.name : 'Overall Budget'}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteBudget(b.id)}
                      className="text-[#606060] hover:text-[#FF0000] p-1.5 rounded-full hover:bg-[#F2F2F2] transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-bold font-mono text-[#0F0F0F]">
                      ${b.spentAmount.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#606060] font-mono">
                      of ${b.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#F2F2F2] h-2.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-[#FF0000]' : isWarning ? 'bg-[#FB8C00]' : 'bg-[#2BA640]'
                      }`}
                      style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer Details */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E5E5E5] text-xs">
                  <div className="flex items-center gap-1.5">
                    {isExceeded ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#FF0000]" />
                        <span className="font-bold text-[#FF0000]">Exceeded by ${(b.spentAmount - b.amount).toFixed(2)}</span>
                      </>
                    ) : isWarning ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-[#FB8C00]" />
                        <span className="font-bold text-[#FB8C00]">{b.percentageUsed.toFixed(0)}% used</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-[#2BA640]" />
                        <span className="font-medium text-[#606060]">${b.remainingAmount.toFixed(2)} remaining</span>
                      </>
                    )}
                  </div>

                  <span className="font-mono text-[#606060] font-semibold">{b.percentageUsed.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-[#E5E5E5] text-center max-w-md mx-auto">
          <p className="font-bold text-lg text-[#0F0F0F]">No Budgets Configured for {selectedMonth}</p>
          <p className="text-sm text-[#606060] mt-1">
            Setting a budget helps you control spending and alerts you when expenses grow too high.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="mt-6"
          >
            Create Your First Budget
          </Button>
        </div>
      )}

      {/* Set Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Set Budget for ${selectedMonth}`}
      >
        <form onSubmit={handleSubmitBudget} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg text-[#FF0000] text-sm">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#606060] uppercase mb-1.5">
              Category (Optional)
            </label>
            <select
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              className="w-full h-10 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            >
              <option value="">Overall Monthly Budget (All Expenses)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#606060] mt-1">
              Select a category to restrict this limit, or leave as Overall to cap entire monthly spending.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#606060] uppercase mb-1.5">
              Budget Target Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="w-full h-11 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-lg font-bold text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E5E5]">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
