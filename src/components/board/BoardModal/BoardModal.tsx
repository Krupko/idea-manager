import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import './BoardModal.scss';
import type { DbBoard } from '@/types/db';

const boardSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(50, 'Не более 50 символов'),
  description: z.string().max(200, 'Не более 200 символов').optional(),
});

type BoardFormData = z.infer<typeof boardSchema>;

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => void;
  initialBoard?: DbBoard | null;
}

export const BoardModal = ({ isOpen, onClose, onSubmit, initialBoard }: BoardModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: initialBoard?.title ?? '',
      description: initialBoard?.description ?? '',
    },
  });

  // Сброс формы
  useEffect(() => {
    if (isOpen) {
      reset({
        title: initialBoard?.title ?? '',
        description: initialBoard?.description ?? '',
      });
    }
  }, [initialBoard, isOpen, reset]);

  const handleFormSubmit = (data: BoardFormData) => {
    onSubmit({
      title: data.title,
      description: data.description || undefined,
    });
    // После успешной отправки сбрасываем форму и закрываем модал
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className='board-modal' onSubmit={handleSubmit(handleFormSubmit)}>
        <h2 className='board-modal__title'>
          {initialBoard ? 'Редактировать доску' : 'Новая доска'}
        </h2>

        {/*Поле Название*/}
        <div className='board-modal__field'>
          <label htmlFor='title'>Название *</label>
          <input
            type='text'
            id='title'
            {...register('title')}
            placeholder='Например: Мои проекты'
            autoFocus
          />
          {errors.title && <span className='board-modal__error'>{errors.title.message}</span>}
        </div>

        {/*Поле описания*/}
        <div className='board-modal__field'>
          <label htmlFor='description'>Описание</label>
          <textarea
            rows={3}
            id='description'
            placeholder='Необязательное описание...'
            {...register('description')}
          />
          {errors.description && (
            <span className='board-modal__error'>{errors.description.message}</span>
          )}
        </div>

        {/*кнопки*/}
        <div className='board-modal__actions'>
          <button
            className='board-modal__btn board-modal__btn--cancel'
            type='button'
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className='board-modal__btn board-modal__btn--submit'
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : initialBoard ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
