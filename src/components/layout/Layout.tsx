import './Layout.scss';
import { Sidebar } from './Sidebar/Sidebar.tsx';
import { Header } from './Header/Header';
import { AddSection } from '../board/AddSection/AddSection.tsx';
import { Board } from '../board/Board/Board.tsx';

export const Layout = () => {
  return (
    <div className='frame'>
      <Sidebar />
      <div className='content'>
        <Header />
        <main className='main'>
          <AddSection />
          <Board />
        </main>
      </div>
    </div>
  );
};
