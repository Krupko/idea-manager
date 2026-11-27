import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getBoardMembers,
  removeBoardMember,
  updateMemberRole,
  type BoardMemberWithEmail,
} from '@/lib/repositories/board_members.repository';
import { Trash2 } from 'lucide-react';
import './MembersList.scss';

interface MembersListProps {
  boardId: string;
  onMembersChanged?: () => void;
}

export const MembersList = ({ boardId, onMembersChanged }: MembersListProps) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<BoardMemberWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      const data = await getBoardMembers(boardId);
      setMembers(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки участников:', err);
      setError('Не удалось загрузить участников');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMembers();
  }, [loadMembers]);

  // Определяем, является ли текущий пользователь владельцем доски.
  const isOwner = members.some((m) => m.role === 'owner' && m.user_id === user?.id);

  // Сменить роль
  const handleRoleChange = async (memberId: string, newRole: 'editor' | 'viewer') => {
    try {
      await updateMemberRole(memberId, newRole);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
      onMembersChanged?.();
    } catch (err) {
      console.error('Ошибка смены роли:', err);
      alert('Не удалось сменить роль');
    }
  };

  // Удалить участника.
  const handleRemove = async (memberId: string) => {
    try {
      await removeBoardMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      onMembersChanged?.();
    } catch (err) {
      console.error('Ошиька удаления участника:', err);
      alert('Не удалось удалить участника');
    }
  };

  if (loading) return <div className='members-list__loading'>Загрузка участников...</div>;
  if (error) return <div className='members-list__error'>{error}</div>;

  return (
    <div className='members-list'>
      <h3 className='members-list__title'>Участники ({members.length})</h3>
      <ul className='members-list__items'>
        {members.map((member) => {
          const isMe = member.user_id === user?.id;
          const isOwnerMember = member.role === 'owner';

          return (
            <li key={member.id} className='members-list__item'>
              <div className='members-list__info'>
                <span className='members-list__email'>
                  {member.email}
                  {isMe && '(вы)'}
                </span>
                <span className={`members-list__role members-list__role--${member.role}`}>
                  {member.role}
                </span>
              </div>

              {isOwner && !isOwnerMember && (
                <div className='members-list__actions'>
                  <select
                    className='members-list__select'
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value as 'editor' | 'viewer')
                    }
                  >
                    <option value='editor'>Редактор</option>
                    <option value='viewer'>Наблюдатель</option>
                  </select>

                  <button
                    className='members-list__remove-btn'
                    type='button'
                    onClick={() => handleRemove(member.id)}
                    aria-label='Удалить участника'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
