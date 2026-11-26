import { supabase } from '@/lib/supabase';
import type { DbTask, CreateTaskDTO } from '@/types/db';

// ─── ТИПЫ ДЛЯ RPC-ОТВЕТОВ ───
// Данные приходят из RPC get_board_with_relations (jsonb).
// Структура повторяет DbTask, DbLabel, DbSubtask, но вложена в columns.
export interface DbTaskWithRelations {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  done: boolean;
  paused: boolean;
  order: number;
  created_at: string;
  updated_at: string | null;
  labels: { id: string; color: string }[];
  subtasks: { id: string; title: string; completed: boolean; order: number }[];
}

export interface DbColumnWithRelations {
  id: string;
  title: string;
  order: number;
  tasks: DbTaskWithRelations[];
}

export interface BoardWithRelations {
  columns: DbColumnWithRelations[];
}

// ─── ЗАГРУЗКА ВСЕЙ ДОСКИ ОДНИМ ЗАПРОСОМ ───
// Заменяет цепочку getColumnsBoard + getTasksByColumn + getLabelByTask + getSubtaskByTask.
// Один HTTP-запрос → RPC в Postgres → JSON со всей структурой.
export const getBoardWithRelations = async (boardId: string): Promise<DbColumnWithRelations[]> => {
  const { data, error } = await supabase.rpc('get_board_with_relations', {
    p_board_id: boardId,
  });

  if (error) {
    // Пробрасываем как есть (PostgrestError с code/message), чтобы UI мог
    // отличить 'Нет доступа к доске' (42501) от других ошибок.
    throw error;
  }
  // data — это jsonb { columns: [...] }.
  const parsed = data as BoardWithRelations | null;
  return parsed?.columns ?? [];
};

// Получить все задачи конкретной колонки
export const getTasksByColumn = async (columnId: string): Promise<DbTask[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('column_id', columnId)
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as DbTask[];
};

// Создать задачу — атомарно через RPC.
// 1 HTTP-запрос → Postgres выполняет insert task + insert labels + insert subtasks
// в ОДНОЙ транзакции. Если что-то упадёт — всё откатится.
// Возвращает { id, created_at } — временный id заменяется в UI на реальный.
export const createTask = async (
  columnId: string,
  data: CreateTaskDTO,
  labels: { color: string }[] = [],
  subtasks: { title: string; completed: boolean }[] = []
): Promise<{ id: string; created_at: string }> => {
  const { data: taskId, error } = await supabase.rpc('create_task_with_relations', {
    p_column_id: columnId,
    p_title: data.title,
    p_description: data.description,
    p_deadline: data.deadline,
    p_done: data.done,
    p_paused: data.paused,
    p_order: data.order,
    p_labels: labels,
    p_subtasks: subtasks,
  });

  if (error) throw error;

  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('id, created_at')
    .eq('id', taskId as string)
    .single();
  if (fetchError) throw fetchError;
  return task as { id: string; created_at: string };
};
// Обновить задачу — атомарно через RPC.
// 1 HTTP-запрос → Postgres обновляет task + заменяет labels + заменяет subtasks
// в ОДНОЙ транзакции. Если что-то упадёт — всё откатится.
//
// ВАЖНО: labels/subtasks — если undefined, НЕ трогаем (оставляем как в БД).
// Если массив (в т.ч. пустой) — заменяем полностью.
export const updateTask = async (
  id: string,
  updates: Partial<Omit<DbTask, 'id' | 'created_at'>>,
  labels?: { color: string }[],
  subtasks?: { title: string; completed: boolean }[]
): Promise<void> => {
  const { error } = await supabase.rpc('update_task_with_relations', {
    p_task_id: id,
    p_title: updates.title ?? '',
    p_description: updates.description ?? null,
    p_deadline: updates.deadline ?? null,
    p_done: updates.done ?? false,
    p_paused: updates.paused ?? false,
    p_labels: labels ?? null,
    p_subtasks: subtasks ?? null,
  });
  if (error) throw error;
};

export const toggleTaskPause = async (taskId: string, paused: boolean): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ paused, update_at: new Date().toISOString() })
    .eq('id', taskId);
  if (error) throw error;
};

// Удаление задачи
export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) throw new Error(error.message);
};
// Переместить задачу — атомарно через RPC.
// Postgres пересчитывает order у соседей в целевой колонке,
// чтобы не было дублей order.
export const moveTask = async (
  taskId: string,
  newColumnId: string,
  newOrder: number
): Promise<void> => {
  const { error } = await supabase.rpc('move_task', {
    p_task_id: taskId,
    p_new_column_id: newColumnId,
    p_new_order: newOrder,
  });
  if (error) throw error;
};
