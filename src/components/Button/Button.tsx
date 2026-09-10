import type { ReactNode } from 'react';

export interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children?: ReactNode | string;
}

export const Button = ({ onClick, className = '', children }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`${className}`} type='button'>
      {children}
    </button>
  );
};
