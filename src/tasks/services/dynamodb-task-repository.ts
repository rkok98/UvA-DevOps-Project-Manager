// The DynamoDB database repository:
// Table of tasks in the DB.
// Handling of creating, getting, updating, and deleting tasks in the table.
import { DeleteItemCommand, DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { TaskRepository } from './task-repository';
import { Task } from '../models/task';

export class DynamodbTaskRepository implements TaskRepository {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;

  constructor(region: string, tableName: string) {
    this.client = new DynamoDBClient({ region });
    this.tableName = tableName;
  }

  async createTask(task: Task): Promise<void> {
    const putRequest = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(task),
    });

    return this.client.send(putRequest).then();
  }

  async getTask(id: string): Promise<Task | null> {
    const getRequest = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ id: id }),
    });

    const response = await this.client.send(getRequest);

    if (!response.Item) return null;

    return unmarshall(response.Item) as Task;
  }

  async deleteTask(id: string): Promise<void> {
    const deleteRequest = new DeleteItemCommand(
        {
          TableName: this.tableName,
          Key: {
            id: {
              S: id
            }
          }
        }
    );

    return this.client.send(deleteRequest).then();
  }

  async updateTask(task: Task): Promise<void> {
    const putRequest = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(task),
    });

    return this.client.send(putRequest).then();
  }
}