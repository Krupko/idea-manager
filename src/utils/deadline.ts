import { differenceInDays, parseISO, format } from 'date-fns';

export type DeadlineStatus = 'safe' | 'warning' | 'danger' | 'overdue';

export const getDeadlineStatus = (deadline: string): DeadlineStatus => {
  const daysLeft = differenceInDays(parseISO(deadline), new Date());

  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 1) return 'danger';
  if (daysLeft <= 3) return 'warning';
  return 'safe';
};

export const getDeadlineLabel = (deadline: string): string => {
  const daysLeft = differenceInDays(parseISO(deadline), new Date());

  if (daysLeft < 0) return `Просрочено на ${Math.abs(daysLeft)} дн.`;
  if (daysLeft === 0) return 'Сегодня!';
  if (daysLeft === 1) return 'Завтра';
  if (daysLeft <= 3) return `Осталось ${daysLeft} дн.`;
  return format(parseISO(deadline), 'd MMM');
};
