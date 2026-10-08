import { LABEL_COLORS } from '../../../constants/labels';
import type { Label } from '../types';
import './LabelsPicker.scss';

interface LabelsPickerProps {
  value: Label[];
  onChange: (labels: Label[]) => void;
  maxLabels?: number;
}

export const LabelsPicker = ({ value, onChange, maxLabels = 3 }: LabelsPickerProps) => {
  const isSelected = (color: string) => value.some((l) => l.color === color);

  // Обработка клика по цвету
  const handleToggle = (color: string) => {
    if (isSelected(color)) {
      onChange(value.filter((l) => l.color !== color));
      return;
    }

    if (value.length >= maxLabels) return; // Проверка максимума добавленых меток

    // Добавляем метку с уникальным id
    const newLabel: Label = {
      id: crypto.randomUUID(),
      color,
    };
    onChange([...value, newLabel]);
  };

  return (
    <div className='labels-picker'>
      {/* Счетчик выбраных меток*/}
      <div className='labels-picker__counter'>
        {value.length}/{maxLabels}
      </div>

      {/* политра уветов */}
      <div className='labels-picker__colors'>
        {LABEL_COLORS.map((color) => (
          <button
            className={`labels-picker__color ${isSelected(color) ? 'labels-picker__color--active' : ''}`}
            key={color}
            type='button'
            onClick={() => handleToggle(color)}
            aria-label={`Метка ${color}`}
            disabled={!isSelected(color) && value.length >= maxLabels}
            style={{ backgroundColor: color }}
          ></button>
        ))}
      </div>
    </div>
  );
};
