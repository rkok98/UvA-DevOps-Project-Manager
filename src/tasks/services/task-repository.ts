import { Task } from '../models/task';

export interface TaskRepository {
  /**
   * Gets a task by its ID.
   * @param id - The ID of the task to get.
   * @returns A promise that resolves to the task with the specified ID, or null if the task does not exist.
   */
  getTask(id: string): Promise<Task | null>;

  /**
   * Gets all tasks for a given project.
   * @param id - The ID of the project to get tasks for.
   * @returns A promise that resolves to an array of tasks belonging to the specified project.
   */
  getTasksByProjectId(id: string): Promise<Task[]>;

  /**
   * Creates a new task in the repository.
   * @param task - The task to create.
   * @returns A promise that resolves when the task has been created.
   */
  createTask(task: Task): Promise<void>;

  /**
   * Updates an existing task in the repository.
   * @param task - The task to update.
   * @returns A promise that resolves when the task has been updated.
   */
  updateTask(task: Task): Promise<void>;

  /**
   * Deletes a task from the repository.
   * @param id - The ID of the task to delete.
   * @returns A promise that resolves when the task has been deleted.
   */
  deleteTask(id: string): Promise<void>;
}
