import './Column.scss';
import { EllipsisVertical } from 'lucide-react';
import type { Column as ColumnType } from '../types.ts';
import { TaskCard } from '../TaskCard/TaskCard.tsx';

interface ColumnProps {
  column: ColumnType;
}
export const Column = ({ column }: ColumnProps) => {
  return (
    <div className='column'>
      <div className='column-header'>
        <h3>{column.title}</h3>
        <button className='column-button' type='button'>
          <EllipsisVertical size={20} />
        </button>
      </div>

      <div className='column-tasks'>
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
