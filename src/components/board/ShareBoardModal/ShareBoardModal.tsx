import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal/Modal';
import { findUserByEmail, addBoardMember } from '@/lib/repositories/board_members.repository';
import './ShareBoardModal.scss';

// Схема валидации zod
const shareSchema = z.object({
  email: z.string().check(z.email('Некорректный email')),
  role: z.enum(['editor', 'viewer']),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const ShareBoardModal = ({ isOpen, onClose, boardId }: ShareBoardModalProps) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  const handleFormSubmit = async (data: ShareFormData) => {
    try {
      setMessage(null);

      // ищем пользователя по email
      const user = await findUserByEmail(data.email);

      if (!user) {
        setMessage({ type: 'error', text: 'Пользователь с таким email не зарегистрирован' });
        return;
      }

      // Добавляем пользователя на доску
      await addBoardMember(boardId, user.id, data.role);

      setMessage({ type: 'success', text: 'Участник успешно добавлен!' });
      reset();

      //  закрытие модала через 1.5 сек
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Ошибка приглашения:', err);
      if (err instanceof Error && err.message.includes('duplicate key')) {
        setMessage({
          type: 'error',
          text: 'Этот пользователь уже добавлен',
        });
        return;
      }
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ошибка приглашения',
      });
    }
  };

  const handleClose = () => {
    reset();
    setMessage(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form className='share-modal' onSubmit={handleSubmit(handleFormSubmit)}>
        <h2 className='share-modal__title'>Пригласить участника</h2>

        <div className='share-modal__field'>
          <label htmlFor='email'>Email пользователя</label>
          <input
            type='email'
            id='email'
            {...register('email')}
            placeholder='colleague@example.com'
            autoFocus
          />
          {errors.email && <span className='share-modal__error'>{errors.email.message}</span>}
        </div>

        <div className='share-modal__field'>
          <label htmlFor='role'>Роль</label>
          <select id='role' {...register('role')}>
            <option value='viewer'>Наблюдатель (только смотрит)</option>
            <option value='editor'>Редактор (создание и редактирование задач)</option>
          </select>
        </div>

        {message && (
          <div className={`share-modal__message share-modal__message--${message.type}`}>
            {message.text}
          </div>
        )}

        <div className='share-modal__actions'>
          <button
            className='share-modal__btn share-modal__btn--cancel'
            type='button'
            onClick={handleClose}
          >
            Отмена
          </button>
          <button
            className='share-modal__btn share-modal__btn--submit'
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка....' : 'Пригласить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
