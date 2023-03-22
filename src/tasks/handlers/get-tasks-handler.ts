import { APIGatewayProxyHandler } from 'aws-lambda';
import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger';
import { TaskRepository } from '../services/task-repository';
import { HttpResponse } from '../../util/http-response';
import { DynamodbTaskRepository } from '../services/dynamodb-task-repository';
import middy from '@middy/core';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';

const serviceName = 'getTasks';

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

  // Create an instance of DynamodbProjectRepository to interact with the DynamoDB table
  const taskRepository: TaskRepository = new DynamodbTaskRepository(
    region,
    tableName,
    tracer
  );

  return taskRepository
    .getTasksByProjectId(projectId)
    .then((tasks) => HttpResponse.ok(tasks))
    .catch((error: Error) => {
      logger.error(error.message);
      return HttpResponse.internalServerError(error.message);
    });
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));

export default handler;
