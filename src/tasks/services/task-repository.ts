// The task repository interface with allowed actions for tasks in the table.
import { Task } from '../models/task';

export interface TaskRepository {
  getTask(id: string): Promise<Task | null>;
  createTask(task: Task): Promise<void>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
