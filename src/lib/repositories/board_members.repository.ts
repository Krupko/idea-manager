import { supabase } from '@/lib/supabase';
import type { DbBoardMember } from '@/types/db';

export interface BoardMemberWithEmail {
  id: string;
  user_id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}

// Получаем всех участников доски
export const getBoardMembers = async (boardId: string): Promise<BoardMemberWithEmail[]> => {
  const { data, error } = await supabase.rpc('get_board_members', { p_board_id: boardId });

  if (error) throw error;
  return (data ?? []) as BoardMemberWithEmail[];
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

  if (error) throw error;
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

  if (error) throw error;
};

// Найти пользователя по email
export const findUserByEmail = async (
  email: string
): Promise<{ id: string; email: string } | null> => {
  const { data, error } = await supabase.rpc('find_user_by_email', { p_email: email });

  if (error) throw error;

  const rows = data as { id: string; email: string }[] | null;
  return rows && rows.length > 0 ? rows[0] : null;
};
