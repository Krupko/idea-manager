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
export const createTask = async (
  columnId: string,
  data: CreateTaskDTO,
  labels: { color: string }[] = [],
  subtasks: { title: string; completed: boolean }[] = []
): Promise<DbTask> => {
  const { data: created, error } = await supabase
    .from('tasks')
    .insert({ ...data, column_id: columnId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  // сохранение меток если они есть
  if (labels.length > 0) {
    const { error: labelsError } = await supabase
      .from('labels')
      .insert(labels.map((l) => ({ task_id: created.id, color: l.color })));
    if (labelsError) console.error('Ошибка сохранения меток:', labelsError);
  }

  if (subtasks.length > 0) {
    const { error: subtasksError } = await supabase.from('subtasks').insert(
      subtasks.map((s, index) => ({
        task_id: created.id,
        title: s.title,
        completed: s.completed,
        order: index,
      }))
    );
    if (subtasksError) console.error('Ошибка сохранения подзадач', subtasksError);
  }

  return created as DbTask;
};
// Обновить задачу
export const updateTask = async (
  id: string,
  updates: Partial<Omit<DbTask, 'id' | 'created_at'>>,
  labels?: { color: string }[],
  subtasks?: { title: string; completed: boolean }[]
): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);

  // обновляем метки если они есть
  if (labels !== undefined) {
    await supabase.from('labels').delete().eq('task_id', id);
    if (labels.length > 0) {
      await supabase.from('labels').insert(labels.map((l) => ({ task_id: id, color: l.color })));
    }
  }

  // обновляем подзадачи если они есть
  if (subtasks !== undefined) {
    await supabase.from('subtasks').delete().eq('task_id', id);
    if (subtasks.length > 0) {
      await supabase.from('subtasks').insert(
        subtasks.map((s, index) => ({
          task_id: id,
          title: s.title,
          completed: s.completed,
          order: index,
        }))
      );
    }
  }
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
