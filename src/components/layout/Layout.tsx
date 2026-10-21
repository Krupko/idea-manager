import './Layout.scss';
import { Sidebar } from './Sidebar/Sidebar.tsx';
import { Header } from './Header/Header';
import { AddSection } from '../board/AddSection/AddSection.tsx';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='frame'>
      <Sidebar />
      <div className='content'>
        <Header />
        <main className='main'>
          <AddSection />
          {children}
        </main>
      </div>
    </div>
  );
};
