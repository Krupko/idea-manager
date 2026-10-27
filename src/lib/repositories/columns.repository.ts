import { supabase } from '@/lib/supabase';
import type { DbColumn } from '@/types/db';

// Получаем все колонки конкретной доски
export const getColumnsBoard = async (boardId: string): Promise<DbColumn[]> => {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as DbColumn[];
};

// Создание колонки
export const createColumn = async (
  boardId: string,
  title: string,
  order: number
): Promise<DbColumn> => {
  const { data, error } = await supabase
    .from('columns')
    .insert({ board_id: boardId, title, order })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbColumn;
};

// Обновить колонку
export const updateColumn = async (
  id: string,
  updates: { title?: string; order?: number }
): Promise<void> => {
  const { error } = await supabase.from('columns').update(updates).eq('id', id);

  if (error) throw new Error(error.message);
};

export const deleteColumn = async (id: string): Promise<void> => {
  const { error } = await supabase.from('columns').delete().eq('id', id);

  if (error) throw new Error(error.message);
};
