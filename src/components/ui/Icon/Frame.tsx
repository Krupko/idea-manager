import { Icon, type IconProps } from './Icon';

export const Frame = (props: IconProps) => {
  return (
    <Icon {...props}>
      <circle cx='1.5' cy='1.5' r='1.5' fill='currentColor' />
      <circle cx='8.5' cy='1.5' r='1.5' fill='currentColor' />
      <circle cx='15.5' cy='1.5' r='1.5' fill='currentColor' />
      <circle cx='22.5' cy='1.5' r='1.5' fill='currentColor' />
    </Icon>
  );
};
