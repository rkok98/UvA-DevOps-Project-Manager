import { Project } from '../models/project';

export interface ProjectRepository {
  getProject(id: string): Promise<Project>;
  createProject(project: Project): Promise<void>;
  updateProject(project: Project): Promise<void>;
  deleteProject(project: Project): Promise<void>;
}
