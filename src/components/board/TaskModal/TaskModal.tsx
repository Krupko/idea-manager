import { Modal } from '@/components/ui/Modal/Modal';
import './TaskModal.scss';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import type { Task } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

const taskSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100, 'Максимально 100 знаков'),
  description: z.string().max(500, 'Максимально 500 знаков').optional(),
  deadline: z.string().optional(),
  paused: z.boolean(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  initialTask?: Task | null;
}

export const TaskModal = ({ isOpen, onClose, onSubmit, initialTask }: TaskModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialTask?.title ?? '',
      description: initialTask?.description ?? '',
      deadline: initialTask?.deadline ?? '',
      paused: initialTask?.paused ?? false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: initialTask?.title ?? '',
        description: initialTask?.description ?? '',
        deadline: initialTask?.deadline ?? '',
        paused: initialTask?.paused ?? false,
      });
    }
  }, [initialTask, isOpen, reset]);

  const handleFormSubmit = (data: TaskFormData) => {
    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      title: data.title,
      description: data.description,
      deadline: data.deadline || undefined,
      labels: [], // TODO Почему пустой: пока не реализовано, но тип требует
      subtasks: [], // TODO добавить редактор подзадач
      done: initialTask?.done ?? false,
      paused: data.paused,
    };

    onSubmit(taskData);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className='task-modal' onSubmit={handleSubmit(handleFormSubmit)}>
        <h2 className='task-modal__title'>
          {initialTask ? 'Редактировать задачу' : 'Новая задача'}
        </h2>

        {/* Поле: Название */}
        <div className='task-modal__field'>
          <label htmlFor='title'>Название</label>
          <input
            id='title'
            type='text'
            {...register('title')}
            placeholder='Введите название'
            autoFocus
          />
          {errors.title && <span className='task-modal__error'>{errors.title.message}</span>}
        </div>

        {/* Поле: Описание */}
        <div className='task-modal__field'>
          <label htmlFor='description'>Описание</label>
          <textarea
            id='description'
            rows={4}
            {...register('description')}
            placeholder='Введите описание'
          />
          {errors.description && (
            <span className='task-modal__error'>{errors.description.message}</span>
          )}
        </div>

        {/* Поле:  Дедлайн*/}
        <div className='task-modal__field'>
          <label htmlFor='deadline'>Дедлайн</label>
          <input id='deadline' type='date' {...register('deadline')} />
        </div>

        {/* Поле: Пауза */}
        <div className='task-modal__field task-modal__field--checkbox'>
          <label>
            <input type='checkbox' {...register('paused')} />
            Приостановить выполнение
          </label>
        </div>

        {/* Кнопки */}
        <div className='task-modal__actions'>
          <button
            type='button'
            onClick={onClose}
            className='task-modal__btn task-modal__btn--cancel'
          >
            Отмена
          </button>
          <button className='task-modal__btn task-modal__btn--submit'>
            {initialTask ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
