import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PiggyBank, BarChart3, Tags, ExternalLink } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PiggyBank },
    { name: 'Reports & Export', path: '/reports', icon: BarChart3 },
    { name: 'Categories', path: '/categories', icon: Tags },
  ];

  return (
    <aside
      className={`bg-white border-r border-[#E5E5E5] transition-all duration-200 flex flex-col justify-between shrink-0 ${
        isCollapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      <div className="py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-[#F2F2F2] font-bold text-[#0F0F0F]'
                    : 'text-[#606060] font-normal hover:bg-[#F2F2F2] hover:text-[#0F0F0F]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info in Sidebar */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[#E5E5E5] text-[12px] text-[#606060] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#0F0F0F]">FinTrack</span>
            <span className="text-[10px] bg-[#F2F2F2] text-[#606060] px-1.5 py-0.5 rounded font-mono">v1.0.0</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Modern Financial Platform
          </p>
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[#065FD4] hover:underline pt-1 text-xs"
          >
            <span>Swagger API Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </aside>
  );
};
