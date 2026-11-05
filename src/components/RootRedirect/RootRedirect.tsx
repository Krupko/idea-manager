import { getBoards } from '@/lib/repositories/boards.repository';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export const RootRedirect = () => {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirstBoard = async () => {
      try {
        const boards = await getBoards();
        if (boards.length > 0) {
          setBoardId(boards[0].id);
        }
      } catch (err) {
        console.error('Ошибка загрузки доски:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFirstBoard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>У вас еще нет досок. Создайте новую.</div>
    );
  }

  return <Navigate to={`/board/${boardId}`} replace />;
};
