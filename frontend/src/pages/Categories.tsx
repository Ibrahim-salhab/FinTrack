import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Category, TransactionType } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Plus, Trash2, Tag, Check, Layers } from 'lucide-react';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [icon, setIcon] = useState<string>('tag');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this custom category?')) return;
    try {
      await api.categories.delete(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Cannot delete category');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!name.trim()) {
      setModalError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.categories.create({
        name: name.trim(),
        type,
        icon,
      });
      setIsModalOpen(false);
      setName('');
      loadCategories();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F0F]">Classification Categories</h1>
          <p className="text-sm text-[#606060] mt-1">
            Organize transactions under default and custom spending tags.
          </p>
        </div>

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
          <span>New Category</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-xl text-[#FF0000] text-sm">
          {error}
        </div>
      )}

      {/* Grid of Expense & Income Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF0000]" />
              <h2 className="text-lg font-bold text-[#0F0F0F]">Expense Categories</h2>
            </div>
            <span className="text-xs text-[#606060] font-mono">{expenseCategories.length} categories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expenseCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] hover:bg-white hover:border-[#0F0F0F] transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#0F0F0F] shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-semibold text-[#0F0F0F] block truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-[#606060]">
                      {c.isDefault ? 'Default' : 'Custom'}
                    </span>
                  </div>
                </div>

                {!c.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-[#606060] hover:text-[#FF0000] p-1 rounded-full transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2BA640]" />
              <h2 className="text-lg font-bold text-[#0F0F0F]">Income Categories</h2>
            </div>
            <span className="text-xs text-[#606060] font-mono">{incomeCategories.length} categories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incomeCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] hover:bg-white hover:border-[#0F0F0F] transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#2BA640] shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-sm font-semibold text-[#0F0F0F] block truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-[#606060]">
                      {c.isDefault ? 'Default' : 'Custom'}
                    </span>
                  </div>
                </div>

                {!c.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-[#606060] hover:text-[#FF0000] p-1 rounded-full transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Category"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg text-[#FF0000] text-sm">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#606060] uppercase mb-1.5">
              Type
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

          <div>
            <label className="block text-xs font-bold text-[#606060] uppercase mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscriptions, Side Business..."
              className="w-full h-11 px-3 bg-[#F2F2F2] border border-[#E5E5E5] rounded-xl text-sm text-[#0F0F0F] focus:outline-none focus:border-[#0F0F0F]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E5E5]">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
