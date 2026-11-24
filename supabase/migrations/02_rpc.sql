-- =====================================================================
-- IDEA-MANAGER: RPC-функции (безопасная версия)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. get_board_with_relations: вся доска одним запросом
-- ---------------------------------------------------------------------
-- ✅ БЕЗОПАСНОСТЬ: Добавлена проверка has_board_access.
-- Теперь функция работает только для тех, кто имеет доступ к доске.
-- Пришлось сменить язык с 'sql' на 'plpgsql', чтобы использовать IF.
-- ---------------------------------------------------------------------
create or replace function public.get_board_with_relations(p_board_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  -- Проверка прав: если у пользователя нет доступа к доске, выбрасываем ошибку.
  if not public.has_board_access(p_board_id) then
    raise exception 'Нет доступа к доске' using errcode = '42501';
  end if;

  return (
    select jsonb_build_object(
      'columns', coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'title', c.title,
              'order', c."order",
              'tasks', coalesce(
                (
                  select jsonb_agg(
                    jsonb_build_object(
                      'id', t.id,
                      'title', t.title,
                      'description', t.description,
                      'deadline', t.deadline,
                      'done', t.done,
                      'paused', t.paused,
                      'order', t."order",
                      'created_at', t.created_at,
                      'updated_at', t.updated_at,
                      'labels', coalesce(
                        (
                          select jsonb_agg(jsonb_build_object('id', l.id, 'color', l.color))
                          from public.labels l where l.task_id = t.id
                        ),
                        '[]'::jsonb
                      ),
                      'subtasks', coalesce(
                        (
                          select jsonb_agg(
                            jsonb_build_object(
                              'id', s.id,
                              'title', s.title,
                              'completed', s.completed,
                              'order', s."order"
                            )
                            order by s."order"
                          )
                          from public.subtasks s where s.task_id = t.id
                        ),
                        '[]'::jsonb
                      )
                    )
                    order by t."order"
                  )
                  from public.tasks t where t.column_id = c.id
                ),
                '[]'::jsonb
              )
            )
            order by c."order"
          )
          from public.columns c where c.board_id = p_board_id
        ),
        '[]'::jsonb
      )
    )
  );
end;
$$;

-- ---------------------------------------------------------------------
-- 2. create_task_with_relations
-- ---------------------------------------------------------------------
create or replace function public.create_task_with_relations(
  p_column_id uuid,
  p_title text,
  p_description text,
  p_deadline timestamptz,
  p_done boolean,
  p_paused boolean,
  p_order int,
  p_labels jsonb,
  p_subtasks jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_id uuid;
  v_board_id uuid;
  v_order int;
begin
  select board_id into v_board_id from public.columns where id = p_column_id;
  if v_board_id is null then
    raise exception 'Колонка не найдена' using errcode = 'P0002';
  end if;
  if not public.can_edit_board(v_board_id) then
    raise exception 'Нет прав на создание задачи' using errcode = '42501';
  end if;

  if p_order < 0 then
    select coalesce(max("order") + 1, 0) into v_order
    from public.tasks where column_id = p_column_id;
  else
    v_order := p_order;
    update public.tasks
    set "order" = "order" + 1
    where column_id = p_column_id and "order" >= v_order;
  end if;

  insert into public.tasks (column_id, title, description, deadline, done, paused, "order")
  values (p_column_id, p_title, p_description, p_deadline, p_done, p_paused, v_order)
  returning id into v_task_id;

  if p_labels is not null and jsonb_array_length(p_labels) > 0 then
    insert into public.labels (task_id, color)
    select v_task_id, value->>'color'
    from jsonb_array_elements(p_labels);
  end if;

  if p_subtasks is not null and jsonb_array_length(p_subtasks) > 0 then
    insert into public.subtasks (task_id, title, completed, "order")
    select v_task_id, value->>'title', (value->>'completed')::boolean, (ordinality - 1)::int
    from jsonb_array_elements(p_subtasks) with ordinality;
  end if;

  return v_task_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. update_task_with_relations
-- ---------------------------------------------------------------------
create or replace function public.update_task_with_relations(
  p_task_id uuid,
  p_title text,
  p_description text,
  p_deadline timestamptz,
  p_done boolean,
  p_paused boolean,
  p_labels jsonb,
  p_subtasks jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_board_id uuid;
begin
  select c.board_id into v_board_id
  from public.tasks t join public.columns c on c.id = t.column_id
  where t.id = p_task_id;

  if v_board_id is null then
    raise exception 'Задача не найдена' using errcode = 'P0002';
  end if;
  if not public.can_edit_board(v_board_id) then
    raise exception 'Нет прав на изменение задачи' using errcode = '42501';
  end if;

  update public.tasks
  set title = p_title,
      description = p_description,
      deadline = p_deadline,
      done = p_done,
      paused = p_paused,
      updated_at = now()
  where id = p_task_id;

  if p_labels is not null then
    delete from public.labels where task_id = p_task_id;
    if jsonb_array_length(p_labels) > 0 then
      insert into public.labels (task_id, color)
      select p_task_id, value->>'color'
      from jsonb_array_elements(p_labels);
    end if;
  end if;

  if p_subtasks is not null then
    delete from public.subtasks where task_id = p_task_id;
    if jsonb_array_length(p_subtasks) > 0 then
      insert into public.subtasks (task_id, title, completed, "order")
      select p_task_id, value->>'title', (value->>'completed')::boolean, (ordinality - 1)::int
      from jsonb_array_elements(p_subtasks) with ordinality;
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. move_task
-- ---------------------------------------------------------------------
create or replace function public.move_task(
  p_task_id uuid,
  p_new_column_id uuid,
  p_new_order int
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_column_id uuid;
  v_board_id uuid;
  v_old_order int;
begin
  select column_id, "order" into v_old_column_id, v_old_order
  from public.tasks where id = p_task_id;
  if v_old_column_id is null then
    raise exception 'Задача не найдена' using errcode = 'P0002';
  end if;

  select board_id into v_board_id from public.columns where id = p_new_column_id;
  if v_board_id is null then
    raise exception 'Целевая колонка не найдена' using errcode = 'P0002';
  end if;
  if not public.can_edit_board(v_board_id) then
    raise exception 'Нет прав на перемещение задачи' using errcode = '42501';
  end if;

  if v_old_column_id = p_new_column_id and v_old_order = p_new_order then
    return;
  end if;

  update public.tasks
  set "order" = "order" + 1
  where column_id = p_new_column_id
    and id <> p_task_id
    and "order" >= p_new_order;

  update public.tasks
  set column_id = p_new_column_id,
      "order" = p_new_order,
      updated_at = now()
  where id = p_task_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Сброс кеша PostgREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';
