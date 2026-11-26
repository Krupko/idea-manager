import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Интерфейс для payload
export type RealtimeTaskPayload =
  | { eventType: 'DELETE'; old: { id: string } }
  | {
      eventType: 'UPDATE';
      new: {
        id: string;
        column_id: string;
        title: string;
        description: string | null;
        deadline: string | null;
        done: boolean;
        paused: boolean;
      };
    }
  | { eventType: 'INSERT'; new: { id: string } };

interface UseBoardRealtimeProps {
  boardId: string | undefined; // Id доски за которым следим
  onColumnsChange: () => void; // Callback - если изменилась колонка
  onTasksChange: (payload: RealtimeTaskPayload) => void; // Callback - если изменилась задача
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
        () => onColumnsChange() // Вызов callback при любом изменении
      )
      // ПОДПИСКА НА ИЗМЕНЕНИЯ В ТАБЛИЦЕ TASKS
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => onTasksChange(payload as unknown as RealtimeTaskPayload)
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
