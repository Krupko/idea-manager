import { Circle } from 'lucide-react';

interface NavItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const navItem: NavItem[] = [
  { id: 'my-tracks', icon: <Circle />, title: 'My Tracks', description: 'Description' },
  { id: 'companies', icon: <Circle />, title: 'Companies', description: 'Description' },
  { id: 'projects', icon: <Circle />, title: 'Projects', description: 'Description' },
  { id: 'resources', icon: <Circle />, title: 'Resources', description: 'Description' },
  { id: 'add-more', title: 'Add More', description: 'Description' },
];

export const NavPanel = () => {
  return (
    <aside className='list-button'>
      <div className='logo'>trello</div>
      {navItem.map((item) => (
        <button className={item.id === 'add-more' ? 'add-more' : undefined} key={item.id}>
          {item.icon}
          <div className='button-text'>
            <span className='button-title'>{item.title}</span>
            <span>{item.description}</span>
          </div>
        </button>
      ))}
    </aside>
  );
};
