import './Column.scss';
import { EllipsisVertical } from 'lucide-react';
import type { Column as ColumnType } from '../types.ts';
import { TaskCard } from '../TaskCard/TaskCard.tsx';
import { useState } from 'react';

interface ColumnProps {
  column: ColumnType;
  onDragStart: (taskId: string, columnId: string) => void;
  onDragEnd: () => void;
  onDrop: (targetColumnId: string) => void;
}
export const Column = ({ column, onDragStart, onDragEnd, onDrop }: ColumnProps) => {
  const [isOver, setIsOver] = useState(false);
  const handleDragEnter = () => {
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(column.id);
  };

  return (
    <div
      className={`column ${isOver ? 'column--over' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className='column-header'>
        <h3>{column.title}</h3>
        <button className='column-button' type='button'>
          <EllipsisVertical size={20} />
        </button>
      </div>

      <div className='column-tasks'>
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};
