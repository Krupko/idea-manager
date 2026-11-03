import { Circle, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBoards,
  createBoard,
  deleteBoard,
  updateBoard,
} from '@/lib/repositories/boards.repository';
import type { DbBoard } from '@/types/db';
import { BoardModal } from '@/components/board/BoardModal/BoardModal';
import { ConfirmModal } from '@/components/board/ConfirmModal/ConfirmModal';
import './NavPanel.scss';

export const NavPanel = () => {
  const [boards, setBoards] = useState<DbBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<DbBoard | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<DbBoard | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null); // Состояние для открытого меню (храним ID доски, у которой открыто меню)

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

  const handleCreateBoard = async (data: { title: string; description?: string }) => {
    try {
      await createBoard(data.title, data.description);
      const updateBoards = await getBoards();
      setBoards(updateBoards);
    } catch (err) {
      console.error('Ошибка создания доски:', err);
      alert(`Ошибка создания доски: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    }
  };

  // Обработчик редактирования
  const handleEditClick = (e: React.MouseEvent, board: DbBoard) => {
    e.stopPropagation();
    setEditingBoard(board);
    setIsModalOpen(true);
    setMenuOpenId(null);
  };

  // Обработчик сохранения при редактировании
  const handleUpdateBoard = async (data: { title: string; description?: string }) => {
    if (!editingBoard) return;
    try {
      await updateBoard(editingBoard.id, data.title);
      const updatedBoards = await getBoards();
      setBoards(updatedBoards);
      setEditingBoard(null);
    } catch (err) {
      console.error('Ошибка обновления доски:', err);
    }
  };

  // Обработчик клика на удаление (открываут ConfirmModal)
  const handleDeleteClick = (e: React.MouseEvent, board: DbBoard) => {
    e.stopPropagation();
    setDeletingBoard(board); // Запомнить доску на удаление
    setMenuOpenId(null); // Закрытие меню
  };

  // Подтверждение удаления
  const handleConfirmDelete = async () => {
    if (!deletingBoard) return;
    try {
      await deleteBoard(deletingBoard.id);
      const updatedBoards = await getBoards();
      setBoards(updatedBoards);
      setDeletingBoard(null); // закрытие модала

      // Если удаление доски на которой находишься, то переход на главную
      if (window.location.pathname.includes(deletingBoard.id)) {
        navigate('/');
      }
    } catch (err) {
      console.error('Ошибка удаление доски:', err);
    }
  };

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
    <>
      <aside className='nav-panel'>
        <div className='nav-panel__logo'>Trello</div>
        <nav className='nav-panel__list'>
          {boards.map((board) => (
            <div key={board.id} className='nav-panel__item'>
              <button
                className='nav-panel__button'
                type='button'
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <Circle className='nav-panel__icon' size={16} />

                <div className='nav-panel__text'>
                  <span className='nav-panel__title'>{board.title}</span>
                  <span className='nav-panel__description'>
                    {board.description ?? 'Без описания'}
                  </span>
                </div>
              </button>

              <div className='nav-panel__menu-wrapper'>
                <button
                  className='nav-panel__menu-btn'
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === board.id ? null : board.id);
                  }}
                >
                  <Ellipsis size={16} />
                </button>

                {menuOpenId === board.id && (
                  <div className='nav-panel__dropdown'>
                    <button
                      className='nav-panel__dropdown-item'
                      type='button'
                      onClick={(e) => handleEditClick(e, board)}
                    >
                      <Pencil size={14} />
                      <span>Редактировать</span>
                    </button>

                    <button
                      className='nav-panel__dropdown-item nav-panel__dropdown-item--danger'
                      type='button'
                      onClick={(e) => handleDeleteClick(e, board)}
                    >
                      <Trash2 size={14} />
                      <span>Удалить</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            className='nav-panel__button nav-panel__button--add'
            type='button'
            onClick={() => {
              setEditingBoard(null);
              setIsModalOpen(true);
            }}
          >
            <span>+ Добавить доску</span>
          </button>
        </nav>
      </aside>
      {/* Модал создания / редактирования */}
      <BoardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBoard(null);
        }}
        onSubmit={editingBoard ? handleUpdateBoard : handleCreateBoard}
        initialBoard={editingBoard}
      />
      {/* Модал Подтверждение удаление */}
      <ConfirmModal
        isOpen={deletingBoard !== null}
        onClose={() => setDeletingBoard(null)}
        onConfirm={handleConfirmDelete}
        title='Удалить доску?'
        message={`Вы уверены, что хотиту удалить доску "${deletingBoard?.title}"? Все задачи внутри нее будут удалены`}
        confirmText='Удалить'
        cancelText='Отмена'
        variant='danger'
      />
    </>
  );
};
