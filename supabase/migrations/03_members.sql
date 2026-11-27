-- =====================================================================
-- IDEA-MANAGER: Безопасный поиск пользователей и управление ролями
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. find_user_by_email
-- ---------------------------------------------------------------------
-- Ищет пользователя по email для приглашения на доску.
-- ВАЖНО: Функция доступна только тем, кто является владельцем (owner)
-- хотя бы одной доски, чтобы предотвратить массовый сбор email'ов.
-- ---------------------------------------------------------------------
create or replace function public.find_user_by_email(p_email text)
returns table (id uuid, email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Проверка безопасности: является ли вызывающий владельцем хотя бы одной доски?
  -- (Если нет — это обычный viewer/editor, ему нельзя искать людей).
  if not exists (
    select 1 from public.board_members
    where user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Только владелец доски может приглашать участников' using errcode = '42501';
  end if;

  -- Возвращаем id и email найденного пользователя
  return query
  select p.id, p.email
  from public.profiles p
  where p.email = p_email
  limit 1;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. get_board_members
-- ---------------------------------------------------------------------
-- Возвращает список участников доски вместе с их email.
-- Обычный select из board_members не вернет email (RLS на profiles),
-- поэтому используем security definer.
-- ---------------------------------------------------------------------
create or replace function public.get_board_members(p_board_id uuid)
returns table (id uuid, user_id uuid, email text, role text)
language sql
security definer
stable
set search_path = public
as $$
  -- Проверка прав: если у пользователя есть доступ к доске, он может видеть список.
  select bm.id, bm.user_id, p.email, bm.role
  from public.board_members bm
  join public.profiles p on p.id = bm.user_id
  where bm.board_id = p_board_id
    and public.has_board_access(p_board_id)
  order by bm.created_at asc;
$$;

-- ---------------------------------------------------------------------
-- 3. Финальный сброс кеша PostgREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';
