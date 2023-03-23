import { APIGatewayProxyHandler } from 'aws-lambda';
import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger';
import { HttpResponse } from '../../http-util/http-response';
import { TaskRepository } from '../services/task-repository';
import { DynamodbTaskRepository } from '../services/dynamodb-task-repository';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';
import middy from '@middy/core';

const serviceName = 'deleteTask';

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

  const projectId = event.pathParameters?.project_id;
  if (!projectId) {
    logger.error('Project ID cannot be empty');
    return HttpResponse.badRequest('Project ID cannot be empty');
  }

  const taskId = event.pathParameters?.task_id;
  if (!taskId) {
    logger.error('Task ID cannot be empty');
    return HttpResponse.badRequest('Task ID cannot be empty');
  }

  const taskRepository: TaskRepository = new DynamodbTaskRepository(
    region,
    tableName,
    tracer
  );

  return taskRepository
    .deleteTask(taskId)
    .then(() => HttpResponse.accepted())
    .catch((error: Error) => {
      logger.error(error.message);
      return HttpResponse.internalServerError(error.message);
    });
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));

export default handler;
