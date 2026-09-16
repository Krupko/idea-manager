import './Layout.scss';
import { Sidebar } from './Sidebar/Sidebar.tsx';
import { Header } from './Header/Header';

export const Layout = () => {
  return (
    <div className='frame'>
      <Sidebar />
      <div className='content'>
        <Header />
        <main className='section'>kljfl;asdkfjalsdfkjlasj</main>
      </div>
    </div>
  );
};
