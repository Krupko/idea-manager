import './Header.scss';
import { Codepen } from '@/components/ui/Icon/Codepen';
import { Github } from '@/components/ui/Icon/Github';
import { Shape } from '@/components/ui/Icon/Shape';
import { useState, type ReactNode } from 'react';

interface HeaderIcon {
  id: string;
  icon?: ReactNode;
}

const headerIcon: HeaderIcon[] = [
  { id: 'github', icon: <Github /> },
  { id: 'shape', icon: <Shape /> },
  { id: 'codepen', icon: <Codepen /> },
];

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className='header'>
      <div className='search'>
        <input
          type='text'
          placeholder='Search'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='header-wrap-icons'>
        <div className='header-icons'>
          {headerIcon.map((item) => (
            <button key={item.id} type='button' aria-label={item.id}>
              {item.icon}
            </button>
          ))}
        </div>

        <button className='avatar' type='button'>
          <span>Hi Aaryan</span>
          <div className='wrap-avatar'>
            <img src='/avatar.png' alt='Avatar' width='35' height='35' />
          </div>
        </button>
      </div>
    </header>
  );
};
