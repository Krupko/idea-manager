import './Column.scss';
import { EllipsisVertical } from 'lucide-react';
import type { Column as ColumnType } from '../types.ts';
import { TaskCard } from '../TaskCard/TaskCard.tsx';
import { useRef, useState } from 'react';

interface ColumnProps {
  column: ColumnType;
  onDragStart: (taskId: string, columnId: string) => void;
  onDragEnd: () => void;
  onDrop: (targetColumnId: string) => void;
  onTaskDrop: (targetColumnId: string, targetTaskId: string, position: 'before' | 'after') => void;
  justMovedTaskId: string | null;
}
export const Column = ({
  column,
  onDragStart,
  onDragEnd,
  onDrop,
  onTaskDrop,
  justMovedTaskId,
}: ColumnProps) => {
  const [isOver, setIsOver] = useState(false);

  const dragCounter = useRef(0);

  const handleDragEnter = () => {
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsOver(true);
  };

  const handleDragLeave = () => {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsOver(false);
    onDrop(column.id);
  };

  const isEmpty = column.tasks.length === 0;

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
            onTaskDrop={(targetTaskId, position) => onTaskDrop(column.id, targetTaskId, position)}
            isJustMoved={task.id === justMovedTaskId}
          />
        ))}
        {isEmpty && (
          <div className={`column__placeholder ${isOver ? 'column__placeholder--over' : ''}`}>
            Перетащить сюда
          </div>
        )}
      </div>
    </div>
  );
};
