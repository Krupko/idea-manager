import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal/Modal';
import './AddSectionModal.scss';

const sectionSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(50, 'Не более 50 символов'),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export const AddSectionModal = ({ isOpen, onClose, onSubmit }: AddSectionModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { title: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: SectionFormData) => {
    onSubmit(data.title);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form className='add-section-modal' onSubmit={handleSubmit(handleFormSubmit)}>
        <h2 className='add-section-modal__title'>Новая колонка</h2>

        <div className='add-section-modal__field'>
          <label htmlFor='title'>Название</label>
          <input
            type='text'
            id='title'
            placeholder='Например: в работе'
            {...register('title')}
            autoFocus
          />
          {errors.title && <span className='add-section-modal__error'>{errors.title.message}</span>}
        </div>

        <div className='add-section-modal__actions'>
          <button
            className='add-section-modal__btn add-section-modal__btn--cancel'
            type='button'
            onClick={handleClose}
          >
            Отмена
          </button>

          <button
            className='add-section-modal__btn add-section-modal__btn--submit'
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
