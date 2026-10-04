import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Category, Transaction, TransactionType } from '../../types';
import { api } from '../../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setCategoryId(initialData.category.id);
        setTransactionDate(initialData.transactionDate);
        setDescription(initialData.description || '');
      } else {
        setType('EXPENSE');
        setAmount('');
        setCategoryId('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setDescription('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  // Load categories matching current type
  useEffect(() => {
    if (!isOpen) return;
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await api.categories.getAll(type);
        setCategories(data);
        if (!initialData || initialData.type !== type) {
          if (data.length > 0) {
            setCategoryId(data[0].id);
          }
        }
      } catch (err: any) {
        setError('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, [isOpen, type, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    if (!transactionDate) {
      setError('Please select a transaction date');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await api.transactions.update(initialData.id, {
          amount: numAmount,
          type,
          categoryId,
          transactionDate,
          description,
        });
      } else {
        await api.transactions.create({
          amount: numAmount,
          type,
          categoryId,
          transactionDate,
          description,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Financial Record' : 'Add Financial Record'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg text-[#FF0000] text-sm">
            {error}
          </div>
        )}

        {/* Transaction Type Segmented Switch */}
        <div>
          <label className="block text-xs font-medium text-[#606060] mb-1.5 uppercase tracking-wide">
            Record Type
          </label>
          <div className="grid grid-cols-2 p-1 bg-[#F2F2F2] rounded-full border border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-1.5 text-sm font-medium rounded-full transition-all ${
                type === 'EXPENSE'
                  ? 'bg-[#FF0000] text-white shadow-xs'
                  : 'text-[#606060] hover:text-[#0F0F0F]'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-1.5 text-sm font-medium rounded-full transition-all ${
                type === 'INCOME'
                  ? 'bg-[#2BA640] text-white shadow-xs'
                  : 'text-[#606060] hover:text-[#0F0F0F]'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-[#606060] mb-1.5 uppercase tracking-wide">
            Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#606060]">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-11 pl-8 pr-4 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-lg font-bold text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-[#606060] mb-1.5 uppercase tracking-wide">
            Category
          </label>
          {isLoadingCategories ? (
            <div className="h-10 bg-[#F2F2F2] animate-pulse rounded-xl" />
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full h-10 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-[#606060] mb-1.5 uppercase tracking-wide">
            Transaction Date
          </label>
          <input
            type="date"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full h-10 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
          />
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-medium text-[#606060] mb-1.5 uppercase tracking-wide">
            Description / Memo (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grocery run, Client invoice #102..."
            maxLength={255}
            className="w-full h-10 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5E5]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="px-6"
          >
            {initialData ? 'Update Record' : 'Save Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
