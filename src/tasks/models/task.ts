// The task object model, i.e., format of a new task.
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dateTime: string;
  createdBy: string;
  adminId: string;
  state: string;
}
