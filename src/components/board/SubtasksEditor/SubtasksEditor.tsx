import { useState } from 'react';
import type { Subtask } from '../types';
import './SubtasksEditor.scss';
import { Check, Plus, X } from 'lucide-react';

interface SubtasksEditorProps {
  value: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export const SubtasksEditor = ({ value, onChange }: SubtasksEditorProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
    };

    onChange([...value, newSubtask]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleToggle = (id: string) => {
    onChange(value.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((s) => s.id !== id));
  };

  return (
    <div className='subtasks-editor'>
      <div className='subtasks-editor__input-row'>
        <input
          className='subtasks-editor__input'
          type='text'
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Добавить подзадачу...'
        />

        <button
          className='subtasks-editor__add-btn'
          type='button'
          onClick={handleAdd}
          aria-label='Добавить подзадачу'
        >
          <Plus size={16} />
        </button>
      </div>

      {/* ← Список подзадач */}
      {value.length > 0 && (
        <ul className='subtasks-editor__list'>
          {value.map((subtask) => (
            <li
              key={subtask.id}
              className={`subtasks-editor__item ${subtask.completed ? 'subtasks-editor__item--done' : ''}`}
            >
              {/* ← чекбокс */}
              <button
                className='subtasks-editor__checkbox'
                type='button'
                onClick={() => handleToggle(subtask.id)}
                aria-label={
                  subtask.completed ? 'Отметить как не выполненную' : 'Отметить как выполненную'
                }
              >
                {subtask.completed && <Check size={12} />}
              </button>

              {/* ← текст подзадачи */}
              <span className='subtasks-editor__title'>{subtask.title}</span>

              {/* ← кнопка удаления */}
              <button
                className='subtasks-editor__remove-btn'
                type='button'
                onClick={() => handleRemove(subtask.id)}
                aria-label='Удалить подзадачу'
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
