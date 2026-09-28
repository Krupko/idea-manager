import './Board.scss';
import { useEffect, useState } from 'react';
import { Column } from '../Column/Column.tsx';
import type { Column as ColumnType } from '../types.ts';
import { DEFAULT_COLUMNS } from '../data-local.ts';
import { loadColumns, saveColumns } from '@/utils/storage.ts';

export const Board = () => {
  const [columns, setColumns] = useState<ColumnType[]>(
    () => loadColumns<ColumnType[]>() ?? DEFAULT_COLUMNS
  );

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const [justMovedTaskId, setJustMovedTaskId] = useState<string | null>(null);

  useEffect(() => {
    saveColumns(columns);
  }, [columns]);

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

  const handleDragStart = (taskId: string, columnId: string) => {
    setDraggedTaskId(taskId);
    setSourceColumnId(columnId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setSourceColumnId(null);
  };

  const handleDrop = (targetColumnId: string) => {
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
    setJustMovedTaskId(draggedTaskId);
    setDraggedTaskId(null);
    setSourceColumnId(null);
  };

  const handleTaskDrop = (
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
    setJustMovedTaskId(draggedTaskId);
    setDraggedTaskId(null);
    setSourceColumnId(null);
  };

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
            justMovedTaskId={justMovedTaskId}
          />
        ))}
      </div>
    </div>
  );
};
