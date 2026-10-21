import './UserMenu.scss';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Состояние меню, открыто ли...
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
  };

  if (!user) return null;

  return (
    <div className='user-menu' ref={menuRef}>
      <button
        className='user-menu__trigger'
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup='menu'
      >
        <span className='user-menu__email'>{user.email}</span>
        <div className='user-menu__avatar'>
          <img src='/avatar.png' alt='Аватар' width='35' height='35' />
        </div>
      </button>

      {isOpen && (
        <div className='user-menu__dropdown' role='menu'>
          <button className='user-menu__item' type='button' role='menuitem'>
            <User size={16} />
            <span>Профиль</span>
          </button>

          <div className='user-menu__divider' />

          <button
            className='user-menu__item user-menu__item--danger'
            type='button'
            role='menuitem'
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Выйти</span>
          </button>
        </div>
      )}
    </div>
  );
};
