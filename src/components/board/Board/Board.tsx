import './Board.scss';
import { useState } from 'react';
import { Column } from '../Column/Column.tsx';
import type { Column as ColumnType } from '../types.ts';

export const Board = () => {
  const [columns] = useState<ColumnType[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      tasks: [
        {
          id: '1',
          title: 'Task 1',
          description: 'Lorem ipson dolou sit amet',
          labels: [{ id: 'l1', color: '#ef4444' }],
          deadline: '2026-03-25',
          done: false,
          subtasks: [],
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

  return (
    <div className='board'>
      <div className='board-columns'>
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
};
