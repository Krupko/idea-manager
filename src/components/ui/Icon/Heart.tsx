import { Icon, type IconProps } from './Icon';

export const Heart = (props: IconProps) => {
  return (
    <Icon {...props}>
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M20.8401 4.60999C19.8086 3.57799 18.4093 2.99817 16.9501 2.99817C15.491 2.99817 14.0916 3.57799 13.0601 4.60999L12.0001 5.66999L10.9401 4.60999C8.79173 2.46161 5.30851 2.46161 3.16012 4.60999C1.01173 6.75838 1.01173 10.2416 3.16012 12.39L4.22012 13.45L12.0001 21.23L19.7801 13.45L20.8401 12.39C21.8721 11.3585 22.4519 9.95913 22.4519 8.49999C22.4519 7.04086 21.8721 5.64152 20.8401 4.60999Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Icon>
  );
};
