-- =====================================================================
-- IDEA-MANAGER: Инициализация базы данных (Supabase / PostgreSQL)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ТАБЛИЦЫ
-- ---------------------------------------------------------------------

-- 1.1. Профили пользователей
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 1.2. Доски
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 1.3. Колонки
create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

-- 1.4. Задачи
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.columns(id) on delete cascade,
  title text not null,
  description text,
  deadline timestamptz,
  done boolean not null default false,
  paused boolean not null default false,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 1.5. Метки
create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  color text not null,
  created_at timestamptz not null default now()
);

-- 1.6. Подзадачи
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

-- 1.7. Участники досок
create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')) default 'viewer',
  created_at timestamptz not null default now(),
  unique(board_id, user_id)
);

-- ---------------------------------------------------------------------
-- 2. ИНДЕКСЫ
-- ---------------------------------------------------------------------
create index if not exists idx_boards_owner on public.boards(owner_id);
create index if not exists idx_columns_board on public.columns(board_id);
create index if not exists idx_tasks_column on public.tasks(column_id);
create index if not exists idx_labels_task on public.labels(task_id);
create index if not exists idx_subtasks_task on public.subtasks(task_id);
create index if not exists idx_board_members_board on public.board_members(board_id);
create index if not exists idx_board_members_user on public.board_members(user_id);

-- ---------------------------------------------------------------------
-- 3. ФУНКЦИИ И ТРИГГЕРЫ
-- ---------------------------------------------------------------------

-- 3.1. Автосоздание 3 досок при регистрации (My Tracks, Companies, Projects)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
   -- 1. Создаем профиль
  insert into public.profiles (id, email)
  values (new.id, new.email);

   -- 2. Создаем доски
  insert into public.boards (owner_id, title, description)
  values
    (new.id, 'My Tracks', 'Личные задачи'),
    (new.id, 'Companies', 'Проекты компаний'),
    (new.id, 'Projects', 'Рабочие проекты');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3.2. Автоматическое добавление владельца в board_members при создании доски
create or replace function public.handle_new_board()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

drop trigger if exists on_board_created on public.boards;
create trigger on_board_created
  after insert on public.boards
  for each row execute procedure public.handle_new_board();

-- 3.3. Безопасные функции для проверки доступа
-- Функция: является ли пользователь участником доски (любая роль)
create or replace function public.has_board_access(target_board_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.board_members
    where board_id = target_board_id
      and user_id = auth.uid()
  );
$$;

-- Функция: может ли пользователь редактировать (owner или editor)
create or replace function public.can_edit_board(target_board_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.board_members
    where board_id = target_board_id
      and user_id = auth.uid()
      and role in ('owner', 'editor')
  );
$$;

-- Функция: является ли пользователь владельцем доски
create or replace function public.is_board_owner(target_board_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.boards
    where id = target_board_id
      and owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- 4. RLS (ROW LEVEL SECURITY)
-- ---------------------------------------------------------------------

-- 4.1. Включаем RLS на всех таблицах
alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;
alter table public.labels enable row level security;
alter table public.subtasks enable row level security;
alter table public.board_members enable row level security;

-- 4.2. Политики для profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using ( auth.uid() = id );
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check ( auth.uid() = id );

-- 4.3. Политики для boards
drop policy if exists "Users can create own boards" on public.boards;
create policy "Users can create own boards" on public.boards for insert with check ( auth.uid() = owner_id );

drop policy if exists "Users can view accessible boards" on public.boards;
create policy "Users can view accessible boards" on public.boards for select using ( public.has_board_access(id) );

drop policy if exists "Owners can update own boards" on public.boards;
create policy "Owners can update own boards" on public.boards for update using ( auth.uid() = owner_id );

drop policy if exists "Owners can delete own boards" on public.boards;
create policy "Owners can delete own boards" on public.boards for delete using ( auth.uid() = owner_id );

-- 4.4. Политики для columns
drop policy if exists "Users can view columns of accessible boards" on public.columns;
create policy "Users can view columns of accessible boards" on public.columns for select using ( public.has_board_access(board_id) );

drop policy if exists "Editors can create columns" on public.columns;
create policy "Editors can create columns" on public.columns for insert with check ( public.can_edit_board(board_id) );

drop policy if exists "Editors can update columns" on public.columns;
create policy "Editors can update columns" on public.columns for update using ( public.can_edit_board(board_id) );

drop policy if exists "Editors can delete columns" on public.columns;
create policy "Editors can delete columns" on public.columns for delete using ( public.can_edit_board(board_id) );

-- 4.5. Политики для tasks
drop policy if exists "Users can view tasks of accessible boards" on public.tasks;
create policy "Users can view tasks of accessible boards" on public.tasks for select using (
  exists (
    select 1 from public.columns
    where columns.id = tasks.column_id
      and public.has_board_access(columns.board_id)
  )
);

drop policy if exists "Editors can create tasks" on public.tasks;
create policy "Editors can create tasks" on public.tasks for insert with check (
  exists (
    select 1 from public.columns
    where columns.id = tasks.column_id
      and public.can_edit_board(columns.board_id)
  )
);

drop policy if exists "Editors can update tasks" on public.tasks;
create policy "Editors can update tasks" on public.tasks for update using (
  exists (
    select 1 from public.columns
    where columns.id = tasks.column_id
      and public.can_edit_board(columns.board_id)
  )
);

drop policy if exists "Editors can delete tasks" on public.tasks;
create policy "Editors can delete tasks" on public.tasks for delete using (
  exists (
    select 1 from public.columns
    where columns.id = tasks.column_id
      and public.can_edit_board(columns.board_id)
  )
);

-- 4.6. Политики для labels (Теперь БЕЗОПАСНО!)
drop policy if exists "Users can view labels of accessible tasks" on public.labels;
create policy "Users can view labels of accessible tasks"
on public.labels for select using (
  exists (
    select 1 from public.tasks
    join public.columns on columns.id = tasks.column_id
    where tasks.id = labels.task_id
      and public.has_board_access(columns.board_id)
  )
);

drop policy if exists "Editors can insert labels" on public.labels;
create policy "Editors can insert labels"
on public.labels for insert with check (
  exists (
    select 1 from public.tasks
    join public.columns on columns.id = tasks.column_id
    where tasks.id = labels.task_id
      and public.can_edit_board(columns.board_id)
  )
);

drop policy if exists "Editors can delete labels" on public.labels;
create policy "Editors can delete labels"
on public.labels for delete using (
  exists (
    select 1 from public.tasks
    join public.columns on columns.id = tasks.column_id
    where tasks.id = labels.task_id
      and public.can_edit_board(columns.board_id)
  )
);

-- 4.7. Политики для subtasks (Теперь БЕЗОПАСНО!)
drop policy if exists "Users can view subtasks of accessible tasks" on public.subtasks;
create policy "Users can view subtasks of accessible tasks"
on public.subtasks for select using (
  exists (
    select 1 from public.tasks
    join public.columns on columns.id = tasks.column_id
    where tasks.id = subtasks.task_id
      and public.has_board_access(columns.board_id)
  )
);

drop policy if exists "Editors can insert subtasks" on public.subtasks;
create policy "Editors can insert subtasks"
on public.subtasks for insert with check (
  exists (
    select 1 from public.tasks
    join public.columns on columns.id = tasks.column_id
    where tasks.id = subtasks.task_id
      and public.can_edit_board(columns.board_id)
  )
);

drop policy if exists "Editors can update subtasks" on public.subtasks;
create policy "Editors can update subtasks"
on public.subtasks for update using (
  exists (
    select 1 from public.tasks
    join public.columns on columns.id = tasks.column_id
    where tasks.id = subtasks.task_id
      and public.can_edit_board(columns.board_id)
  )
);

drop policy if exists "Editors can delete subtasks" on public.subtasks;
create policy "Editors can delete subtasks"
on public.subtasks for delete using (
  exists (
    select 1 from public.tasks
    join public.columns on columns.id = tasks.column_id
    where tasks.id = subtasks.task_id
      and public.can_edit_board(columns.board_id)
  )
);

-- 4.8. Политики для board_members
drop policy if exists "Users can view members of accessible boards" on public.board_members;
create policy "Users can view members of accessible boards" on public.board_members for select using ( public.has_board_access(board_id) );

drop policy if exists "Owners can insert board members" on public.board_members;
create policy "Owners can insert board members" on public.board_members for insert with check ( public.is_board_owner(board_id) );

drop policy if exists "Owners can update board members" on public.board_members;
create policy "Owners can update board members" on public.board_members for update using ( public.is_board_owner(board_id) );

drop policy if exists "Owners can delete board members" on public.board_members;
create policy "Owners can delete board members" on public.board_members for delete using ( public.is_board_owner(board_id) );

-- ---------------------------------------------------------------------
-- 5. ФИНАЛЬНЫЙ СБРОС КЕША
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';
