import { supabase } from '@/lib/supabase';
import type { DbBoard } from '@/types/db.ts';

// Получаем все доски текущего пользователя
// RLS фильтрует по owner_id = auth.uid()
export const getBoards = async (): Promise<DbBoard[]> => {
  const { data, error } = await supabase
    .from('boards') // таблица
    .select('*') // все поля
    .order('created_at', { ascending: true }); // сортировка
  if (error) throw new Error(error.message);
  return data as DbBoard[];
};

// Получение одной доски по id
export const getBoardById = async (id: string): Promise<DbBoard | null> => {
  const { data, error } = await supabase.from('boards').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data as DbBoard;
};

// Создание новой доски owner_id подставляется автоматически через RLS/тригер
export const createBoard = async (title: string, description?: string): Promise<DbBoard> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Пользователь не авторизован');

  const { data, error } = await supabase
    .from('boards')
    .insert({
      owner_id: user.id,
      title,
      description: description ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbBoard;
};

// Обновление доски
export const updateBoard = async (id: string, title: string): Promise<void> => {
  const { error } = await supabase
    .from('boards')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// удаление доски и колонки с задачами качкадно
export const deleteBoard = async (id: string): Promise<void> => {
  const { error } = await supabase.from('boards').delete().eq('id', id);

  if (error) throw new Error(error.message);
};
