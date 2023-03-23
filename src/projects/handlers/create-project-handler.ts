import middy from '@middy/core';

import { randomUUID } from 'crypto';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';

import { ProjectRepository } from '../services/project-repository';
import { HttpResponse } from '../../http-util/http-response';
import { DynamodbProjectRepository } from '../services/dynamodb-project-repository';
import { CreateProjectBody } from '../models/create-project-body';
import { Project } from '../models/project';

const serviceName = 'createProject';

const logger = new Logger({ serviceName });
const tracer = new Tracer({ serviceName });

/**
 * Creates a new project
 * @param event The API Gateway event
 * @returns The API Gateway response
 */
const lambdaHandler: APIGatewayProxyHandler = async (event) => {
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

  const accountId = event.requestContext.authorizer?.claims?.sub as string;

  if (!accountId) {
    logger.error('No provided sub', {
      authorizer: event.requestContext.authorizer,
    });
    return HttpResponse.internalServerError('Something went wrong');
  }

  logger.addPersistentLogAttributes({
    accountId: accountId,
  });

  if (!event.body) {
    logger.error('Request body cannot be empty');
    return HttpResponse.badRequest('Request body cannot be empty');
  }

  const { name, description } = JSON.parse(event.body) as CreateProjectBody;
  const project: Project = {
    id: randomUUID(),
    adminId: accountId,
    name,
    description,
  };

  const projectRepository: ProjectRepository = new DynamodbProjectRepository(
    region,
    tableName,
    tracer
  );

  return projectRepository
    .createProject(project)
    .then(() => HttpResponse.created())
    .catch((error: Error) => {
      logger.error(error.message);
      return HttpResponse.internalServerError(error.message);
    });
};

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));

export default handler;
