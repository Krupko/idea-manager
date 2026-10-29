import { supabase } from '@/lib/supabase';
import type { DbTask, CreateTaskDTO } from '@/types/db';

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

// Создать задачу
export const createTask = async (columnId: string, data: CreateTaskDTO): Promise<DbTask> => {
  const { data: created, error } = await supabase
    .from('tasks')
    .insert({ ...data, column_id: columnId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created as DbTask;
};

// Обновить задачу
export const updateTask = async (
  id: string,
  updates: Partial<Omit<DbTask, 'id' | 'created_at'>>
): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// Удаление задачи
export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) throw new Error(error.message);
};

// Переместить задачу в другую колонку drag-and-drop
export const moveTask = async (
  taskId: string,
  newColumnId: string,
  newOrder: number
): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ column_id: newColumnId, order: newOrder, updated_at: new Date().toISOString() })
    .eq('id', taskId);
  if (error) throw new Error(error.message);
};
