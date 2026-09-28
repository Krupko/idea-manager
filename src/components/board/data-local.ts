import type { Column as ColumnType } from './types.ts';

export const DEFAULT_COLUMNS: ColumnType[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      {
        id: '1',
        title: 'Task 1',
        description:
          'Lorem ipson dolou sit amet Lorem ipson dolou sit amet Lorem ipson dolou sit amet',
        labels: [{ id: 'l1', color: '#ef4444' }],
        deadline: '2026-03-25',
        done: false,
        paused: false,
        createdAt: '2026-09-28',
        subtasks: [
          { id: 's1', title: 'Subtask 1', completed: true },
          { id: 's2', title: 'Subtask 2', completed: false },
          { id: 's3', title: 'Subtask 3', completed: true },
          { id: 's4', title: 'Subtask 4', completed: false },
          { id: 's5', title: 'Subtask 5', completed: true },
          { id: 's6', title: 'Subtask 6', completed: false },
          { id: 's7', title: 'Subtask 7', completed: true },
          { id: 's8', title: 'Subtask 8', completed: false },
        ],
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Some text goes here',
        labels: [],
        done: false,
        paused: false,
        createdAt: '2026-09-28',
        subtasks: [],
      },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: '3',
        title: 'Tssk',
        description: 'Some todo false goes',
        labels: [
          { id: 'l2', color: '#ef4444' },
          { id: 'l3', color: '#9ca3af' },
        ],
        deadline: '2026-04-21',
        done: false,
        paused: false,
        createdAt: '2026-09-28',
        subtasks: [],
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      {
        id: '4',
        title: 'Task',
        description: 'Some elementName sjlkjljl',
        labels: [
          { id: 'l4', color: '#f97316' },
          { id: 'l5', color: '#9ca3af' },
        ],
        done: false,
        paused: false,
        createdAt: '2026-09-28',
        subtasks: [],
      },
    ],
  },
  {
    id: 'completed',
    title: 'Completed',
    tasks: [
      {
        id: '5',
        title: 'Task',
        description: 'Some false ca3af goes subtasks',
        labels: [],
        done: true,
        paused: false,
        createdAt: '2026-09-28',
        subtasks: [
          { id: 's1', title: 'Subtask 1', completed: true },
          { id: 's2', title: 'Subtask 2', completed: false },
        ],
      },
    ],
  },
];
