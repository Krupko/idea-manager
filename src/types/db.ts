// Типы данных приходящих из Supabase
export interface DbBoard {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DbColumn {
  id: string;
  board_id: string;
  title: string;
  order: number;
  created_at: string;
}

export interface DbTask {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  done: boolean;
  paused: boolean;
  order: number;
  created_at: string;
  update_at: string | null;
}

export interface DbLabel {
  id: string;
  task_id: string;
  color: string;
  created_at: string;
}

export interface DbSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order: number;
  created_at: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string | null;
  deadline: string | null;
  done: boolean;
  paused: boolean;
  order: number;
}
