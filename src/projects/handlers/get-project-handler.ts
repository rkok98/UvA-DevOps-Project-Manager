// Handlers for API requests regarding project table.
import { APIGatewayProxyHandler } from 'aws-lambda';
import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger';
import { Project } from '../models/project';
import { ProjectRepository } from '../services/project-repository';
import { HttpResponse } from '../../http-util/http-response';
import { DynamodbProjectRepository } from '../services/dynamodb-project-repository';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';
import middy from '@middy/core';

const serviceName = 'getProject';

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

  const projectID = event.pathParameters?.project_id;

  if (!projectID) {
    logger.error('Project ID cannot be empty');
    return HttpResponse.badRequest('Project ID cannot be empty');
  }

  const projectRepository: ProjectRepository = new DynamodbProjectRepository(
    region,
    tableName,
    tracer
  );

  return projectRepository
    .getProject(projectID)
    .then((project: Project | null) => {
      if (project && project.adminId === accountId) {
        return HttpResponse.ok(project);
      }

      return HttpResponse.notFound();
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
