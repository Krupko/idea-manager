import { type ReactNode } from 'react';

export interface IconProps {
  children?: ReactNode;
  className?: string;
  size?: number;
}

export const Icon = ({ children, className = '', size = 24 }: IconProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      {children}
    </svg>
  );
};
