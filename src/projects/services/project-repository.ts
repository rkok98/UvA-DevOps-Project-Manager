// The project repository interface with allowed actions for projects in the table.
import { Project } from '../models/project';

export interface ProjectRepository {
  /**
   * Gets a project from the table
   * @param id The id of the project to get
   * @returns The project or null if not found
   */
  getProject(id: string): Promise<Project | null>;

  /**
   * Gets all projects from the table
   * @param userId The admin id
   * @returns The projects
   */
  getProjectsByAdminId(userId: string): Promise<Project[]>;

  /**
   * Creates a new project in the table
   * @param project The project to create
   */
  createProject(project: Project): Promise<void>;

  /**
   * Updates a project in the table
   * @param project The project to update
   */
  updateProject(project: Project): Promise<void>;

  /**
   * Deletes a project from the table
   * @param id The id of the project to delete
   */
  deleteProject(id: string): Promise<void>;
}
