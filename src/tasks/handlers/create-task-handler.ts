import { APIGatewayProxyHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { HttpResponse } from '../../util/http-response';
import { randomUUID } from 'crypto';
import { CreateTaskBody } from '../models/create-task-body';
import { Task } from '../models/task';
import { TaskRepository } from '../services/task-repository';
import { DynamodbTaskRepository } from '../services/dynamodb-task-repository';

const logger = new Logger({ serviceName: 'createTask' });

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.addPersistentLogAttributes({ body: event.body });

  const region = process.env.AWS_REGION;
  const tableName = process.env.DYNAMODB_TABLE_NAME;

  if (!region) {
    logger.error('AWS_REGION was not specified in the environment variables');
    return HttpResponse.internalServerError(
      'AWS_REGION was not specified in the environment variables'
    );
  }

  if (!tableName) {
    logger.error(
      'DYNAMODB_TABLE_NAME was not specified in the environment variables'
    );
    return HttpResponse.internalServerError(
      'DYNAMODB_TABLE_NAME was not specified in the environment variables'
    );
  }

  if (!event.requestContext.authorizer?.claims?.sub) {
    logger.error('No provided sub', {
      authorizer: event.requestContext.authorizer,
    });
    return HttpResponse.internalServerError('Something went wrong');
  }

  const accountId = event.requestContext.authorizer?.claims?.sub as string;
  logger.addPersistentLogAttributes({
    accountId: accountId,
  });

  if (!event.body) {
    logger.error('Request body cannot be empty');
    return HttpResponse.badRequest('Request body cannot be empty');
  }

  const projectIdPath = event.pathParameters?.project_id;
  if (!projectIdPath) {
    logger.error('Project id cannot be empty');
    return HttpResponse.badRequest('Project id cannot be empty');
  }

  const { title, description, dateTime, createdBy } = JSON.parse(event.body) as CreateTaskBody;
  const task: Task = {
    id: randomUUID(),
    projectId: projectIdPath,
    title,
    description,
    dateTime,
    createdBy,
  };

  const taskRepository: TaskRepository = new DynamodbTaskRepository(
    region,
    tableName
  );

  return taskRepository
    .createTask(task)
    .then(() => HttpResponse.created())
    .catch((error: Error) => {
      logger.error(error.message);
      return HttpResponse.internalServerError(error.message);
    });
};
