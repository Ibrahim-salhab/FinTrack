import React from 'react';

interface ChipProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  count?: number;
}

export const Chip: React.FC<ChipProps> = ({ label, isSelected = false, onClick, count }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-sm font-medium transition-colors cursor-pointer select-none whitespace-nowrap ${
        isSelected
          ? 'bg-[#0F0F0F] text-white hover:bg-[#272727]'
          : 'bg-[#F2F2F2] text-[#0F0F0F] hover:bg-[#E5E5E5]'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
            isSelected ? 'bg-white/20 text-white' : 'bg-black/10 text-[#606060]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
