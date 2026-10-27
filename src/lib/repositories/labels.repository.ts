import { supabase } from '@/lib/supabase';
import type { DbLabel } from '@/types/db';

export const getLabelByTask = async (taskId: string): Promise<DbLabel[]> => {
  const { data, error } = await supabase.from('labels').select('*').eq('task_id', taskId);

  if (error) throw new Error(error.message);
  return data as DbLabel[];
};

export const createLabel = async (taskId: string, color: string): Promise<DbLabel> => {
  const { data, error } = await supabase
    .from('labels')
    .insert({ task_id: taskId, color })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbLabel;
};

export const deleteLabel = async (id: string): Promise<void> => {
  const { error } = await supabase.from('labels').delete().eq('id', id);

  if (error) throw new Error(error.message);
};
