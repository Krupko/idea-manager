import { getBoards } from '@/lib/repositories/boards.repository';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

export const RootRedirect = () => {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const fetchFirstBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        const boards = await getBoards();

        if (boards.length > 0 ? boards[0].id : null) return;
      } catch (err) {
        console.error('Ошибка загрузки доски:', err);
        setError(err instanceof Error ? err.message : 'Не удалось загрузить доски');
        setBoardId(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchFirstBoard();
  }, [retry]);

  if (loading) {
    return <div style={{ padding: '20px', color: '#fff' }}>Закрузка досок.</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>
        <p>Не удалось загрузить доски: {error}</p>
        <button
          type='button'
          onClick={() => setRetry((n) => n + 1)}
          style={{ marginTop: '8px', padding: '8px 16px', cursor: 'pointer' }}
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!boardId) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>
        <p>У вас пока нет досок</p>
        <p>Создайте первую доску - кнопка в боковом меню</p>
        <Link to='/board/new' style={{ color: '#3b82f6' }}>
          Или создай доску здесь
        </Link>
      </div>
    );
  }
  return <Navigate to={`/board/${boardId}`} replace />;
};
