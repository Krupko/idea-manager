import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatCreatedAt = (iso: string): string => {
  try {
    return format(parseISO(iso), 'dd.MM.yyyy', { locale: ru });
  } catch {
    return '';
  }
};
