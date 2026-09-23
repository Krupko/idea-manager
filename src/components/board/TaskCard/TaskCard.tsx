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
}

export const TaskCard = ({ task, columnId, onDragStart, onDragEnd }: TaskCardProps) => {
  const [isDragging, setDragging] = useState(false);

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
    onDragEnd();
  };

  return (
    <div
      className={`task-card ${isDragging ? 'tasl-card--dragging' : ''}`}
      draggable='true'
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
