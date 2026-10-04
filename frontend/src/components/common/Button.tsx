import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'outline' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'dark',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#FF0000] text-white hover:bg-[#CC0000]',
    dark: 'bg-[#0F0F0F] text-white hover:bg-[#272727]',
    outline: 'border border-[#E5E5E5] text-[#0F0F0F] bg-white hover:bg-[#F2F2F2]',
    secondary: 'bg-[#F2F2F2] text-[#0F0F0F] hover:bg-[#E5E5E5]',
    ghost: 'text-[#606060] hover:text-[#0F0F0F] hover:bg-[#F2F2F2]',
    danger: 'bg-[#FF0000] text-white hover:bg-[#CC0000]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-full',
    md: 'h-9 px-4 text-sm rounded-full', // 36px height, 16px padding, 9999px radius
    lg: 'h-11 px-6 text-base rounded-full',
    icon: 'h-10 w-10 p-0 rounded-full', // 40px circle
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
