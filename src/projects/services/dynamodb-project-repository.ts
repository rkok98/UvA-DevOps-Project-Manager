import { Project } from '../models/project';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ProjectRepository } from './project-repository';

export class DynamodbProjectRepository implements ProjectRepository {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;

  constructor(region: string, tableName: string) {
    this.client = new DynamoDBClient({ region });
    this.tableName = tableName;
  }

  async createProject(project: Project): Promise<void> {
    const putRequest = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(project),
    });

    return this.client.send(putRequest).then();
  }
  async getProject(id: string): Promise<Project> {
    throw new Error('Get project not implemented');
  }

  async deleteProject(project: Project): Promise<void> {
    throw new Error('Delete project not implemented');
  }

  async updateProject(project: Project): Promise<void> {
    throw new Error('Update project not implemented');
  }
}
