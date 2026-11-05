import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UseBoardRealtimeProps {
  boardId: string | undefined; // Id доски за которым следим
  onColumnsChange: () => void; // Callback - если изменилась колонка
  onTasksChange: () => void; // Callback - если изменилась задача
  onBoardChange: () => void; // Callback - если изменилась доска
}

export const useBoardRealtime = ({
  boardId,
  onColumnsChange,
  onTasksChange,
  onBoardChange,
}: UseBoardRealtimeProps) => {
  useEffect(() => {
    if (!boardId) return; // Если доска не выбрана - не подписываемся
    // Создаем канал (WebSocket - coeдинение)
    const channel = supabase
      .channel(`board-${boardId}`) // Уникальное имя канала именно для этой доска
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${boardId}` },
        () => {
          onColumnsChange(); // Вызов callback при любом изменении
        }
      )
      // ПОДПИСКА НА ИЗМЕНЕНИЯ В ТАБЛИЦЕ TASKS
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          onTasksChange();
        }
      )
      // подписка на изменение досок
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boards' }, () =>
        onBoardChange()
      )
      .subscribe(); // активация подписки

    return () => {
      // отписка cleanup
      supabase.removeChannel(channel);
    };
  }, [boardId, onColumnsChange, onTasksChange, onBoardChange]);
};
