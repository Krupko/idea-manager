import { Icon, type IconProps } from './Icon';

export const Burger = (props: IconProps) => {
  return (
    <Icon {...props}>
      <path
        d='M3 12H21'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M3 6H21'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M3 18H21'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Icon>
  );
};
