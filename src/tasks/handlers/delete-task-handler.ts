import { APIGatewayProxyHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { HttpResponse } from '../../util/http-response';
import { TaskRepository } from '../services/task-repository';
import { DynamodbTaskRepository } from '../services/dynamodb-task-repository';

const logger = new Logger({ serviceName: 'deleteTask' });

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

  const projectId = event.pathParameters?.project_id;
  if (!projectId) {
    logger.error('Project id cannot be empty');
    return HttpResponse.badRequest('Project id cannot be empty');
  }

  const taskId = event.pathParameters?.task_id;
  if (!taskId) {
    logger.error('Task id cannot be empty');
    return HttpResponse.badRequest('Task id cannot be empty');
  }

  const taskRepository: TaskRepository = new DynamodbTaskRepository(
      region,
      tableName
  );

  const task = await taskRepository.getTask(taskId);

  if (task?.adminId !== accountId) {
    return HttpResponse.unauthorized(
        'Unauthorized to remove this project as you do not belong to this project'
    );
  }

  return taskRepository
    .deleteTask(taskId)
    .then(() => HttpResponse.accepted())
    .catch((error: Error) => {
      logger.error(error.message);
      return HttpResponse.internalServerError(error.message);
    });
};
