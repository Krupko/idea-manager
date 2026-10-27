import { supabase } from '@/lib/supabase';
import type { DbSubtask } from '@/types/db';

export const getSubtaskByTask = async (taskId: string): Promise<DbSubtask[]> => {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as DbSubtask[];
};

export const createSubtask = async (
  taskId: string,
  title: string,
  order: number
): Promise<DbSubtask> => {
  const { data, error } = await supabase
    .from('subtasks')
    .insert({ task_id: taskId, title, order })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as DbSubtask;
};

export const updateSubtask = async (
  id: string,
  updates: { title?: string; completed?: boolean; order?: number }
): Promise<void> => {
  const { error } = await supabase.from('subtasks').update(updates).eq('id', id);

  if (error) throw new Error(error.message);
};

export const deleteSubtask = async (id: string): Promise<void> => {
  const { error } = await supabase.from('subtasks').delete().eq('id', id);

  if (error) throw new Error(error.message);
};
