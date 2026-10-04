import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { TransactionModal } from '../transactions/TransactionModal';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    // If not on transactions page, navigate there with search
    if (q.trim()) {
      navigate(`/transactions?query=${encodeURIComponent(q)}`);
    }
  };

  const handleTransactionSuccess = () => {
    // Dispatch a custom event so active pages (Dashboard, Transactions, Budgets) can refresh data
    window.dispatchEvent(new Event('transaction-updated'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F0F0F]">
      <Header
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} />

        <main className="flex-1 overflow-y-auto bg-[#F9F9F9] p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};
