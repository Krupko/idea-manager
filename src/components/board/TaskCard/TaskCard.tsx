import './TaskCard.scss';
import { Check, Clock } from 'lucide-react';
import type { Task } from '../types';
import { getDeadlineStatus, getDeadlineLabel } from '../../../utils/deadline';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onDragStart: (taskId: string, columnId: string) => void;
  onDragEnd: () => void;
  onTaskDrop: (targetTaskId: string, position: 'before' | 'after') => void;
  isJustMoved: boolean;
}

export const TaskCard = ({
  task,
  columnId,
  onDragStart,
  onDragEnd,
  onTaskDrop,
  isJustMoved,
}: TaskCardProps) => {
  const [isDragging, setDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const deadlineStatus = task.deadline ? getDeadlineStatus(task.deadline) : null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setDragging(true);
    onDragStart(task.id, columnId);
    e.dataTransfer.effectAllowed = 'move';

    const ghost = e.currentTarget.cloneNode(true) as HTMLDivElement;
    ghost.style.position = 'fixed';
    ghost.style.top = '-1000px';
    ghost.style.opacity = '0.9';
    ghost.style.transform = 'rotate(3deg)';
    ghost.style.height = `${e.currentTarget.offsetHeight}px`;
    ghost.style.width = `${e.currentTarget.offsetWidth}px`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
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
      className={`task-card ${isDragging ? 'task-card--dragging' : ''} ${dropPosition ? `task-card--${dropPosition}` : ''} ${isJustMoved ? 'task-card--flash' : ''}`}
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
              className='task-card__label'
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
