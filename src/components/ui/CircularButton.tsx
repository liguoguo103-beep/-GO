import React from 'react';

interface CircularButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CircularButton: React.FC<CircularButtonProps> = ({ icon, onClick, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 text-white flex items-center justify-center
                  hover:bg-white/20 active:bg-white/30 transition-all duration-200
                  ${sizeClasses[size]} ${className}`}
    >
      {icon}
    </button>
  );
};

export default CircularButton;
