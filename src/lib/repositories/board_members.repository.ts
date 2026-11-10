import { supabase } from '@/lib/supabase';
import type { DbBoardMember } from '@/types/db';

// Получаем всех участников доски
export const getBoardMembers = async (boardId: string): Promise<DbBoardMember[]> => {
  const { data, error } = await supabase.from('board_members').select('*').eq('board_id', boardId);

  if (error) throw new Error(error.message);
  return data as DbBoardMember[];
};

// Добавить участника на доску
export const addBoardMember = async (
  boardId: string,
  userId: string,
  role: 'owner' | 'editor' | 'viewer' = 'viewer'
): Promise<DbBoardMember> => {
  const { data, error } = await supabase
    .from('board_members')
    .insert({ board_id: boardId, user_id: userId, role: role })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DbBoardMember;
};

// Удалить участника с доски
export const removeBoardMember = async (memberId: string): Promise<void> => {
  const { error } = await supabase.from('board_members').delete().eq('id', memberId);

  if (error) throw new Error(error.message);
};

// Изменить роль участника
export const updateMemberRole = async (
  memberId: string,
  newRole: 'editor' | 'viewer'
): Promise<void> => {
  const { error } = await supabase
    .from('board_members')
    .update({ role: newRole })
    .eq('id', memberId);

  if (error) throw new Error(error.message);
};

// Найти пользователя по email
export const findUserByEmail = async (
  email: string
): Promise<{ id: string; email: string } | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};
