import './Column.scss';
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Column as ColumnType, Task } from '../types.ts';
import { TaskCard } from '../TaskCard/TaskCard.tsx';
import { useEffect, useRef, useState } from 'react';

interface ColumnProps {
  column: ColumnType;
  onDragStart: (taskId: string, columnId: string) => void;
  onDragEnd: () => void;
  onDrop: (targetColumnId: string) => void;
  onTaskDrop: (targetColumnId: string, targetTaskId: string, position: 'before' | 'after') => void;
  justMovedTaskId: string | null;
  onAddTask: (columnId: string) => void;
  onEditClick: (task: Task) => void;
  onDeleteClick: (task: Task) => void;
  onTogglePause: (taskId: string) => void;
  onEditColumn: (column: ColumnType) => void;
  onDeleteColumn: (column: ColumnType) => void;
  isDraggingActive: boolean;
}
export const Column = ({
  column,
  onDragStart,
  onDragEnd,
  onDrop,
  onTaskDrop,
  justMovedTaskId,
  onAddTask,
  onEditClick,
  onDeleteClick,
  onTogglePause,
  onEditColumn,
  onDeleteColumn,
  isDraggingActive,
}: ColumnProps) => {
  const [isOver, setIsOver] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dragCounter = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

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
  const isCurrentlyOver = isDraggingActive && isOver;

  return (
    <div
      className={`column ${isCurrentlyOver ? 'column--over' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className='column-header'>
        <h3>{column.title}</h3>

        <div className='column-menu-wrapper' ref={menuRef}>
          <button
            className='column-button'
            type='button'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <EllipsisVertical size={20} />
          </button>

          {isMenuOpen && (
            <div className='column-dropdown'>
              <button
                className='column-dropdown__item'
                type='button'
                onClick={() => {
                  onEditColumn(column);
                  setIsMenuOpen(false);
                }}
              >
                <Pencil size={14} />
                <span>Редактировать</span>
              </button>

              {isEmpty && (
                <button
                  className='column-dropdown__item column-dropdown__item--danger'
                  type='button'
                  onClick={() => {
                    onDeleteColumn(column);
                    setIsMenuOpen(false);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Удалить</span>
                </button>
              )}
            </div>
          )}
        </div>
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
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onTogglePause={onTogglePause}
          />
        ))}
        {isEmpty && (
          <div
            className={`column__placeholder ${isCurrentlyOver ? 'column__placeholder--over' : ''}`}
          >
            Перетащить сюда
          </div>
        )}
      </div>

      <button className='column-add' type='button' onClick={() => onAddTask(column.id)}>
        <Plus size={20} />
        <span>Добавить задачу</span>
      </button>
    </div>
  );
};
