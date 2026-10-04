import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FinTrackLogo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-[#0F0F0F] p-1.5 shadow-sm ${sizeMap[size]}`}>
        <img src="/fintrack-logo.svg" alt="FinTrack" className="w-full h-full object-contain" />
        {/* Red Broadcast Accent Dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF0000] rounded-full border-2 border-white" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-bold tracking-tight text-[#0F0F0F] ${textMap[size]}`}>
              FinTrack
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF0000] text-white tracking-widest uppercase">
              PFM
            </span>
          </div>
          <span className="text-[11px] text-[#606060] font-normal tracking-wide">
            Finance Broadcast
          </span>
        </div>
      )}
    </div>
  );
};
