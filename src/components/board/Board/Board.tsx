import './Board.scss';
import { useEffect, useState } from 'react';
import { Column } from '../Column/Column.tsx';
import type { Column as ColumnType } from '../types.ts';

export const Board = () => {
  const [columns, setColumns] = useState<ColumnType[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      tasks: [
        {
          id: '1',
          title: 'Task 1',
          description:
            'Lorem ipson dolou sit amet Lorem ipson dolou sit amet Lorem ipson dolou sit amet',
          labels: [{ id: 'l1', color: '#ef4444' }],
          deadline: '2026-03-25',
          done: false,
          subtasks: [
            { id: 's1', title: 'Subtask 1', completed: true },
            { id: 's2', title: 'Subtask 2', completed: false },
            { id: 's3', title: 'Subtask 3', completed: true },
            { id: 's4', title: 'Subtask 4', completed: false },
            { id: 's5', title: 'Subtask 5', completed: true },
            { id: 's6', title: 'Subtask 6', completed: false },
            { id: 's7', title: 'Subtask 7', completed: true },
            { id: 's8', title: 'Subtask 8', completed: false },
          ],
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Some text goes here',
          labels: [],
          done: false,
          subtasks: [],
        },
      ],
    },
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '3',
          title: 'Tssk',
          description: 'Some todo false goes',
          labels: [
            { id: 'l2', color: '#ef4444' },
            { id: 'l3', color: '#9ca3af' },
          ],
          deadline: '2026-04-21',
          done: false,
          subtasks: [],
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        {
          id: '4',
          title: 'Task',
          description: 'Some elementName sjlkjljl',
          labels: [
            { id: 'l4', color: '#f97316' },
            { id: 'l5', color: '#9ca3af' },
          ],
          done: false,
          subtasks: [],
        },
      ],
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: [
        {
          id: '5',
          title: 'Task',
          description: 'Some false ca3af goes subtasks',
          labels: [],
          done: true,
          subtasks: [
            { id: 's1', title: 'Subtask 1', completed: true },
            { id: 's2', title: 'Subtask 2', completed: false },
          ],
        },
      ],
    },
  ]);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const [justMovedTaskId, setJustMovedTaskId] = useState<string | null>(null);

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
