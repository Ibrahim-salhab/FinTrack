import React from 'react';
import { Menu, Search, Plus, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { GeminiBananaLogo } from './GeminiBananaLogo';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenAddModal,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-14 bg-white border-b border-[#E5E5E5] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      {/* Left: Hamburger + Gemini Banana Logo */}
      <div className="flex items-center gap-4 min-w-[220px]">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#606060] hover:text-[#0F0F0F] hover:bg-[#F2F2F2] transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <GeminiBananaLogo size="sm" />
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4 hidden md:flex items-center">
        <div className="flex items-center w-full h-10 border border-[#E5E5E5] rounded-l-full overflow-hidden bg-white focus-within:border-[#065FD4]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search transactions, notes, payees..."
            className="w-full px-4 text-sm text-[#0F0F0F] bg-transparent focus:outline-none placeholder-[#606060]"
          />
        </div>
        <button
          type="button"
          className="h-10 px-5 bg-[#F8F8F8] border border-l-0 border-[#E5E5E5] rounded-r-full text-[#606060] hover:bg-[#F2F2F2] flex items-center justify-center transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Add Transaction, Notifications, User Menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Record</span>
        </Button>

        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#606060] hover:text-[#0F0F0F] hover:bg-[#F2F2F2] transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* User avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5E5]">
          <div
            className="w-8 h-8 rounded-full bg-[#0F0F0F] text-white flex items-center justify-center font-bold text-xs select-none"
            title={user?.email}
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#606060] hover:text-[#FF0000] hover:bg-[#F2F2F2] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
