// Handlers for API requests regarding project table.
import { APIGatewayProxyHandler } from 'aws-lambda';
import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger';
import { Task } from '../models/task';
import { TaskRepository } from '../services/task-repository';
import { HttpResponse } from '../../http-util/http-response';
import { DynamodbTaskRepository } from '../services/dynamodb-task-repository';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';
import middy from '@middy/core';

const serviceName = 'getTask';

const logger = new Logger({ serviceName });
const tracer = new Tracer({ serviceName });

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
  logger.addPersistentLogAttributes({ body: event.body });

  const region = process.env.AWS_REGION;
  const tableName = process.env.DYNAMODB_TABLE_NAME;

  // Error handling: HTTP messages
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

  if (!event.pathParameters) {
    logger.error('Path parameters cannot be null');
    return HttpResponse.badRequest('Path parameters cannot be null');
  }

  if (!event.requestContext.authorizer?.claims?.sub) {
    logger.error('No provided sub', {
      authorizer: event.requestContext.authorizer,
    });
    return HttpResponse.internalServerError('Something went wrong');
  }

  // Handle valid requests
  // Note: project_id from CDK projectsIdResource
  const taskID = event.pathParameters?.task_id;

  if (!taskID) {
    logger.error('Task ID must be specified');
    return HttpResponse.badRequest('Task ID must be specified');
  }

  const taskRepository: TaskRepository = new DynamodbTaskRepository(
    region,
    tableName,
    tracer
  );

  return taskRepository
    .getTask(taskID)
    .then((task: Task | null) => {
      return HttpResponse.ok(task);
    })
    .catch((error: Error) => {
      logger.error(error.message);
      return HttpResponse.internalServerError(error.message);
    });
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));

export default handler;
