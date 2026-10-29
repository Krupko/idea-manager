import './Board.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Column } from '../Column/Column.tsx';
import type { Column as ColumnType, Task } from '../types.ts';
import { getColumnsBoard } from '@/lib/repositories/columns.repository.ts';
import { getTasksByColumn } from '@/lib/repositories/tasks.repository.ts';
import { TaskModal } from '../TaskModal/TaskModal.tsx';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal.tsx';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} from '@/lib/repositories/tasks.repository.ts';

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

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;

    const updatedTask: Task = {
      ...editingTask,
      ...taskData,
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
      await updateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description ?? null,
        deadline: taskData.deadline ?? null,
        done: taskData.done,
        paused: taskData.paused,
      });
    } catch (err) {
      console.error('Ошибка обновления задачи:', err);
    }
    setEditingTask(null);
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      await handleUpdateTask(taskData);
    } else {
      await handleCreateTask(taskData);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!targetColumnId) return;

    // const newTask: Task = {
    //   ...taskData,
    //   id: crypto.randomUUID(),
    //   createdAt: new Date().toISOString(),
    // };

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
      const created = await createTask(targetColumnId, {
        title: taskData.title,
        description: taskData.description ?? null,
        deadline: taskData.deadline ?? null,
        done: taskData.done,
        paused: taskData.paused,
        order: 0,
      });

      // замуна временного на реальный из дазы
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
    if (!boardId) return; // если board нет - выходим

    const loadBoard = async () => {
      try {
        setLoading(true);
        const dbColumns = await getColumnsBoard(boardId); // получение колонок для этой доски\
        // паралельно для каждой колонки получаем ее задачи
        const columnsWithTasks = await Promise.all(
          dbColumns.map(async (col) => {
            const dbTasks = await getTasksByColumn(col.id);

            // адаптируем задачи из бд (snake_case) под UI(camelCase)
            const adaptedTasks: Task[] = dbTasks.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description ?? undefined,
              deadline: t.deadline ?? undefined,
              done: t.done,
              paused: t.paused ?? false,
              createdAt: t.created_at,
              subtasks: [],
              labels: [],
            }));

            // Собираем колонку в формат ui
            return {
              id: col.id,
              title: col.title,
              tasks: adaptedTasks,
            };
          })
        );
        setColumns(columnsWithTasks);
      } catch (err) {
        console.error('Ошибка загрузки доски:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId]);

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

  const handleDrop = async (targetColumnId: string) => {
    if (!draggedTaskId || !sourceColumnId) return;

    if (sourceColumnId === targetColumnId) {
      setDraggedTaskId(null);
      setSourceColumnId(null);
      return;
    }

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
      const targetCol = columns.find((c) => c.id === targetColumnId);
      const newOrder = targetCol ? targetCol.tasks.length : 0;
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
  ) => {
    if (!draggedTaskId || !sourceColumnId) return;
    if (draggedTaskId === targetTaskId) return;

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
          const targetIndex = tasks.findIndex((t) => t.id === targetTaskId);

          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;

          tasks = [...tasks.slice(0, insertIndex), task, ...tasks.slice(insertIndex)];
        }

        return { ...col, tasks };
      });
    });

    try {
      // вычисление новой позиуии
      const targetCol = columns.find((c) => c.id === targetColumnId);
      if (targetCol) {
        const targetIdx = targetCol.tasks.findIndex((t) => t.id === targetTaskId);
        const newOrder = position === 'before' ? targetIdx : targetIdx + 1;
        await moveTask(draggedTaskId, targetColumnId, newOrder);
      }
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

  const handleConfirmDelete = async () => {
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
    }
  };

  const handleTogglePause = async (taskId: string) => {
    // находим задачу и ее текущий статус
    let newPaused = false;
    columns.forEach((col) => {
      const task = col.tasks.find((t) => t.id === taskId);
      if (task) newPaused = !task.paused;
    });

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === taskId ? { ...t, paused: newPaused } : t)),
      }))
    );

    // отправляем в бд
    try {
      await updateTask(taskId, { paused: newPaused });
    } catch (err) {
      // откат
      console.error('Ошибка смены паузы:', err);
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
    </div>
  );
};
