import './Sidebar.scss';
import { IconBar } from './IconBar';
import { NavPanel } from './NavPanel/NavPanel.tsx';

export const Sidebar = () => {
  return (
    <div className='aside'>
      <IconBar />
      <NavPanel />
    </div>
  );
};
