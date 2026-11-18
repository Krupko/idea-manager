import './Board.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Column } from '../Column/Column.tsx';
import type { Column as ColumnType, Task } from '../types.ts';
import { getTasksByColumn } from '@/lib/repositories/tasks.repository.ts';
import { getLabelByTask } from '@/lib/repositories/labels.repository.ts';
import { getSubtaskByTask } from '@/lib/repositories/subtasks.repository.ts';
import { TaskModal } from '../TaskModal/TaskModal.tsx';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal.tsx';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} from '@/lib/repositories/tasks.repository.ts';
import { useBoardRealtime } from '@/hooks/useBoardRealtime.ts';
import { ShareBoardModal } from '../ShareBoardModal/ShareBoardModal.tsx';
import { LayoutList, UserPlus } from 'lucide-react';
import { AddSectionModal } from '../AddSectionModal/AddSectionModal.tsx';
import {
  createColumn,
  getColumnsBoard,
  updateColumn,
  deleteColumn,
} from '@/lib/repositories/columns.repository.ts';

export const Board = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const [justMovedTaskId, setJustMovedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnType | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<ColumnType | null>(null);

  const loadBoard = async () => {
    if (!boardId) return;
    try {
      const dbColumns = await getColumnsBoard(boardId);
      const columnsWithTasks = await Promise.all(
        dbColumns.map(async (col) => {
          const dbTasks = await getTasksByColumn(col.id);

          const adaptedTasks: Task[] = await Promise.all(
            dbTasks.map(async (t) => {
              // закружаем метки и подзадачи\
              const dbLabels = await getLabelByTask(t.id);
              const dbSubtasks = await getSubtaskByTask(t.id);

              return {
                id: t.id,
                title: t.title,
                description: t.description ?? undefined,
                deadline: t.deadline ?? undefined,
                done: t.done,
                paused: t.paused ?? false,
                createdAt: t.created_at,
                labels: dbLabels.map((l) => ({
                  id: l.id,
                  color: l.color,
                })),
                subtasks: dbSubtasks.map((s) => ({
                  id: s.id,
                  title: s.title,
                  completed: s.completed,
                })),
              };
            })
          );

          return { id: col.id, title: col.title, tasks: adaptedTasks };
        })
      );
      setColumns(columnsWithTasks);
    } catch (err) {
      console.error('Ошибка загрузки доски:', err);
    }
  };

  // ПЕРВОНАЧАЛЬНАЯ ЗАГРУЗКА
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadBoard();
      setLoading(false);
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // ПОДКЛЮЧАЕМ REALTIME
  useBoardRealtime({
    boardId,
    onColumnsChange: loadBoard,
    onTasksChange: loadBoard,
    onBoardChange: loadBoard,
  });

  // Функция создания / удаления колонки
  const handleColumnSubmit = async (title: string): Promise<void> => {
    if (!boardId) return;
    try {
      if (editingColumn) {
        // Режим редактирования
        await updateColumn(editingColumn.id, { title });
        setEditingColumn(null);
      } else {
        // Режим создания
        await createColumn(boardId, title, columns.length);
      }
      setLoading(true);
      await loadBoard(); // Перезагрузка доски
      setLoading(false);
    } catch (err) {
      console.error('Ошибка колонки', err);
    }
  };

  //Функция удаления колонки
  const handleConfirmDeleteColumn = async (): Promise<void> => {
    if (!deletingColumn) return;
    try {
      await deleteColumn(deletingColumn.id);
      setDeletingColumn(null);
      setLoading(true);
      await loadBoard();
      setLoading(false);
    } catch (err) {
      console.error('Ошибка удаления колонки', err);
    }
  };

  const handleAddTask = (columnId: string) => {
    setTargetColumnId(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTargetColumnId(null);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<void> => {
    if (!editingTask) return;

    const updatedTask: Task = {
      ...editingTask,
      ...taskData,
      labels: taskData.labels ?? editingTask.labels,
      subtasks: taskData.subtasks ?? editingTask.subtasks,
      updatedAt: new Date().toISOString(),
    };
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)),
      }))
    );

    // отправляем в бд
    try {
      await updateTask(
        editingTask.id,
        {
          title: taskData.title,
          description: taskData.description ?? null,
          deadline: taskData.deadline,
          done: taskData.done,
          paused: taskData.paused,
        },
        taskData.labels,
        taskData.subtasks
      );
    } catch (err) {
      console.error('Ошибка обновления задачи:', err);
    }
    setEditingTask(null);
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<void> => {
    if (editingTask) {
      await handleUpdateTask(taskData);
    } else {
      await handleCreateTask(taskData);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<void> => {
    if (!targetColumnId) return;

    const tempId = crypto.randomUUID();
    const optimisticTask: Task = {
      ...taskData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Обновляем UI
    setColumns((prev) =>
      prev.map((col) =>
        col.id === targetColumnId ? { ...col, tasks: [...col.tasks, optimisticTask] } : col
      )
    );

    // отправляем в ид
    try {
      const created = await createTask(
        targetColumnId,
        {
          title: taskData.title,
          description: taskData.description ?? null,
          deadline: taskData.deadline || null,
          done: taskData.done,
          paused: taskData.paused,
          order: 0,
        },
        taskData.labels,
        taskData.subtasks
      );

      // замена временного id на реальный из дазы
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === tempId ? { ...t, id: created.id, createdAt: created.created_at } : t
          ),
        }))
      );
    } catch (err) {
      // откат: есди ошибка - удаление задачи из UI
      console.error('Ошибка создания задачи:', err);
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== tempId),
        }))
      );
    }

    setTargetColumnId(null);
  };

  useEffect(() => {
    if (draggedTaskId) {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
    // если компонент размонтируется во время drag
    return () => {
      document.body.classList.remove('dragging');
    };
  }, [draggedTaskId]);

  useEffect(() => {
    if (!justMovedTaskId) return;

    const timer = setTimeout(() => {
      setJustMovedTaskId(null);
    }, 600);

    return () => clearTimeout(timer);
  }, [justMovedTaskId]);

  if (import.meta.env.DEV) {
    // Удалить на продакшене
    console.info('Текущая доска:', boardId);
  }

  const handleDragStart = (taskId: string, columnId: string) => {
    setDraggedTaskId(taskId);
    setSourceColumnId(columnId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setSourceColumnId(null);
  };

  const handleDrop = async (targetColumnId: string): Promise<void> => {
    if (!draggedTaskId || !sourceColumnId) return;

    if (sourceColumnId === targetColumnId) {
      setDraggedTaskId(null);
      setSourceColumnId(null);
      return;
    }

    const targetCol = columns.find((c) => c.id === targetColumnId);
    const newOrder = targetCol ? targetCol.tasks.length : 0;

    setColumns((prev) => {
      const sourceColumn = prev.find((c) => c.id === sourceColumnId);
      const task = sourceColumn?.tasks.find((t) => t.id === draggedTaskId);
      if (!task) return prev;

      return prev.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== draggedTaskId),
          };
        }

        if (col.id === targetColumnId) {
          return {
            ...col,
            tasks: [...col.tasks, task],
          };
        }
        return col;
      });
    });

    // отправляем в бд
    try {
      await moveTask(draggedTaskId, targetColumnId, newOrder);
    } catch (err) {
      console.error('Ошибка перемещения задачи:', err);
    }

    setJustMovedTaskId(draggedTaskId);
    setDraggedTaskId(null);
    setSourceColumnId(null);
  };

  const handleTaskDrop = async (
    targetColumnId: string,
    targetTaskId: string,
    position: 'before' | 'after'
  ): Promise<void> => {
    if (!draggedTaskId || !sourceColumnId) return;
    if (draggedTaskId === targetTaskId) return;

    const targetCol = columns.find((c) => c.id === targetColumnId);
    const targetIdx = targetCol ? targetCol.tasks.findIndex((t) => t.id === targetTaskId) : -1;

    setColumns((prev) => {
      const sourceColumn = prev.find((c) => c.id === sourceColumnId);
      const task = sourceColumn?.tasks.find((t) => t.id === draggedTaskId);
      if (!task) return prev;

      return prev.map((col) => {
        let tasks = col.tasks;

        if (col.id === sourceColumnId) {
          tasks = tasks.filter((t) => t.id !== draggedTaskId);
        }

        if (col.id === targetColumnId) {
          const idx = tasks.findIndex((t) => t.id === targetTaskId);
          const insertIndex = position === 'before' ? idx : idx + 1;
          tasks = [...tasks.slice(0, insertIndex), task, ...tasks.slice(insertIndex)];
        }

        return { ...col, tasks };
      });
    });

    try {
      let newOrder: number;
      // вычисление новой позиуии
      if (sourceColumnId === targetColumnId) {
        const sourceIdx = targetCol ? targetCol.tasks.findIndex((t) => t.id === draggedTaskId) : -1;
        newOrder = position === 'before' ? targetIdx : targetIdx + 1;
        if (sourceIdx !== -1 && sourceIdx < targetIdx) {
          newOrder -= 1;
        }
      } else {
        newOrder = position === 'before' ? targetIdx : targetIdx + 1;
      }
      await moveTask(draggedTaskId, targetColumnId, newOrder);
    } catch (err) {
      console.error('Ошибка сортировки задач:', err);
    }

    setJustMovedTaskId(draggedTaskId);
    setDraggedTaskId(null);
    setSourceColumnId(null);
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingTask) return; // 1. Защита: если нет задачи — выходим

    const taskId = deletingTask.id;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        // 2. Фильтруем задачи: убираем удаляемую
        tasks: col.tasks.filter((t) => t.id !== taskId),
      }))
    );

    setDeletingTask(null); // 3. Сбрасываем

    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Ошибка удаление задачи:', err);
      alert('Не удалось удалить задачу. Попробуйте еще раз');
      await loadBoard();
    }
  };

  const handleTogglePause = async (taskId: string): Promise<void> => {
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === taskId);
    if (!task) return;
    const newPaused = !task.paused;

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === taskId ? { ...t, paused: newPaused } : t)),
      }))
    );

    // отправляем в бд
    try {
      await updateTask(taskId, { paused: newPaused }, undefined, undefined);
    } catch (err) {
      // откат
      console.error('Ошибка смены паузы:', err);
      //  откат
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === taskId ? { ...t, paused: !newPaused } : t)),
        }))
      );
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#fff' }}>Загрузка доски...</div>;
  }

  return (
    <div className='board'>
      <div className='board__header'>
        <button
          onClick={() => {
            setEditingColumn(null);
            setIsSectionModalOpen(true);
          }}
          className='add-button'
          type='button'
        >
          <LayoutList size={18} />
          <span>Add Section</span>
        </button>

        <button className='board__share-btn' onClick={() => setIsShareModalOpen(true)}>
          <UserPlus size={20} />
          <span>Поделиться</span>
        </button>
      </div>

      <div className='board-columns'>
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onTaskDrop={handleTaskDrop}
            onAddTask={handleAddTask}
            onEditClick={handleEditTask}
            onDeleteClick={handleDeleteClick}
            justMovedTaskId={justMovedTaskId}
            onTogglePause={handleTogglePause}
            onEditColumn={(col) => {
              setEditingColumn(col);
              setIsSectionModalOpen(true);
            }}
            onDeleteColumn={(col) => setDeletingColumn(col)}
            isDraggingActive={draggedTaskId !== null}
          />
        ))}
      </div>

      <TaskModal
        key={editingTask?.id ?? 'new-task'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetColumnId(null);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
      />

      <ConfirmModal
        isOpen={deletingTask !== null}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        title='Удалить задачу?'
        message={`Вы уверены, что хотите удалить "${deletingTask?.title}"? Это нельзя будет отменить!`}
        confirmText='Удалить'
        cancelText='Отмена'
        variant='danger'
      />

      {boardId && (
        <ShareBoardModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          boardId={boardId}
        />
      )}

      <AddSectionModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setEditingColumn(null);
        }}
        onSubmit={handleColumnSubmit}
        mode={editingColumn ? 'edit' : 'create'}
        initialTitle={editingColumn?.title}
      />

      <ConfirmModal
        isOpen={deletingColumn != null}
        onClose={() => setDeletingColumn(null)}
        onConfirm={handleConfirmDeleteColumn}
        title='Удалить колонку?'
        message={`Вы уверены, что хотите удалить колонку '${deletingColumn?.title}'?`}
        confirmText='Удалить'
        cancelText='Отмена'
        variant='danger'
      />
    </div>
  );
};
