import { Icon, type IconProps } from './Icon';

export const Box = (props: IconProps) => {
  return (
    <Icon {...props}>
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M12.89 1.45003L20.89 5.45003C21.5697 5.78776 21.9996 6.48108 22 7.24003V16.77C21.9996 17.529 21.5697 18.2223 20.89 18.56L12.89 22.56C12.3267 22.8419 11.6634 22.8419 11.1 22.56L3.10005 18.56C2.42104 18.2179 1.99476 17.5203 2.00005 16.76V7.24003C2.00045 6.48108 2.43039 5.78776 3.11005 5.45003L11.11 1.45003C11.6707 1.17144 12.3294 1.17144 12.89 1.45003Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M2.31982 6.15997L11.9998 11L21.6798 6.15997'
        stroke='round'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 22.76V11'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Icon>
  );
};
