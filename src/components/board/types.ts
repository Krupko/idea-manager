export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Label {
  id: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  labels: Label[];
  deadline?: string;
  done: boolean;
  subtasks: Subtask[];
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}
