
export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export enum FilterType {
  ALL = 'ALL',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  tags: string[];
}
