import type { ReactNode } from 'react';

export interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export const Button = ({ onClick, className = '', children }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`${className}`} type='button'>
      {children}
    </button>
  );
};
