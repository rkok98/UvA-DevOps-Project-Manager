// The project repository interface with allowed actions for projects in the table.
import { Project } from '../models/project';

export interface ProjectRepository {
  getProject(id: string): Promise<Project | null>;
  getProjectsByAdminId(userId: string): Promise<Project[]>;
  createProject(project: Project): Promise<void>;
  updateProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
}
