import { APIGatewayProxyHandler } from 'aws-lambda';
import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger';
import { HttpResponse } from '../../http-util/http-response';
import { Task } from '../models/task';
import { TaskRepository } from '../services/task-repository';
import { DynamodbTaskRepository } from '../services/dynamodb-task-repository';
import middy from '@middy/core';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';

const serviceName = 'updateTask';

const logger = new Logger({ serviceName });
const tracer = new Tracer({ serviceName });

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
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
    logger.error('Project id cannot be empty');
    return HttpResponse.badRequest('Task id cannot be empty');
  }

  if (!event.body) {
    logger.error('Request body cannot be empty');
    return HttpResponse.badRequest('Request body cannot be empty');
  }

  const task = JSON.parse(event.body) as Task;
  task.id = taskId;
  task.projectId = projectId;
  task.adminId = accountId;
  task.createdBy = accountId;
  task.dateTime = Date.now().toString();

  const taskRepository: TaskRepository = new DynamodbTaskRepository(
    region,
    tableName,
    tracer
  );

  return taskRepository
    .updateTask(task)
    .then(() => HttpResponse.noContent())
    .catch((error: Error) => {
      logger.error(error.message);
      return HttpResponse.internalServerError(error.message);
    });
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));

export default handler;
