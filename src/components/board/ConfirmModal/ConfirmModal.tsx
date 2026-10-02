import './ConfirmModal.scss';

import { Modal } from '@/components/ui/Modal/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Вы уверены?',
  message = 'Это действие нельзя будет отмeнить',
  confirmText = 'Удалить',
  cancelText = 'Отменить',
  variant = 'danger',
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='confirm-modal'>
        <h2 className='confirm-modal__title'>{title}</h2>
        <p className='confirm-modal__message'>{message}</p>

        <div className='confirm-modal__actions'>
          <button
            className='confirm-modal__btn confirm-modal__btn--cancel'
            type='button'
            onClick={onClose}
          >
            {cancelText}
          </button>

          <button
            className={`confirm-modal__btn confirm-modal__btn--confirm confirm-modal__btn--${variant}`}
            type='button'
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
