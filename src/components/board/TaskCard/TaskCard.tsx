import './TaskCard.scss';
import { Check, Clock } from 'lucide-react';
import type { Task } from '../types';
import { getDeadlineStatus, getDeadlineLabel } from '../../../utils/deadline';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onDragStart: (tasdId: string, colunmId: string) => void;
  onDragEnd: () => void;
  onTaskDrop: (targetTaskId: string, position: 'before' | 'after') => void;
}

export const TaskCard = ({ task, columnId, onDragStart, onDragEnd, onTaskDrop }: TaskCardProps) => {
  const [isDragging, setDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline) : null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setDragging(true);
    onDragStart(task.id, columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDragging(false);
    setDropPosition(null);
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    setDropPosition(e.clientY < middleY ? 'before' : 'after');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dropPosition) return;

    onTaskDrop(task.id, dropPosition);
    setDropPosition(null);
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  return (
    <div
      className={`task-card ${isDragging ? 'tasl-card--dragging' : ''} ${dropPosition ? `task-card--${dropPosition}` : ''}`}
      draggable='true'
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {task.labels.length > 0 && (
        <div className='task-card__labels'>
          {task.labels.map((label) => (
            <span
              key={label.id}
              className='task-card-label'
              style={{ backgroundColor: label.color }}
            />
          ))}
        </div>
      )}

      <h4>{task.title}</h4>

      {task.description && <p className='task-card__description'>{task.description}</p>}

      {task.deadline && deadlineStatus && (
        <div className={`task-card__deadline task-card__deadline--${deadlineStatus}`}>
          <Clock size={14} />
          <span>{getDeadlineLabel(task.deadline)}</span>
        </div>
      )}

      {totalSubtasks > 0 && (
        <div className='task-card__deadline'>
          <Check size={14} />
          <span>
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      )}

      <div>
        <div>
          {task.done && (
            <button className='task-card__deadline' type='button'>
              <Check size={14} />
              <span>Dete</span>
            </button>
          )}
          {task.deadline && (
            <button className='task-card__deadline' type='button'>
              <Clock size={14} />
              <span>Date</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
