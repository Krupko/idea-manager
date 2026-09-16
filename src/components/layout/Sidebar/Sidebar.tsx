import './Sidebar.scss';
import { IconBar } from './IconBar';
import { NavPanel } from './NavPanel';

export const Sidebar = () => {
  return (
    <div className='aside'>
      <IconBar />
      <NavPanel />
    </div>
  );
};
