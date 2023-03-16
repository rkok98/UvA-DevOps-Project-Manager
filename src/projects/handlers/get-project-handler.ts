// Handlers for API requests regarding project table.
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Project } from '../models/project';
import { ProjectRepository } from '../services/project-repository';
import { HttpResponse } from '../../util/http-response';
import { DynamodbProjectRepository } from '../services/dynamodb-project-repository';

const logger = new Logger({ serviceName: 'getProject' });

export const handler: APIGatewayProxyHandler = async (event) => {
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

  const accountId = event.requestContext.authorizer?.claims?.sub as string;
  logger.addPersistentLogAttributes({
    accountId: accountId,
  });

  // Handle valid requests
  // Note: project_id from CDK projectsIdResource
  const projectID = event.pathParameters?.project_id;

  if (!projectID) {
    logger.error('ID must be specified');
    return HttpResponse.badRequest('ID must be specified');
  }

  // Create an instance of DynamodbProjectRepository to interact with the DynamoDB table
  const projectRepository: ProjectRepository = new DynamodbProjectRepository(
    region,
    tableName
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
