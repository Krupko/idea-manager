import {
  Bell,
  Box,
  Command,
  CloudDownload,
  Heart,
  Image as ImageIcon,
  MapPin,
  Menu as MenuIcon,
  Ellipsis,
} from 'lucide-react';
import { Github } from '../../ui/Icon/Github.tsx';
import { Instagram } from '../../ui/Icon/Instagram.tsx';
import type React from 'react';

interface IconItem {
  id: string;
  icon: React.ReactNode;
}
const topIcon: IconItem[] = [
  { id: 'menu', icon: <MenuIcon /> },
  { id: 'bell', icon: <Bell /> },
  { id: 'box', icon: <Box /> },
  { id: 'heart', icon: <Heart /> },
  { id: 'github', icon: <Github /> },
  { id: 'command', icon: <Command /> },
  { id: 'ellipsis', icon: <Ellipsis /> },
  { id: 'image', icon: <ImageIcon /> },
  { id: 'mappin', icon: <MapPin /> },
  { id: 'instagram', icon: <Instagram /> },
];

export const IconBar = () => {
  return (
    <aside className='aside'>
      <nav className='nav-icon'>
        <div className='list-icon'>
          {topIcon.map((item) => (
            <button className='sidebar-button' key={item.id}>
              {item.icon}
            </button>
          ))}
        </div>

        <button className='sidebar-button'>
          <CloudDownload className='sidebar-icon' />
        </button>
      </nav>
    </aside>
  );
};
