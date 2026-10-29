import { Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards } from '@/lib/repositories/boards.repository';
import type { DbBoard } from '@/types/db';
import './NavPanel.scss';

export const NavPanel = () => {
  const [boards, setBoards] = useState<DbBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBoards = async () => {
      try {
        setLoading(true);
        const data = await getBoards();
        setBoards(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки доски');
      } finally {
        setLoading(false);
      }
    };
    loadBoards();
  }, []);

  if (loading) {
    return (
      <aside className='nav-panel'>
        <div className='nav-panel__logo'>
          <div className='nav-panel__logo'>Trello</div>
          <div className='nav-panel__loading'>Загрузка...</div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className='nav-panel'>
        <div className='nav-panel__logo'>
          <div className='nav-panel__logo'>Trello</div>
          <div className='nav-panel__error'>{error}</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className='nav-panel'>
      <div className='nav-panel__logo'>Trello</div>
      <nav className='nav-panel__list'>
        {boards.map((board) => (
          <button
            className='nav-panel__button'
            key={board.id}
            type='button'
            onClick={() => navigate(`/board/${board.id}`)}
          >
            <Circle className='nav-panel__icon' size={16} />

            <div className='nav-panel__text'>
              <span className='nav-panel__title'>{board.title}</span>
              <span className='nav-panel__description'>{board.description ?? 'Без описания'}</span>
            </div>
          </button>
        ))}

        <button className='nav-panel__button nav-panel__button--add' type='button'>
          <span>+ Добавить доску</span>
        </button>
      </nav>
    </aside>
  );
};
