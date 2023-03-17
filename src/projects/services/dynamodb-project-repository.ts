// The DynamoDB database repository:
// Table of projects in the DB.
// Handling of creating, getting, updating, and deleting projects in the table.
import { Project } from '../models/project';
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ProjectRepository } from './project-repository';

export class DynamodbProjectRepository implements ProjectRepository {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;

  constructor(region: string, tableName: string) {
    this.client = new DynamoDBClient({ region });
    this.tableName = tableName;
  }

  // Creates a new project object in table
  async createProject(project: Project): Promise<void> {
    const putRequest = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(project),
    });

    return this.client.send(putRequest).then();
  }

  // Obtains an existing project from table according to id
  async getProject(id: string): Promise<Project | null> {
    const getRequest = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ id: id }),
    });

    const response = await this.client.send(getRequest);

    if (!response.Item) return null;

    return unmarshall(response.Item) as Project;
  }

  // Deletes a specific existing project from table
  async deleteProject(id: string): Promise<void> {
    const deleteRequest = new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        id: {
          S: id,
        },
      },
    });

    return this.client.send(deleteRequest).then();
  }

  // Updates a specific existing project from table (body: title, description)
  async updateProject(project: Project): Promise<void> {
    const putRequest = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(project),
    });

    return this.client.send(putRequest).then();
  }

  async getProjectsByAdminId(userId: string): Promise<Project[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: '#adminId = :adminId',
      ExpressionAttributeNames: {
        '#adminId': 'adminId',
      },
      ExpressionAttributeValues: {
        ':adminId': {
          S: userId,
        },
      },
    });

    const response = await this.client.send(command);

    return (
      response.Items?.map((response) => unmarshall(response) as Project) ?? []
    );
  }
}
